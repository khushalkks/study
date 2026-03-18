from pydantic import BaseModel

class ChatRequest(BaseModel):
    question: str
    context: str   # summary / document text

class ChatResponse(BaseModel):
    answer: str
