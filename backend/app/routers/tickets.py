from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Ticket
from app.schemas import TicketCreate, TicketUpdate, TicketResponse, TicketStatus, TicketPriority
from app.services.ticket_service import (
    get_tickets, get_ticket, create_ticket, update_ticket,
    add_ticket_message, get_ticket_messages
)
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/tickets", tags=["tickets"])


@router.get("", response_model=dict)
def list_tickets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    status: str = Query(None),
    priority: str = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    agent_id = current_user.id if current_user.role in ["admin", "agent"] else None
    user_id = current_user.id if current_user.role == "user" else None

    result = get_tickets(
        db,
        user_id=user_id,
        agent_id=agent_id,
        status=status,
        priority=priority,
        page=page,
        page_size=page_size,
    )
    return result


@router.get("/{ticket_id}", response_model=TicketResponse)
def get_ticket_detail(
    ticket_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = get_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if current_user.role not in ["admin", "agent"] and ticket.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    return ticket


@router.post("", response_model=TicketResponse, status_code=201)
def create_new_ticket(
    data: TicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_id = current_user.id if current_user.role == "user" else data.user_id
    ticket = create_ticket(db, data, user_id=user_id)
    return ticket


@router.put("/{ticket_id}", response_model=TicketResponse)
def update_ticket_route(
    ticket_id: str,
    data: TicketUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == "user":
        raise HTTPException(status_code=403, detail="Access denied")

    ticket = update_ticket(db, ticket_id, data)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket


@router.post("/{ticket_id}/messages", response_model=dict)
def add_message_to_ticket(
    ticket_id: str,
    content: str,
    is_internal: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = get_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    msg = add_ticket_message(db, ticket_id, current_user.id, content, is_internal)
    return msg


@router.get("/{ticket_id}/messages", response_model=list[dict])
def get_ticket_messages_list(
    ticket_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = get_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    messages = get_ticket_messages(db, ticket_id)
    return [
        {
            "id": m.id,
            "user_id": m.user_id,
            "content": m.content,
            "is_internal": m.is_internal,
            "created_at": m.created_at,
        }
        for m in messages
    ]
