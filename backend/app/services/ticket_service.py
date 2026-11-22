from sqlalchemy.orm import Session
from app.models import Ticket, TicketMessage, User
from app.schemas import TicketCreate, TicketUpdate, TicketStatus, TicketPriority
from typing import List, Optional
from datetime import datetime, timezone
import secrets


def generate_ticket_number() -> str:
    return f"TB-{secrets.randbelow(90000) + 10000}"


def get_tickets(
    db: Session,
    user_id: Optional[str] = None,
    agent_id: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
) -> dict:
    query = db.query(Ticket)

    if user_id:
        query = query.filter(Ticket.user_id == user_id)
    if agent_id:
        query = query.filter(Ticket.agent_id == agent_id)
    if status:
        query = query.filter(Ticket.status == status)
    if priority:
        query = query.filter(Ticket.priority == priority)

    total = query.count()
    tickets = (
        query.order_by(Ticket.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    result = []
    for t in tickets:
        user = db.query(User).filter(User.id == t.user_id).first() if t.user_id else None
        agent = db.query(User).filter(User.id == t.agent_id).first() if t.agent_id else None
        result.append({
            "id": t.id,
            "ticket_number": t.ticket_number,
            "user_id": t.user_id,
            "agent_id": t.agent_id,
            "department_id": t.department_id,
            "status": t.status,
            "priority": t.priority,
            "subject": t.subject,
            "category": t.category,
            "created_at": t.created_at,
            "updated_at": t.updated_at,
            "closed_at": t.closed_at,
            "user_name": user.name if user else None,
            "agent_name": agent.name if agent else None,
        })

    return {"total": total, "page": page, "page_size": page_size, "tickets": result}


def get_ticket(db: Session, ticket_id: str) -> Optional[Ticket]:
    return db.query(Ticket).filter(Ticket.id == ticket_id).first()


def create_ticket(db: Session, data: TicketCreate, user_id: Optional[str] = None) -> Ticket:
    ticket = Ticket(
        ticket_number=generate_ticket_number(),
        user_id=user_id or data.user_id,
        department_id=data.department_id,
        subject=data.subject,
        description=data.description,
        category=data.category,
        priority=data.priority.value if hasattr(data.priority, 'value') else data.priority,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket


def update_ticket(db: Session, ticket_id: str, data: TicketUpdate) -> Optional[Ticket]:
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        return None

    if data.agent_id is not None:
        ticket.agent_id = data.agent_id
    if data.status is not None:
        ticket.status = data.status.value if hasattr(data.status, 'value') else data.status
        if ticket.status == "closed":
            ticket.closed_at = datetime.now(timezone.utc)
    if data.priority is not None:
        ticket.priority = data.priority.value if hasattr(data.priority, 'value') else data.priority
    if data.category is not None:
        ticket.category = data.category

    db.commit()
    db.refresh(ticket)
    return ticket


def add_ticket_message(db: Session, ticket_id: str, user_id: str, content: str, is_internal: bool = False) -> TicketMessage:
    msg = TicketMessage(
        ticket_id=ticket_id,
        user_id=user_id,
        content=content,
        is_internal=is_internal,
    )
    db.add(msg)

    # Update ticket
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if ticket:
        ticket.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(msg)
    return msg


def get_ticket_messages(db: Session, ticket_id: str):
    return db.query(TicketMessage).filter(
        TicketMessage.ticket_id == ticket_id
    ).order_by(TicketMessage.created_at.asc()).all()
