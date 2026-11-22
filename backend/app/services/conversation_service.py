from sqlalchemy.orm import Session
from app.models import Conversation, Message, User, Tag, ConversationTag
from app.schemas import (
    ConversationCreate, ConversationUpdate, ConversationResponse,
    MessageCreate, MessageResponse
)
from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy import or_, func


def get_conversations(
    db: Session,
    user_id: Optional[str] = None,
    agent_id: Optional[str] = None,
    status: Optional[str] = None,
    source: Optional[str] = None,
    department_id: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    search: Optional[str] = None,
    tags: Optional[List[str]] = None,
) -> dict:
    query = db.query(Conversation)

    if user_id:
        query = query.filter(Conversation.user_id == user_id)
    if agent_id:
        query = query.filter(Conversation.agent_id == agent_id)
    if status:
        query = query.filter(Conversation.status == status)
    if source:
        query = query.filter(Conversation.source == source)
    if department_id:
        query = query.filter(Conversation.department_id == department_id)
    if search:
        query = query.filter(
            or_(
                Conversation.subject.ilike(f"%{search}%"),
                Conversation.custom_data.op('->>')('name').ilike(f"%{search}%"),
            )
        )

    total = query.count()
    conversations = (
        query.order_by(Conversation.last_message_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    result = []
    for conv in conversations:
        user = db.query(User).filter(User.id == conv.user_id).first() if conv.user_id else None
        agent = db.query(User).filter(User.id == conv.agent_id).first() if conv.agent_id else None
        last_msg = db.query(Message).filter(
            Message.conversation_id == conv.id
        ).order_by(Message.created_at.desc()).first()

        unread = db.query(Message).filter(
            Message.conversation_id == conv.id,
            Message.is_read == False,
            Message.sender_type != "agent",
        ).count()

        result.append({
            "id": conv.id,
            "user_id": conv.user_id,
            "agent_id": conv.agent_id,
            "department_id": conv.department_id,
            "status": conv.status,
            "source": conv.source,
            "subject": conv.subject,
            "tags": conv.tags or [],
            "custom_data": conv.custom_data or {},
            "started_at": conv.started_at,
            "closed_at": conv.closed_at,
            "last_message_at": conv.last_message_at,
            "queue_position": conv.queue_position,
            "wait_time": conv.wait_time,
            "language": conv.language,
            "user_name": user.name if user else None,
            "agent_name": agent.name if agent else None,
            "last_message_preview": last_msg.content[:100] if last_msg else None,
            "unread_count": unread,
        })

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "conversations": result,
    }


def get_conversation(db: Session, conversation_id: str) -> Optional[Conversation]:
    return db.query(Conversation).filter(Conversation.id == conversation_id).first()


def create_conversation(db: Session, data: ConversationCreate, user_id: Optional[str] = None) -> Conversation:
    conv = Conversation(
        user_id=user_id or data.user_id,
        agent_id=data.agent_id,
        department_id=data.department_id,
        source=data.source.value,
        subject=data.subject,
        tags=data.tags or [],
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return conv


def update_conversation(db: Session, conversation_id: str, data: ConversationUpdate) -> Optional[Conversation]:
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        return None

    if data.agent_id is not None:
        conv.agent_id = data.agent_id
    if data.department_id is not None:
        conv.department_id = data.department_id
    if data.status is not None:
        conv.status = data.status.value if hasattr(data.status, 'value') else data.status
        if conv.status == "closed":
            conv.closed_at = datetime.now(timezone.utc)
    if data.tags is not None:
        conv.tags = data.tags
    if data.subject is not None:
        conv.subject = data.subject

    db.commit()
    db.refresh(conv)
    return conv


def close_conversation(db: Session, conversation_id: str) -> Optional[Conversation]:
    return update_conversation(db, conversation_id, ConversationUpdate(status="closed"))


def create_message(db: Session, data: MessageCreate) -> Message:
    msg = Message(
        conversation_id=data.conversation_id,
        user_id=data.sender_id,
        sender_type=data.sender_type.value if hasattr(data.sender_type, 'value') else data.sender_type,
        content=data.content,
        type=data.type.value if hasattr(data.type, 'value') else data.type,
        attachments=data.attachments or [],
        metadata=data.metadata or {},
    )
    db.add(msg)

    # Update conversation last_message_at
    conv = db.query(Conversation).filter(Conversation.id == data.conversation_id).first()
    if conv:
        conv.last_message_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(msg)
    return msg


def get_messages(
    db: Session,
    conversation_id: str,
    page: int = 1,
    page_size: int = 50,
) -> dict:
    total = db.query(Message).filter(Message.conversation_id == conversation_id).count()
    messages = (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    result = []
    for msg in messages:
        sender = db.query(User).filter(User.id == msg.user_id).first() if msg.user_id else None
        result.append({
            "id": msg.id,
            "conversation_id": msg.conversation_id,
            "user_id": msg.user_id,
            "sender_type": msg.sender_type,
            "content": msg.content,
            "type": msg.type,
            "is_read": msg.is_read,
            "created_at": msg.created_at,
            "updated_at": msg.updated_at,
            "attachments": msg.attachments or [],
            "metadata": msg.metadata or {},
            "sender_name": sender.name if sender else None,
        })

    return {"total": total, "page": page, "page_size": page_size, "messages": result}


def mark_messages_read(db: Session, conversation_id: str, agent_id: str):
    db.query(Message).filter(
        Message.conversation_id == conversation_id,
        Message.sender_type != "agent",
        Message.is_read == False,
    ).update({"is_read": True})
    db.commit()


def create_tag(db: Session, name: str, color: str = "#6b7280") -> Optional[Tag]:
    existing = db.query(Tag).filter(Tag.name == name).first()
    if existing:
        return existing

    tag = Tag(name=name, color=color)
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag


def add_tag_to_conversation(db: Session, conversation_id: str, tag_name: str):
    tag = create_tag(db, tag_name)
    existing = db.query(ConversationTag).filter(
        ConversationTag.conversation_id == conversation_id,
        ConversationTag.tag_id == tag.id,
    ).first()
    if not existing:
        ct = ConversationTag(conversation_id=conversation_id, tag_id=tag.id)
        db.add(ct)
        db.commit()
