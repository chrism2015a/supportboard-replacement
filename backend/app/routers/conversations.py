from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import ConversationCreate, ConversationUpdate, ConversationResponse, ConversationListResponse
from app.services.conversation_service import (
    get_conversations, get_conversation, create_conversation,
    update_conversation, close_conversation
)
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/conversations", tags=["conversations"])


@router.get("", response_model=ConversationListResponse)
def list_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    status: str = Query(None),
    source: str = Query(None),
    department_id: str = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str = Query(None),
):
    agent_id = current_user.id if current_user.role in ["admin", "agent"] else None
    user_id = current_user.id if current_user.role == "user" else None

    result = get_conversations(
        db,
        user_id=user_id,
        agent_id=agent_id,
        status=status,
        source=source,
        department_id=department_id,
        page=page,
        page_size=page_size,
        search=search,
    )
    return result


@router.get("/{conversation_id}", response_model=ConversationResponse)
def get_conversation_detail(
    conversation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conv = get_conversation(db, conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Only agent, admin, or the user in the conversation can access
    if current_user.role in ["agent", "admin"]:
        pass
    elif conv.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    return conv


@router.post("", response_model=ConversationResponse, status_code=201)
def create_new_conversation(
    data: ConversationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_id = current_user.id if current_user.role == "user" else data.user_id
    conv = create_conversation(db, data, user_id=user_id)
    return conv


@router.put("/{conversation_id}", response_model=ConversationResponse)
def update_conversation_route(
    conversation_id: str,
    data: ConversationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Only admin/agent can update conversations
    if current_user.role == "user":
        raise HTTPException(status_code=403, detail="Access denied")

    conv = update_conversation(db, conversation_id, data)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv


@router.post("/{conversation_id}/close", response_model=ConversationResponse)
def close_conversation_route(
    conversation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == "user":
        raise HTTPException(status_code=403, detail="Access denied")

    conv = close_conversation(db, conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv


@router.delete("/{conversation_id}")
def delete_conversation(
    conversation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models import Conversation
    if current_user.role not in ["admin"]:
        raise HTTPException(status_code=403, detail="Only admins can delete conversations")

    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    db.delete(conv)
    db.commit()
    return {"message": "Conversation deleted"}
