from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Department
from app.schemas import DepartmentCreate, DepartmentResponse
from app.services.department_service import (
    get_departments, get_department, get_department_by_slug,
    create_department, update_department, delete_department,
)
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/departments", tags=["departments"])


@router.get("", response_model=list[DepartmentResponse])
def list_departments(db: Session = Depends(get_db)):
    depts = get_departments(db)
    result = []
    for d in depts:
        # Count agents in department (simplified)
        agent_count = db.query(User).filter(
            User.role == "agent",
            User.id.in_(
                db.query(Conversation.agent_id).filter(
                    Conversation.department_id == d.id
                ).distinct().subquery()
            )
        ).count()

        result.append({
            "id": d.id,
            "name": d.name,
            "slug": d.slug,
            "description": d.description,
            "email": d.email,
            "color": d.color,
            "display_order": d.display_order,
            "created_at": d.created_at,
            "agent_count": agent_count,
        })
    return result


@router.get("/{department_id}", response_model=DepartmentResponse)
def get_department_detail(
    department_id: str,
    db: Session = Depends(get_db),
):
    dept = get_department(db, department_id)
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    return dept


@router.get("/slug/{slug}", response_model=DepartmentResponse)
def get_department_by_slug_route(
    slug: str,
    db: Session = Depends(get_db),
):
    dept = get_department_by_slug(db, slug)
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    return dept


@router.post("", response_model=DepartmentResponse, status_code=201)
def create_new_department(
    data: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create departments")

    # Check duplicate slug
    existing = get_department_by_slug(db, data.slug)
    if existing:
        raise HTTPException(status_code=400, detail="Slug already exists")

    return create_department(db, data)


@router.put("/{department_id}", response_model=DepartmentResponse)
def update_department_route(
    department_id: str,
    data: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can update departments")

    dept = update_department(db, department_id, data)
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    return dept


@router.delete("/{department_id}")
def delete_department_route(
    department_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete departments")

    if not delete_department(db, department_id):
        raise HTTPException(status_code=404, detail="Department not found")
    return {"message": "Department deleted"}
