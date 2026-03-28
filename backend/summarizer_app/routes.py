import os
import io
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel

from summarizer_app.utils import extract_text_from_file
from summarizer_app.summarizer import summarize_text
from summarizer_app.mindmap import (
    extract_text_from_file as mindmap_extract,
    extract_keywords,
    generate_tree,
    json_to_mermaid,
)

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ==============================
# Request Models
# ==============================

class MindmapTopicRequest(BaseModel):
    topic: str


# ==============================
# SUMMARIZER ENDPOINT
# ==============================

@router.post("/summarize")
async def summarize_file(file: UploadFile = File(...)):
    """Upload a file → get back an AI-generated summary."""

    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    try:
        # Save uploaded file temporarily
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)

        # Extract text
        text = extract_text_from_file(file_path)
        if not text.strip():
            raise HTTPException(
                status_code=400,
                detail="Unable to extract text from file"
            )

        # Generate summary
        summary = summarize_text(text)

        return {
            "filename": file.filename,
            "summary": summary,
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if os.path.exists(file_path):
            os.remove(file_path)


# ==============================
# MINDMAP — File Upload Route
# ==============================

@router.post("/mindmap/upload")
async def mindmap_from_file(file: UploadFile = File(...)):
    """Upload a file → extract keywords → return mermaid mindmap."""

    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")

    allowed = (".pdf", ".docx", ".txt")
    if not file.filename.lower().endswith(allowed):
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type. Allowed: {', '.join(allowed)}"
        )

    try:
        # Read file into memory — wrap in BytesIO so mindmap functions can use it
        content = await file.read()
        file_obj = io.BytesIO(content)
        file_obj.filename = file.filename  # type: ignore[attr-defined]

        # Extract text → keywords → tree → mermaid
        text = mindmap_extract(file_obj)
        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from file")

        keywords = extract_keywords(text)
        primary  = keywords[0] if keywords else file.filename

        tree    = generate_tree(primary)
        mermaid = json_to_mermaid(tree)

        return {
            "filename":      file.filename,
            "keywords":      keywords,
            "primary_topic": primary,
            "mermaid":       mermaid,
            "tree":          tree,
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==============================
# MINDMAP — Manual Topic Route
# ==============================

@router.post("/mindmap/topic")
async def mindmap_from_topic(request: MindmapTopicRequest):
    """Provide a topic string → return mermaid mindmap directly."""

    if not request.topic.strip():
        raise HTTPException(status_code=400, detail="Topic is required")

    try:
        tree    = generate_tree(request.topic)
        mermaid = json_to_mermaid(tree)

        return {
            "topic":   request.topic,
            "mermaid": mermaid,
            "tree":    tree,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))