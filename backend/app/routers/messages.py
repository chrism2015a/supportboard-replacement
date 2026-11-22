from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Conversation
from app.schemas import MessageCreate, MessageResponse
from app.services.conversation_service import create_message, get_messages, mark_messages_read
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/messages", tags=["messages"])


@router.get("/conversation/{conversation_id}", response_model=list[MessageResponse])
def list_messages(
    conversation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
):
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Only participants can access messages
    if current_user.role != "admin" and conv.agent_id != current_user.id and conv.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    mark_messages_read(db, conversation_id, current_user.id)
    result = get_messages(db, conversation_id, page=page, page_size=page_size)
    return result["messages"]


@router.post("", response_model=MessageResponse, status_code=201)
def send_message(
    data: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conv = db.query(Conversation).filter(Conversation.id == data.conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Verify access
    if current_user.role != "admin" and conv.agent_id != current_user.id and conv.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    msg = create_message(db, data)

    # Update conversation last_message_at
    conv.last_message_at = __import__("datetime").datetime.now(__import__("datetime").timezone.utc)
    db.commit()

    return msg
