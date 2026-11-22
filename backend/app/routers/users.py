from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import UserResponse, UserUpdate
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("", response_model=list[dict])
def list_users(
    role: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")

    query = db.query(User)
    if role:
        query = query.filter(User.role == role)

    users = query.all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "name": u.name,
            "role": u.role,
            "is_active": u.is_active,
            "avatar_url": u.avatar_url,
            "language": u.language,
            "timezone": u.timezone,
            "phone": u.phone,
            "last_login": u.last_login,
            "created_at": u.created_at,
        }
        for u in users
    ]


@router.get("/agents", response_model=list[dict])
def list_agents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    agents = db.query(User).filter(User.role == "agent", User.is_active == True).all()
    return [
        {
            "id": a.id,
            "email": a.email,
            "name": a.name,
            "avatar_url": a.avatar_url,
            "language": a.language,
            "timezone": a.timezone,
            "last_login": a.last_login,
        }
        for a in agents
    ]


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: str,
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if data.name is not None:
        user.name = data.name
    if data.phone is not None:
        user.phone = data.phone
    if data.language is not None:
        user.language = data.language
    if data.timezone is not None:
        user.timezone = data.timezone

    db.commit()
    db.refresh(user)
    return user
