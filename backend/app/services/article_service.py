from sqlalchemy.orm import Session
from app.models import Article, Category, User
from app.schemas import ArticleCreate, ArticleUpdate, ArticleStatus, CategoryCreate
from typing import List, Optional
from datetime import datetime, timezone


def get_articles(
    db: Session,
    category_id: Optional[str] = None,
    status: Optional[str] = None,
    language: str = "en",
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
) -> dict:
    query = db.query(Article).filter(Article.language == language)

    if category_id:
        query = query.filter(Article.category_id == category_id)
    if status:
        query = query.filter(Article.status == status)
    if search:
        query = query.filter(
            Article.title.ilike(f"%{search}%") | Article.content.ilike(f"%{search}%")
        )

    total = query.count()
    articles = (
        query.order_by(Article.updated_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    result = []
    for a in articles:
        author = db.query(User).filter(User.id == a.author_id).first() if a.author_id else None
        category = db.query(Category).filter(Category.id == a.category_id).first() if a.category_id else None
        result.append({
            "id": a.id,
            "title": a.title,
            "content": a.content,
            "slug": a.slug,
            "category_id": a.category_id,
            "author_id": a.author_id,
            "status": a.status,
            "views": a.views,
            "likes": a.likes,
            "helpful": a.helpful,
            "not_helpful": a.not_helpful,
            "language": a.language,
            "created_at": a.created_at,
            "updated_at": a.updated_at,
            "author_name": author.name if author else None,
            "category_name": category.name if category else None,
        })

    return {"total": total, "page": page, "page_size": page_size, "articles": result}


def get_article(db: Session, article_id: str) -> Optional[Article]:
    return db.query(Article).filter(Article.id == article_id).first()


def get_article_by_slug(db: Session, slug: str, language: str = "en") -> Optional[Article]:
    return db.query(Article).filter(
        Article.slug == slug,
        Article.language == language,
    ).first()


def create_article(db: Session, data: ArticleCreate, author_id: str) -> Article:
    article = Article(
        title=data.title,
        content=data.content,
        slug=data.slug,
        category_id=data.category_id,
        author_id=author_id,
        status=data.status.value if hasattr(data.status, 'value') else data.status,
        language=data.language,
    )
    db.add(article)
    db.commit()
    db.refresh(article)
    return article


def update_article(db: Session, article_id: str, data: ArticleUpdate) -> Optional[Article]:
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        return None

    if data.title is not None:
        article.title = data.title
    if data.content is not None:
        article.content = data.content
    if data.category_id is not None:
        article.category_id = data.category_id
    if data.status is not None:
        article.status = data.status.value if hasattr(data.status, 'value') else data.status

    db.commit()
    db.refresh(article)
    return article


def increment_article_views(db: Session, article_id: str):
    article = db.query(Article).filter(Article.id == article_id).first()
    if article:
        article.views += 1
        db.commit()


def get_categories(db: Session) -> List[Category]:
    return db.query(Category).filter(Category.parent_id == None).order_by(Category.display_order).all()


def create_category(db: Session, data: CategoryCreate) -> Category:
    cat = Category(
        name=data.name,
        slug=data.slug,
        description=data.description,
        parent_id=data.parent_id,
        icon=data.icon,
        display_order=data.display_order,
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat
