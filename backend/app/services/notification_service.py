from sqlalchemy.orm import Session
from app.models import Notification
from app.schemas import NotificationCreate
from typing import List, Optional
from datetime import datetime, timezone


def create_notification(db: Session, data: NotificationCreate) -> Notification:
    notification = Notification(
        user_id=data.user_id,
        type=data.type,
        title=data.title,
        message=data.message,
        link=data.link,
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


def get_user_notifications(
    db: Session,
    user_id: str,
    limit: int = 50,
    unread_only: bool = False,
) -> List[Notification]:
    query = db.query(Notification).filter(Notification.user_id == user_id)
    if unread_only:
        query = query.filter(Notification.is_read == False)
    return (
        query.order_by(Notification.created_at.desc())
        .limit(limit)
        .all()
    )


def mark_notification_read(db: Session, notification_id: str):
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if notification:
        notification.is_read = True
        db.commit()


def mark_all_notifications_read(db: Session, user_id: str):
    db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False,
    ).update({"is_read": True})
    db.commit()


def get_unread_count(db: Session, user_id: str) -> int:
    return db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False,
    ).count()
