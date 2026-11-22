from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import ArticleCreate, ArticleUpdate, ArticleResponse, ArticleStatus, CategoryCreate, CategoryResponse, ArticleStatus as ArticleStatusEnum
from app.services.article_service import (
    get_articles, get_article, get_article_by_slug,
    create_article, update_article, increment_article_views,
    get_categories, create_category
)
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/articles", tags=["articles"])


@router.get("", response_model=dict)
def list_articles(
    db: Session = Depends(get_db),
    category_id: str = Query(None),
    status: str = Query(None),
    language: str = Query("en"),
    search: str = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    result = get_articles(
        db,
        category_id=category_id,
        status=status,
        language=language,
        search=search,
        page=page,
        page_size=page_size,
    )
    return result


@router.get("/slug/{slug}", response_model=ArticleResponse)
def get_article_by_slug(
    slug: str,
    db: Session = Depends(get_db),
    language: str = Query("en"),
):
    article = get_article_by_slug(db, slug, language)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    increment_article_views(db, article.id)
    return article


@router.get("/{article_id}", response_model=ArticleResponse)
def get_article_detail(
    article_id: str,
    db: Session = Depends(get_db),
):
    article = get_article(db, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    increment_article_views(db, article.id)
    return article


@router.post("", response_model=ArticleResponse, status_code=201)
def create_new_article(
    data: ArticleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["admin", "agent"]:
        raise HTTPException(status_code=403, detail="Access denied")

    article = create_article(db, data, current_user.id)
    return article


@router.put("/{article_id}", response_model=ArticleResponse)
def update_article_route(
    article_id: str,
    data: ArticleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["admin", "agent"]:
        raise HTTPException(status_code=403, detail="Access denied")

    article = update_article(db, article_id, data)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article


@router.get("/categories", response_model=list[CategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    return get_categories(db)


@router.post("/categories", response_model=CategoryResponse, status_code=201)
def create_category_route(
    data: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["admin", "agent"]:
        raise HTTPException(status_code=403, detail="Access denied")

    return create_category(db, data)
