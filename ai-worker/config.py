import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    rabbitmq_url: str = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")
    groq_api_key: str = os.getenv("GROQ_API_KEY", "")
    groq_api_url: str = os.getenv("GROQ_API_URL", "https://api.groq.com/openai/v1/chat/completions")
    groq_model: str = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
    exchange_name: str = os.getenv("WORKER_EXCHANGE", "worker.exchange")
    ai_request_queue: str = os.getenv("AI_REQUEST_QUEUE", "ai.request.queue")
    ai_result_queue: str = os.getenv("AI_RESULT_QUEUE", "ai.result.queue")
    prefetch_count: int = int(os.getenv("PREFETCH_COUNT", "5"))
    request_timeout_s: int = int(os.getenv("GROQ_TIMEOUT_S", "30"))


settings = Settings()