import io

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from starlette.concurrency import run_in_threadpool

from summarizer_app.quizz import generate_quiz_from_upload

router = APIRouter(prefix="", tags=["quiz"])


@router.post("/quiz/generate")
async def generate_quiz(
    file: UploadFile = File(...),
    difficulty: str = Form("easy"),
) -> dict:
    if not file.filename:
        raise HTTPException(status_code=400, detail="File ka name missing hai.")

    difficulty = (difficulty or "").strip().lower()
    if difficulty not in {"easy", "medium", "hard"}:
        raise HTTPException(status_code=400, detail="difficulty galat hai. Use: easy/medium/hard")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file empty hai.")

    bio = io.BytesIO(content)
    bio.filename = file.filename.lower()

    try:
        result = await run_in_threadpool(generate_quiz_from_upload, bio, difficulty)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quiz generate failed: {e}")

    return result
