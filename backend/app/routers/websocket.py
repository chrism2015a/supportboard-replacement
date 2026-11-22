import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Conversation, Message
from app.config import ALGORITHM
import jwt
from app.services.conversation_service import create_message
from datetime import datetime, timezone
from typing import Dict, Set

router = APIRouter(tags=["websocket"])

# Store active WebSocket connections
# Key: conversation_id, Value: Set of WebSocket connections
active_connections: Dict[str, Set[WebSocket]] = {}
# Store user to WebSocket mapping
user_connections: Dict[str, WebSocket] = {}


async def get_user_from_ws(websocket: WebSocket) -> User:
    """Extract and validate user from WebSocket connection."""
    token = websocket.query_params.get("token", "")
    if not token:
        await websocket.close(code=4001, reason="No token provided")
        return None

    try:
        payload = jwt.decode(token, "dev-secret-key-change-in-production", algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            await websocket.close(code=4001, reason="Invalid token")
            return None
        return __import__('app.database').database.SessionLocal().query(__import__('app.models').models.User).filter(__import__('app.models').models.User.id == user_id).first()
    except Exception:
        await websocket.close(code=4001, reason="Invalid token")
        return None


@router.websocket("/ws/chat/{conversation_id}")
async def chat_websocket(websocket: WebSocket, conversation_id: str):
    """WebSocket endpoint for real-time chat."""
    # Get user
    user = await get_user_from_ws(websocket)
    if not user:
        return

    await websocket.accept()

    # Verify user has access to conversation
    conv = __import__('app.database').database.SessionLocal().query(__import__('app.models').models.Conversation).filter(__import__('app.models').models.Conversation.id == conversation_id).first()
    if not conv:
        await websocket.close(code=4004, reason="Conversation not found")
        return

    if user.role != "admin" and conv.agent_id != user.id and conv.user_id != user.id:
        await websocket.close(code=4003, reason="Access denied")
        return

    # Register connection
    if conversation_id not in active_connections:
        active_connections[conversation_id] = set()
    active_connections[conversation_id].add(websocket)
    user_connections[user.id] = websocket

    try:
        while True:
            data = await websocket.receive_text()
            try:
                message_data = json.loads(data)
                action = message_data.get("action", "")
                content = message_data.get("content", "")
                msg_type = message_data.get("type", "text")
                sender_id = message_data.get("sender_id", user.id)
                sender_type = message_data.get("sender_type", "agent")

                if action == "send_message" and content:
                    # Save message to database
                    msg = create_message(
                        __import__('app.database').database.SessionLocal(),
                        __import__('app.schemas').schemas.MessageCreate(
                            conversation_id=conversation_id,
                            sender_id=sender_id,
                            sender_type=sender_type,
                            content=content,
                            type=msg_type,
                        )
                    )

                    # Broadcast to all in conversation
                    broadcast_data = json.dumps({
                        "type": "new_message",
                        "message": {
                            "id": msg.id,
                            "conversation_id": msg.conversation_id,
                            "user_id": msg.user_id,
                            "sender_type": msg.sender_type,
                            "content": msg.content,
                            "type": msg.type,
                            "is_read": msg.is_read,
                            "created_at": msg.created_at.isoformat(),
                            "attachments": msg.attachments or [],
                            "metadata": msg.metadata or {},
                            "sender_name": user.name,
                        },
                    })

                    for conn in list(active_connections.get(conversation_id, set())):
                        try:
                            await conn.send_text(broadcast_data)
                        except Exception:
                            active_connections[conversation_id].discard(conn)

                elif action == "typing":
                    # Send typing indicator
                    typing_data = json.dumps({
                        "type": "typing",
                        "user_id": user.id,
                        "user_name": user.name,
                        "is_typing": message_data.get("is_typing", True),
                    })
                    for conn in list(active_connections.get(conversation_id, set())):
                        if conn != websocket:
                            try:
                                await conn.send_text(typing_data)
                            except Exception:
                                pass

                elif action == "read_receipt":
                    # Mark messages as read
                    db = __import__('app.database').database.SessionLocal()
                    __import__('app.services.conversation_service').conversation_service.mark_messages_read(db, conversation_id, user.id)

            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        pass
    finally:
        # Clean up connections
        if conversation_id in active_connections:
            active_connections[conversation_id].discard(websocket)
            if not active_connections[conversation_id]:
                del active_connections[conversation_id]
        user_connections.pop(user.id, None)
