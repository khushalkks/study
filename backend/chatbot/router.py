from fastapi import APIRouter
from pydantic import BaseModel
from chatbot.model import generate_answer

router = APIRouter(prefix="/chat", tags=["Chatbot"])

class ChatRequest(BaseModel):
    question: str

@router.post("")
async def chat(req: ChatRequest):
    answer = generate_answer(req.question)
    return {
        "answer": answer
    }
