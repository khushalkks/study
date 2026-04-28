from fastapi import APIRouter, UploadFile, File, HTTPException
from summarizer_app.quizz import generate_quiz_from_upload
import io

router = APIRouter(prefix="/quiz", tags=["Quiz"])

@router.post("/generate")
async def create_quiz(file: UploadFile = File(...), difficulty: str = "medium"):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file")
    
    try:
        content = await file.read()
        file_obj = io.BytesIO(content)
        file_obj.filename = file.filename
        
        result = generate_quiz_from_upload(file_obj, difficulty)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
