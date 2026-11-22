from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    ADMIN = "admin"
    AGENT = "agent"
    USER = "user"


class UserStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"


# ==================== Auth ====================

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    name: str
    role: UserRole = UserRole.USER


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None


# ==================== Users ====================

class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: UserRole = UserRole.USER
    language: str = "en"
    timezone: str = "UTC"
    phone: Optional[str] = None


class UserResponse(UserBase):
    id: str
    is_active: bool
    avatar_url: Optional[str] = None
    last_login: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    language: Optional[str] = None
    timezone: Optional[str] = None


class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)


# ==================== Conversations ====================

class ConversationSource(str, Enum):
    CHAT = "chat"
    EMAIL = "email"
    WHATSAPP = "whatsapp"
    TELEGRAM = "telegram"
    MESSENGER = "messenger"
    TWITTER = "twitter"


class ConversationStatus(str, Enum):
    OPEN = "open"
    CLOSED = "closed"
    PENDING = "pending"
    ARCHIVED = "archived"


class ConversationCreate(BaseModel):
    user_id: Optional[str] = None
    department_id: Optional[str] = None
    source: ConversationSource = ConversationSource.CHAT
    subject: Optional[str] = None
    tags: List[str] = []


class ConversationUpdate(BaseModel):
    agent_id: Optional[str] = None
    department_id: Optional[str] = None
    status: Optional[ConversationStatus] = None
    tags: Optional[List[str]] = None
    subject: Optional[str] = None


class ConversationResponse(BaseModel):
    id: str
    user_id: Optional[str]
    agent_id: Optional[str]
    department_id: Optional[str]
    status: ConversationStatus
    source: ConversationSource
    subject: Optional[str]
    tags: List[str] = []
    custom_data: dict = {}
    started_at: Optional[datetime]
    closed_at: Optional[datetime]
    last_message_at: Optional[datetime]
    queue_position: Optional[int]
    wait_time: int
    language: str
    user_name: Optional[str] = None
    agent_name: Optional[str] = None
    last_message_preview: Optional[str] = None
    unread_count: int = 0

    class Config:
        from_attributes = True


class ConversationListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    conversations: List[ConversationResponse]


# ==================== Messages ====================

class MessageContentType(str, Enum):
    TEXT = "text"
    IMAGE = "image"
    FILE = "file"
    VOICE = "voice"
    EMOJI = "emoji"
    SYSTEM = "system"


class MessageSenderType(str, Enum):
    USER = "user"
    AGENT = "agent"
    BOT = "bot"
    SYSTEM = "system"


class MessageCreate(BaseModel):
    conversation_id: str
    sender_id: str
    sender_type: MessageSenderType
    content: str
    type: MessageContentType = MessageContentType.TEXT
    attachments: List[Any] = []
    metadata: dict = {}


class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    user_id: str
    sender_type: MessageSenderType
    content: str
    type: MessageContentType
    is_read: bool
    created_at: datetime
    updated_at: Optional[datetime]
    attachments: List[Any] = []
    metadata: dict = {}
    sender_name: Optional[str] = None

    class Config:
        from_attributes = True


# ==================== Tickets ====================

class TicketPriority(str, Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


class TicketStatus(str, Enum):
    OPEN = "open"
    PENDING = "pending"
    SOLVED = "solved"
    CLOSED = "closed"


class TicketCreate(BaseModel):
    user_id: Optional[str] = None
    department_id: Optional[str] = None
    subject: str
    description: str
    category: Optional[str] = None
    priority: TicketPriority = TicketPriority.NORMAL


class TicketUpdate(BaseModel):
    agent_id: Optional[str] = None
    status: Optional[TicketStatus] = None
    priority: Optional[TicketPriority] = None
    category: Optional[str] = None


class TicketResponse(BaseModel):
    id: str
    ticket_number: str
    user_id: Optional[str]
    agent_id: Optional[str]
    department_id: Optional[str]
    status: TicketStatus
    priority: TicketPriority
    subject: str
    category: Optional[str]
    created_at: datetime
    updated_at: datetime
    closed_at: Optional[datetime]
    user_name: Optional[str] = None
    agent_name: Optional[str] = None

    class Config:
        from_attributes = True


# ==================== Knowledge Base ====================

class ArticleStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class ArticleCreate(BaseModel):
    title: str
    content: str
    slug: str
    category_id: Optional[str] = None
    status: ArticleStatus = ArticleStatus.DRAFT
    language: str = "en"


class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category_id: Optional[str] = None
    status: Optional[ArticleStatus] = None


class ArticleResponse(BaseModel):
    id: str
    title: str
    content: str
    slug: str
    category_id: Optional[str]
    author_id: str
    status: ArticleStatus
    views: int
    likes: int
    helpful: int
    not_helpful: int
    language: str
    created_at: datetime
    updated_at: datetime
    author_name: Optional[str] = None
    category_name: Optional[str] = None

    class Config:
        from_attributes = True


class CategoryCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    parent_id: Optional[str] = None
    icon: Optional[str] = None
    display_order: int = 0


class CategoryResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: Optional[str] = None
    parent_id: Optional[str] = None
    icon: Optional[str] = None
    display_order: int
    created_at: datetime
    subcategories: List['CategoryResponse'] = []

    class Config:
        from_attributes = True


# ==================== Departments ====================

class DepartmentCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    email: Optional[str] = None
    color: str = "#3b82f6"
    display_order: int = 0


class DepartmentResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: Optional[str] = None
    email: Optional[str] = None
    color: str
    display_order: int
    created_at: datetime
    agent_count: int = 0

    class Config:
        from_attributes = True


# ==================== Tags ====================

class TagCreate(BaseModel):
    name: str
    color: str = "#6b7280"


class TagResponse(BaseModel):
    id: str
    name: str
    color: str

    class Config:
        from_attributes = True


# ==================== Chatbot ====================

class ChatbotConfigCreate(BaseModel):
    name: str
    openai_api_key: Optional[str] = None
    openai_model: Optional[str] = None
    openai_prompt: Optional[str] = None
    default_message: Optional[str] = None
    welcome_message: Optional[str] = None
    fallback_message: Optional[str] = None
    human_takeover_on_fallback: bool = True
    languages: List[str] = []
    auto_translate: bool = True
    speech_recognition: bool = False
    image_analysis: bool = False
    web_search: bool = False
    conversation_history: bool = True
    history_length: int = 10


class ChatbotQnACreate(BaseModel):
    chatbot_id: str
    question: str
    answer: str
    category: Optional[str] = None


class ChatbotFlowCreate(BaseModel):
    chatbot_id: str
    name: str
    description: Optional[str] = None
    steps: List[dict] = []


# ==================== Notifications ====================

class NotificationCreate(BaseModel):
    user_id: str
    type: str
    title: str
    message: str
    link: Optional[str] = None


class NotificationResponse(BaseModel):
    id: str
    user_id: str
    type: str
    title: str
    message: str
    is_read: bool
    link: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== Settings ====================

class SettingCreate(BaseModel):
    key: str
    value: Optional[str] = None
    category: str = "general"


class SettingResponse(BaseModel):
    id: str
    key: str
    value: Optional[str] = None
    category: str
    updated_at: datetime

    class Config:
        from_attributes = True


# ==================== Reports ====================

class DateRange(BaseModel):
    start_date: datetime
    end_date: datetime


class ChatStats(BaseModel):
    total_conversations: int = 0
    open_conversations: int = 0
    closed_conversations: int = 0
    avg_response_time: float = 0
    avg_resolution_time: float = 0
    customer_satisfaction: float = 0


class AgentStats(BaseModel):
    agent_id: str
    agent_name: str
    total_conversations: int = 0
    resolved_conversations: int = 0
    avg_response_time: float = 0
    avg_rating: float = 0
    total_ratings: int = 0
    online_status: str = "offline"


class ReportResponse(BaseModel):
    chat_stats: ChatStats
    agent_stats: List[AgentStats]
    conversation_by_source: dict
    conversation_by_department: dict
    top_articles: List[dict]
    daily_stats: List[dict]


# ==================== Dashboard ====================

class DashboardStats(BaseModel):
    total_conversations: int
    open_conversations: int
    active_agents: int
    pending_tickets: int
    today_visitors: int
    today_conversations: int
    avg_response_time: float
    satisfaction_rate: float
    agent_stats: List[AgentStats]


# ==================== Embed ====================

class WidgetConfig(BaseModel):
    theme_color: str = "#3b82f6"
    position: str = "bottom-right"
    welcome_message: str = "Hi there! How can we help you?"
    show_powered_by: bool = True
    button_text: str = "Chat with us"
    placeholder_text: str = "Type a message..."
    auto_open: bool = False
    dark_mode: bool = False


class EmbedToken(BaseModel):
    widget_id: str
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    user_id: Optional[str] = None
    expires_in: int = 3600
