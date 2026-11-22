from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Conversation
from app.schemas import DashboardStats, ReportResponse
from app.services.report_service import (
    get_chat_stats, get_agent_stats, get_conversation_by_source,
    get_conversation_by_department, get_top_articles, get_daily_stats,
    get_dashboard_stats,
)
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardStats)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["admin", "agent"]:
        raise HTTPException(status_code=403, detail="Access denied")

    return get_dashboard_stats(db)


@router.get("/reports", response_model=ReportResponse)
def get_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["admin"]:
        raise HTTPException(status_code=403, detail="Access denied")

    from datetime import datetime, timezone, timedelta
    end = datetime.now(timezone.utc)
    start = end - timedelta(days=30)

    return ReportResponse(
        chat_stats=get_chat_stats(db, start_date=start, end_date=end),
        agent_stats=get_agent_stats(db, start_date=start, end_date=end),
        conversation_by_source=get_conversation_by_source(db, start_date=start, end_date=end),
        conversation_by_department=get_conversation_by_department(db, start_date=start, end_date=end),
        top_articles=get_top_articles(db, limit=5, start_date=start, end_date=end),
        daily_stats=get_daily_stats(db, days=30),
    )
