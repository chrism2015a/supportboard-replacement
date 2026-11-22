from sqlalchemy.orm import Session
from app.models import Department, User
from app.schemas import DepartmentCreate
from typing import List, Optional


def get_departments(db: Session) -> List[Department]:
    return db.query(Department).order_by(Department.display_order).all()


def get_department(db: Session, department_id: str) -> Optional[Department]:
    return db.query(Department).filter(Department.id == department_id).first()


def get_department_by_slug(db: Session, slug: str) -> Optional[Department]:
    return db.query(Department).filter(Department.slug == slug).first()


def create_department(db: Session, data: DepartmentCreate) -> Department:
    dept = Department(
        name=data.name,
        slug=data.slug,
        description=data.description,
        email=data.email,
        color=data.color,
        display_order=data.display_order,
    )
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return dept


def update_department(
    db: Session,
    department_id: str,
    data: DepartmentCreate,
) -> Optional[Department]:
    dept = db.query(Department).filter(Department.id == department_id).first()
    if not dept:
        return None

    dept.name = data.name
    dept.slug = data.slug
    dept.description = data.description
    dept.email = data.email
    dept.color = data.color
    dept.display_order = data.display_order

    db.commit()
    db.refresh(dept)
    return dept


def delete_department(db: Session, department_id: str) -> bool:
    dept = db.query(Department).filter(Department.id == department_id).first()
    if dept:
        db.delete(dept)
        db.commit()
        return True
    return False


def get_department_agent_count(db: Session, department_id: str) -> int:
    return db.query(User).filter(
        User.role == "agent",
        User.id.in_(
            db.query(User.id).filter(User.role == "agent").subquery()
        ),
    ).count()
