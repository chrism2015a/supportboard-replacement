from openai import AsyncOpenAI
from app.config import OPENAI_API_KEY, OPENAI_MODEL, OPENAI_TEMPERATURE, OPENAI_MAX_TOKENS
import json
from typing import List, Dict, Optional


class OpenAIService:
    _client: Optional[AsyncOpenAI] = None

    @classmethod
    def get_client(cls, api_key: Optional[str] = None) -> AsyncOpenAI:
        if cls._client is None or api_key:
            key = api_key or OPENAI_API_KEY
            if key:
                cls._client = AsyncOpenAI(api_key=key)
        return cls._client

    @classmethod
    async def chat_completion(
        cls,
        messages: List[Dict[str, str]],
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        system_prompt: Optional[str] = None,
    ) -> Optional[str]:
        client = cls.get_client(api_key)
        if not client:
            return None

        if system_prompt:
            messages = [{"role": "system", "content": system_prompt}] + messages

        try:
            response = await client.chat.completions.create(
                model=model or OPENAI_MODEL,
                messages=messages,
                temperature=temperature if temperature is not None else OPENAI_TEMPERATURE,
                max_tokens=max_tokens or OPENAI_MAX_TOKENS,
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"OpenAI API error: {e}")
            return None

    @classmethod
    async def smart_reply(
        cls,
        user_message: str,
        context: str,
        api_key: Optional[str] = None,
        language: str = "en",
    ) -> Optional[str]:
        system_prompt = f"You are a helpful customer support assistant. Provide a concise, professional reply in {language}. Use up to 2 sentences."
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Context: {context}\nUser message: {user_message}"},
        ]
        return await cls.chat_completion(messages, api_key=api_key)

    @classmethod
    async def rewrite_message(
        cls,
        message: str,
        tone: str = "professional",
        api_key: Optional[str] = None,
    ) -> Optional[str]:
        system_prompt = f"Rewrite the following message to be more {tone}, friendly, and professional. Return only the rewritten message."
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": message},
        ]
        return await cls.chat_completion(messages, api_key=api_key)

    @classmethod
    async def spell_check(
        cls,
        text: str,
        api_key: Optional[str] = None,
    ) -> Optional[str]:
        system_prompt = "Fix any spelling and grammar mistakes in the following text. Return only the corrected text."
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": text},
        ]
        return await cls.chat_completion(messages, api_key=api_key)

    @classmethod
    async def translate(
        cls,
        text: str,
        target_language: str,
        source_language: str = "auto",
        api_key: Optional[str] = None,
    ) -> Optional[str]:
        system_prompt = f"Translate the following text to {target_language}. Return only the translated text."
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": text},
        ]
        return await cls.chat_completion(messages, api_key=api_key)

    @classmethod
    async def summarize(
        cls,
        text: str,
        max_length: int = 100,
        api_key: Optional[str] = None,
    ) -> Optional[str]:
        system_prompt = f"Summarize the following conversation in max {max_length} characters. Focus on the key issue and resolution."
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": text},
        ]
        return await cls.chat_completion(messages, api_key=api_key)

    @classmethod
    async def analyze_sentiment(
        cls,
        text: str,
        api_key: Optional[str] = None,
    ) -> Optional[Dict]:
        system_prompt = "Analyze the sentiment of the following text. Return a JSON object with 'sentiment' (positive/neutral/negative) and 'confidence' (0-1) fields."
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": text},
        ]
        result = await cls.chat_completion(messages, api_key=api_key)
        if result:
            try:
                return json.loads(result)
            except json.JSONDecodeError:
                return {"sentiment": "neutral", "confidence": 0.5}
        return None

    @classmethod
    async def generate_suggestion(
        cls,
        user_message: str,
        knowledge_base: str,
        api_key: Optional[str] = None,
        language: str = "en",
    ) -> Optional[str]:
        system_prompt = f"You are a customer support chatbot. Use the knowledge base to answer the user's question in {language}. If you cannot find an answer, say 'I don't know, let me connect you with an agent.' Be helpful and concise."
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Knowledge base: {knowledge_base}\nUser question: {user_message}"},
        ]
        return await cls.chat_completion(messages, api_key=api_key)
