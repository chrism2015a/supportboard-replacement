import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Integer, Boolean, DateTime, Text, ForeignKey, Enum as SAEnum, JSON
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from app.database import Base

def gen_uuid():
    return str(uuid.uuid4())

def now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="user")  # admin, agent, user
    is_active = Column(Boolean, default=True)
    avatar_url = Column(String(500), nullable=True)
    language = Column(String(10), default="en")
    timezone = Column(String(50), default="UTC")
    phone = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=now)
    updated_at = Column(DateTime, default=now, onupdate=now)
    last_login = Column(DateTime, nullable=True)

    # Relationships
    conversations_as_agent = relationship("Conversation", foreign_keys="Conversation.agent_id", back_populates="agent")
    conversations_as_user = relationship("Conversation", foreign_keys="Conversation.user_id", back_populates="user")
    tickets_as_user = relationship("Ticket", back_populates="user")
    agent_ratings = relationship("AgentRating", back_populates="agent")

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    agent_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    department_id = Column(String(36), nullable=True)
    status = Column(String(50), default="open")  # open, closed, pending, archived
    source = Column(String(50), default="chat")  # chat, email, whatsapp, telegram, messenger
    subject = Column(String(500), nullable=True)
    tags = Column(JSON, default=list)
    custom_data = Column(JSON, default=dict)
    started_at = Column(DateTime, default=now)
    closed_at = Column(DateTime, nullable=True)
    last_message_at = Column(DateTime, nullable=True)
    queue_position = Column(Integer, nullable=True)
    wait_time = Column(Integer, default=0)
    language = Column(String(10), default="en")
    transcript = Column(Text, nullable=True)

    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="conversations_as_user")
    agent = relationship("User", foreign_keys=[agent_id], back_populates="conversations_as_agent")
    messages = relationship("Message", back_populates="conversation", order_by="Message.created_at")
    tags_list = relationship("Tag", secondary="conversation_tags", back_populates="conversations")

class Message(Base):
    __tablename__ = "messages"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    conversation_id = Column(String(36), ForeignKey("conversations.id"), nullable=False, index=True)
    user_id = Column(String(36), nullable=False)
    sender_type = Column(String(20), nullable=False)  # user, agent, bot, system
    content = Column(Text, nullable=False)
    type = Column(String(50), default="text")  # text, image, file, voice, emoji, system
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=now)
    updated_at = Column(DateTime, default=now, onupdate=now)
    attachments = Column(JSON, default=list)
    metadata = Column(JSON, default=dict)

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    ticket_number = Column(String(50), unique=True, nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    agent_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    department_id = Column(String(36), nullable=True)
    status = Column(String(50), default="open")  # open, pending, solved, closed
    priority = Column(String(50), default="normal")  # low, normal, high, urgent
    subject = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=now)
    updated_at = Column(DateTime, default=now, onupdate=now)
    closed_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="tickets_as_user")
    agent = relationship("User", foreign_keys=[agent_id])
    messages = relationship("TicketMessage", back_populates="ticket")

class TicketMessage(Base):
    __tablename__ = "ticket_messages"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    ticket_id = Column(String(36), ForeignKey("tickets.id"), nullable=False)
    user_id = Column(String(36), nullable=False)
    content = Column(Text, nullable=False)
    is_internal = Column(Boolean, default=False)
    created_at = Column(DateTime, default=now)

    ticket = relationship("Ticket", back_populates="messages")

class Article(Base):
    __tablename__ = "articles"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=False)
    slug = Column(String(500), unique=True, nullable=False, index=True)
    category_id = Column(String(36), ForeignKey("categories.id"), nullable=True)
    author_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    status = Column(String(50), default="published")  # draft, published, archived
    views = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    helpful = Column(Integer, default=0)
    not_helpful = Column(Integer, default=0)
    language = Column(String(10), default="en")
    created_at = Column(DateTime, default=now)
    updated_at = Column(DateTime, default=now, onupdate=now)

    category = relationship("Category", back_populates="articles")
    author = relationship("User")

class Category(Base):
    __tablename__ = "categories"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    parent_id = Column(String(36), ForeignKey("categories.id"), nullable=True)
    icon = Column(String(255), nullable=True)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=now)

    parent = relationship("Category", remote_side=[id], backref="subcategories")
    articles = relationship("Article", back_populates="category")

class Department(Base):
    __tablename__ = "departments"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    email = Column(String(255), nullable=True)
    color = Column(String(20), default="#3b82f6")
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=now)

class Tag(Base):
    __tablename__ = "tags"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(100), unique=True, nullable=False)
    color = Column(String(20), default="#6b7280")

class ConversationTag(Base):
    __tablename__ = "conversation_tags"

    conversation_id = Column(String(36), ForeignKey("conversations.id"), primary_key=True)
    tag_id = Column(String(36), ForeignKey("tags.id"), primary_key=True)

class AgentRating(Base):
    __tablename__ = "agent_ratings"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    conversation_id = Column(String(36), ForeignKey("conversations.id"), nullable=False)
    agent_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    user_id = Column(String(36), nullable=True)
    rating = Column(Integer, nullable=False)  # 1-5
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=now)

    agent = relationship("User", back_populates="agent_ratings")

class ChatbotConfig(Base):
    __tablename__ = "chatbot_configs"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    openai_api_key = Column(String(500), nullable=True)
    openai_model = Column(String(100), nullable=True)
    openai_prompt = Column(Text, nullable=True)
    default_message = Column(Text, nullable=True)
    welcome_message = Column(Text, nullable=True)
    fallback_message = Column(Text, nullable=True)
    human_takeover_on_fallback = Column(Boolean, default=True)
    languages = Column(JSON, default=list)
    auto_translate = Column(Boolean, default=True)
    speech_recognition = Column(Boolean, default=False)
    image_analysis = Column(Boolean, default=False)
    web_search = Column(Boolean, default=False)
    conversation_history = Column(Boolean, default=True)
    history_length = Column(Integer, default=10)
    created_at = Column(DateTime, default=now)

class ChatbotQnA(Base):
    __tablename__ = "chatbot_qna"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    chatbot_id = Column(String(36), ForeignKey("chatbot_configs.id"), nullable=False)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    category = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=now)

class ChatbotFlow(Base):
    __tablename__ = "chatbot_flows"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    chatbot_id = Column(String(36), ForeignKey("chatbot_configs.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    steps = Column(JSON, default=list)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=now)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), nullable=False)
    type = Column(String(50), nullable=False)  # new_message, new_ticket, rating, etc.
    title = Column(String(500), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    link = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=now)

class Automation(Base):
    __tablename__ = "automations"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(255), nullable=False)
    trigger = Column(String(100), nullable=False)  # new_message, new_ticket, etc.
    action = Column(String(100), nullable=False)  # send_email, send_notification, etc.
    conditions = Column(JSON, default=list)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=now)

class PopupConfig(Base):
    __tablename__ = "popup_configs"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(255), nullable=False)
    trigger = Column(String(100), default="page_load")  # page_load, time_delay, scroll, exit_intent
    delay = Column(Integer, default=0)
    scroll_percentage = Column(Integer, default=75)
    message = Column(Text, nullable=True)
    title = Column(String(500), nullable=True)
    button_text = Column(String(100), nullable=True)
    button_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    target_pages = Column(JSON, default=list)
    created_at = Column(DateTime, default=now)

class Setting(Base):
    __tablename__ = "settings"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    key = Column(String(255), unique=True, nullable=False)
    value = Column(Text, nullable=True)
    category = Column(String(100), default="general")
    updated_at = Column(DateTime, default=now, onupdate=now)
