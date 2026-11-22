from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, ChatbotConfig, ChatbotQnA, ChatbotFlow
from app.schemas import ChatbotConfigCreate, ChatbotQnACreate, ChatbotFlowCreate
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/chatbot", tags=["chatbot"])


@router.get("/configs", response_model=list[dict])
def list_configs(db: Session = Depends(get_db)):
    configs = db.query(ChatbotConfig).all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "is_active": c.is_active,
            "default_message": c.default_message,
            "welcome_message": c.welcome_message,
            "fallback_message": c.fallback_message,
            "human_takeover_on_fallback": c.human_takeover_on_fallback,
            "auto_translate": c.auto_translate,
            "speech_recognition": c.speech_recognition,
            "image_analysis": c.image_analysis,
            "web_search": c.web_search,
            "conversation_history": c.conversation_history,
            "created_at": c.created_at,
        }
        for c in configs
    ]


@router.post("/configs", response_model=dict, status_code=201)
def create_config(
    data: ChatbotConfigCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["admin", "agent"]:
        raise HTTPException(status_code=403, detail="Access denied")

    config = ChatbotConfig(
        name=data.name,
        openai_api_key=data.openai_api_key,
        openai_model=data.openai_model,
        openai_prompt=data.openai_prompt,
        default_message=data.default_message,
        welcome_message=data.welcome_message,
        fallback_message=data.fallback_message,
        human_takeover_on_fallback=data.human_takeover_on_fallback,
        languages=data.languages,
        auto_translate=data.auto_translate,
        speech_recognition=data.speech_recognition,
        image_analysis=data.image_analysis,
        web_search=data.web_search,
        conversation_history=data.conversation_history,
        history_length=data.history_length,
    )
    db.add(config)
    db.commit()
    db.refresh(config)
    return config


@router.get("/qna", response_model=list[dict])
def list_qna(chatbot_id: str, db: Session = Depends(get_db)):
    qnas = db.query(ChatbotQnA).filter(
        ChatbotQnA.chatbot_id == chatbot_id,
        ChatbotQnA.is_active == True,
    ).all()
    return [
        {
            "id": q.id,
            "question": q.question,
            "answer": q.answer,
            "category": q.category,
        }
        for q in qnas
    ]


@router.post("/qna", response_model=dict, status_code=201)
def create_qna(
    data: ChatbotQnACreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    qna = ChatbotQnA(
        chatbot_id=data.chatbot_id,
        question=data.question,
        answer=data.answer,
        category=data.category,
    )
    db.add(qna)
    db.commit()
    db.refresh(qna)
    return qna


@router.get("/flows", response_model=list[dict])
def list_flows(chatbot_id: str, db: Session = Depends(get_db)):
    flows = db.query(ChatbotFlow).filter(
        ChatbotFlow.chatbot_id == chatbot_id,
    ).all()
    return [
        {
            "id": f.id,
            "name": f.name,
            "description": f.description,
            "steps": f.steps,
            "is_active": f.is_active,
        }
        for f in flows
    ]


@router.post("/flows", response_model=dict, status_code=201)
def create_flow(
    data: ChatbotFlowCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    flow = ChatbotFlow(
        chatbot_id=data.chatbot_id,
        name=data.name,
        description=data.description,
        steps=data.steps,
    )
    db.add(flow)
    db.commit()
    db.refresh(flow)
    return flow


@router.post("/chat", response_model=dict)
def chat_with_bot(
    message: str,
    conversation_id: str,
    chatbot_id: str = "default",
    db: Session = Depends(get_db),
):
    # Get bot config
    config = db.query(ChatbotConfig).filter(ChatbotConfig.id == chatbot_id).first()
    if not config:
        return {"response": "Sorry, I'm not available right now.", "action": "transfer_to_agent"}

    # Get Q&A entries
    qnas = db.query(ChatbotQnA).filter(
        ChatbotQnA.chatbot_id == chatbot_id,
        ChatbotQnA.is_active == True,
    ).all()

    # Try to find matching Q&A
    for qna in qnas:
        if qna.question.lower() in message.lower() or message.lower() in qna.question.lower():
            return {
                "response": qna.answer,
                "action": "reply",
                "qna_id": qna.id,
            }

    # Use OpenAI for intelligent response
    from app.config import OPENAI_API_KEY
    if OPENAI_API_KEY:
        try:
            import asyncio
            from app.services.chatbot_service import OpenAIService

            messages = [
                {"role": "system", "content": config.openai_prompt or "You are a helpful customer support assistant."},
                {"role": "user", "content": message},
            ]

            loop = asyncio.new_event_loop()
            response = loop.run_until_complete(
                OpenAIService.chat_completion(
                    messages,
                    api_key=config.openai_api_key or OPENAI_API_KEY,
                )
            )
            loop.close()

            return {
                "response": response or "I'm sorry, I don't have an answer for that. Let me connect you with an agent.",
                "action": "reply",
            }
        except Exception as e:
            print(f"Chat error: {e}")

    # Fallback
    return {
        "response": config.fallback_message or "I'm sorry, I don't have an answer for that. Let me connect you with an agent.",
        "action": "transfer_to_agent" if config.human_takeover_on_fallback else "reply",
    }
