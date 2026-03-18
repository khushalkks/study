import os
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel

from summarizer_app.utils import extract_text_from_file
from summarizer_app.summarizer import summarize_text
from summarizer_app.mindmap import generate_mindmap

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ==============================
# Request Model for Mindmap
# ==============================
class MindmapRequest(BaseModel):
    topic: str


# ==============================
# SUMMARIZER ENDPOINT
# ==============================
@router.post("/summarize")
async def summarize_file(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    try:
        # ✅ Save uploaded file
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)

        # ✅ Extract text
        text = extract_text_from_file(file_path)

        if not text.strip():
            raise HTTPException(
                status_code=400,
                detail="Unable to extract text from file"
            )

        # ✅ Generate summary
        summary = summarize_text(text)

        return {
            "filename": file.filename,
            "summary": summary
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        # ✅ Delete file after processing
        if os.path.exists(file_path):
            os.remove(file_path)


# ==============================
# MINDMAP ENDPOINT
# ==============================
@router.post("/mindmap")
async def create_mindmap(request: MindmapRequest):
    if not request.topic.strip():
        raise HTTPException(status_code=400, detail="Topic is required")

    try:
        mindmap_result = generate_mindmap(request.topic)

        return {
            "topic": request.topic,
            "mindmap": mindmap_result
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))