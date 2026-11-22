from sqlalchemy.orm import Session
from app.models import Setting
from app.schemas import SettingCreate
from typing import Optional


def get_setting(db: Session, key: str) -> Optional[Setting]:
    return db.query(Setting).filter(Setting.key == key).first()


def get_settings(db: Session, category: Optional[str] = None):
    query = db.query(Setting)
    if category:
        query = query.filter(Setting.category == category)
    return query.all()


def set_setting(db: Session, data: SettingCreate) -> Setting:
    existing = db.query(Setting).filter(Setting.key == data.key).first()
    if existing:
        existing.value = data.value
        db.commit()
        db.refresh(existing)
        return existing
    else:
        setting = Setting(
            key=data.key,
            value=data.value,
            category=data.category,
        )
        db.add(setting)
        db.commit()
        db.refresh(setting)
        return setting


def bulk_update_settings(db: Session, settings_data: dict, category: str = "general"):
    for key, value in settings_data.items():
        set_setting(db, SettingCreate(key=key, value=str(value), category=category))
