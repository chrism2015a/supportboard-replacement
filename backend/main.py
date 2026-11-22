import sys
import os
# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from app.database import engine, Base
from app.models import User
from app.services.auth_service import hash_password
from datetime import datetime, timezone

# Import routers
from app.routers.auth import router as auth_router
from app.routers.conversations import router as conversations_router
from app.routers.messages import router as messages_router
from app.routers.tickets import router as tickets_router
from app.routers.articles import router as articles_router
from app.routers.departments import router as departments_router
from app.routers.dashboard import router as dashboard_router
from app.routers.chatbot import router as chatbot_router
from app.routers.notifications import router as notifications_router
from app.routers.settings import router as settings_router
from app.routers.users import router as users_router
from app.routers.websocket import router as websocket_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables
    Base.metadata.create_all(bind=engine)

    # Seed admin user if not exists
    from app.database import SessionLocal
    db = SessionLocal()
    admin = db.query(User).filter(User.email == "admin@supportboard.local").first()
    if not admin:
        admin = User(
            email="admin@supportboard.local",
            hashed_password=hash_password("admin123"),
            name="Admin User",
            role="admin",
            is_active=True,
            language="en",
            timezone="UTC",
        )
        db.add(admin)

        # Seed agent
        agent = User(
            email="agent@supportboard.local",
            hashed_password=hash_password("agent123"),
            name="Agent Smith",
            role="agent",
            is_active=True,
            language="en",
            timezone="UTC",
        )
        db.add(agent)

        # Seed regular user
        user = User(
            email="user@example.com",
            hashed_password=hash_password("user123"),
            name="John Doe",
            role="user",
            is_active=True,
            language="en",
            timezone="UTC",
        )
        db.add(user)

        db.commit()
    db.close()

    yield

app = FastAPI(
    title="Support Board Replacement",
    description="A comprehensive customer support platform with live chat, ticketing, knowledge base, and AI chatbot",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(conversations_router)
app.include_router(messages_router)
app.include_router(tickets_router)
app.include_router(articles_router)
app.include_router(departments_router)
app.include_router(dashboard_router)
app.include_router(chatbot_router)
app.include_router(notifications_router)
app.include_router(settings_router)
app.include_router(users_router)
app.include_router(websocket_router)


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Support Board Replacement",
        "version": "1.0.0",
    }


# Serve frontend in production
FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "frontend", "dist")
if os.path.exists(FRONTEND_DIR):
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
