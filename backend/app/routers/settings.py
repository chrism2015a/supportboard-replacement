from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Setting
from app.schemas import SettingCreate, SettingResponse
from app.services.setting_service import get_setting, get_settings, set_setting, bulk_update_settings
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.get("", response_model=list[SettingResponse])
def list_settings(
    category: str = "general",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["admin"]:
        raise HTTPException(status_code=403, detail="Access denied")
    return get_settings(db, category=category)


@router.get("/key/{key}", response_model=SettingResponse)
def get_setting_by_key(
    key: str,
    db: Session = Depends(get_db),
):
    s = get_setting(db, key)
    if not s:
        raise HTTPException(status_code=404, detail="Setting not found")
    return s


@router.post("", response_model=SettingResponse, status_code=201)
def create_setting(
    data: SettingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["admin"]:
        raise HTTPException(status_code=403, detail="Access denied")
    return set_setting(db, data)


@router.put("/bulk")
def update_settings_bulk(
    data: dict,
    category: str = "general",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["admin"]:
        raise HTTPException(status_code=403, detail="Access denied")
    bulk_update_settings(db, data, category)
    return {"message": "Settings updated"}
