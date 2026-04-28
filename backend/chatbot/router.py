from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel
from typing import Optional
import requests
import json
import base64
import io

router = APIRouter(prefix="/chat", tags=["Chat"])

OLLAMA_BASE_URL = "http://localhost:11434"
OLLAMA_MODEL = "llama3.2"
OLLAMA_TIMEOUT = 120

class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = "No document context. Answer generally."

class ChatResponse(BaseModel):
    reply: str
    model: str

def ollama_generate(prompt: str, system: str = "") -> str:
    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.7,
            "top_p": 0.9,
            "num_predict": 1024,
        }
    }
    if system:
        payload["system"] = system

    try:
        resp = requests.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json=payload,
            timeout=OLLAMA_TIMEOUT
        )
        resp.raise_for_status()
        data = resp.json()
        return data.get("response", "").strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ollama error: {str(e)}")

@router.post("")
async def chat(request: ChatRequest):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message empty")

    system_prompt = """Tu ek helpful AI assistant hai jo document questions answer karta hai.
Hinglish mein jawab do (Hindi + English mix). Friendly raho."""

    user_prompt = f"Context:\n{request.context}\n\nQuestion: {request.message}"
    reply = ollama_generate(user_prompt, system_prompt)

    return ChatResponse(reply=reply, model=OLLAMA_MODEL)
