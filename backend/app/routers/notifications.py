from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Notification
from app.schemas import NotificationResponse, NotificationCreate
from app.services.notification_service import (
    create_notification, get_user_notifications,
    mark_notification_read, mark_all_notifications_read,
    get_unread_count,
)
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationResponse])
def list_notifications(
    limit: int = 50,
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_user_notifications(
        db, current_user.id, limit=limit, unread_only=unread_only
    )


@router.get("/unread-count", response_model=dict)
def unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return {"count": get_unread_count(db, current_user.id)}


@router.put("/{notification_id}/read")
def mark_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    mark_notification_read(db, notification_id)
    return {"message": "Notification marked as read"}


@router.put("/read-all")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    mark_all_notifications_read(db, current_user.id)
    return {"message": "All notifications marked as read"}


@router.post("", response_model=NotificationResponse, status_code=201)
def create_notification_route(
    data: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_notification(db, data)
