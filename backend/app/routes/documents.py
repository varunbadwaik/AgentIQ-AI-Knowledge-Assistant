"""
Document management routes for uploading and managing knowledge base documents.
All routes are authenticated and scoped to the current user.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import os
import uuid
from typing import List

from app.database.db import get_db
from app.database.vector_store import add_documents, get_all_sources, delete_by_source, get_document_count
from app.models.document import Document
from app.services.chunker import extract_text, chunk_text
from app.services.embedder import get_embeddings
from app.middleware.auth import get_current_user

router = APIRouter()

IS_VERCEL = os.environ.get("VERCEL") == "1"
UPLOAD_DIR = "/tmp/uploads" if IS_VERCEL else os.path.join(os.path.dirname(__file__), "..", "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".txt", ".md", ".markdown", ".docx"}


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """Upload a document to the user's private knowledge base."""
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    unique_filename = f"{uuid.uuid4().hex}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)
    
    try:
        text = extract_text(file_path)
        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from document")
        
        chunks = chunk_text(text, source=file.filename)
        if not chunks:
            raise HTTPException(status_code=400, detail="No content to process")
        
        chunk_texts = [c["text"] for c in chunks]
        embeddings = get_embeddings(chunk_texts)
        
        chunk_ids = [f"{user_id}_{file.filename}_{i}" for i in range(len(chunks))]
        # Add user_id to each chunk's metadata for isolation
        metadatas = [{**c["metadata"], "user_id": user_id} for c in chunks]
        
        add_documents(
            ids=chunk_ids,
            documents=chunk_texts,
            embeddings=embeddings,
            metadatas=metadatas
        )
        
        doc = Document(
            user_id=user_id,
            filename=unique_filename,
            original_name=file.filename,
            file_type=file_ext,
            file_size=len(content),
            chunk_count=len(chunks)
        )
        db.add(doc)
        await db.commit()
        await db.refresh(doc)
        
        return {
            "message": "Document uploaded successfully",
            "document": doc.to_dict(),
            "chunks_created": len(chunks)
        }
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"UPLOAD ERROR: {str(e)}\n{error_trace}")
        
        if os.path.exists(file_path):
            os.remove(file_path)
            
        # RETURN THE ACTUAL ERROR FOR DEBUGGING
        raise HTTPException(status_code=500, detail=f"Server Error: {str(e)}")


@router.get("/")
async def list_documents(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """List the current user's uploaded documents"""
    result = await db.execute(
        select(Document)
        .where(Document.user_id == user_id)
        .order_by(Document.uploaded_at.desc())
    )
    documents = result.scalars().all()
    return {
        "documents": [doc.to_dict() for doc in documents],
        "total": len(documents),
        "total_chunks": get_document_count(user_id=user_id)
    }


@router.get("/sources")
async def list_sources(user_id: str = Depends(get_current_user)):
    """List unique source files for the current user"""
    sources = get_all_sources(user_id=user_id)
    return {"sources": sources, "count": len(sources)}


@router.delete("/{document_id}")
async def delete_document(
    document_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """Delete a document (only if owned by the current user)"""
    result = await db.execute(
        select(Document).where(Document.id == document_id, Document.user_id == user_id)
    )
    doc = result.scalar_one_or_none()
    
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    delete_by_source(doc.original_name, user_id=user_id)
    
    file_path = os.path.join(UPLOAD_DIR, doc.filename)
    if os.path.exists(file_path):
        os.remove(file_path)
    
    await db.delete(doc)
    await db.commit()
    
    return {"message": "Document deleted", "document_id": document_id}


@router.delete("/by-source/{source_name:path}")
async def delete_document_by_source(
    source_name: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """Delete a document by source name (only for current user)"""
    delete_by_source(source_name, user_id=user_id)
    
    result = await db.execute(
        select(Document).where(Document.original_name == source_name, Document.user_id == user_id)
    )
    docs = result.scalars().all()
    
    for doc in docs:
        file_path = os.path.join(UPLOAD_DIR, doc.filename)
        if os.path.exists(file_path):
            os.remove(file_path)
        await db.delete(doc)
    
    await db.commit()
    
    return {
        "message": f"Document '{source_name}' deleted",
        "source": source_name,
        "records_removed": len(docs)
    }
