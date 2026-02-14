"""
Query routes for the main Q&A functionality.
All routes are authenticated and scoped to the current user.
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import json

from app.database.db import get_db
from app.models.query_log import QueryLog
from app.services.rag_engine import query_knowledge_base, get_context_preview
from app.middleware.auth import get_current_user

router = APIRouter()


class QueryRequest(BaseModel):
    query: str
    top_k: int = 5


class FeedbackRequest(BaseModel):
    query_id: int
    was_helpful: bool


class QueryResponse(BaseModel):
    query: str
    answer: str
    confidence: float
    sources: list
    chunks_retrieved: int
    response_time_ms: int
    query_id: int | None = None


@router.post("/query", response_model=QueryResponse)
async def ask_question(
    request: QueryRequest,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """Ask a question — searches only the current user's documents."""
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    # Run RAG pipeline scoped to user
    result = query_knowledge_base(request.query, top_k=request.top_k, user_id=user_id)
    
    # Log the query
    query_log = QueryLog(
        user_id=user_id,
        query_text=request.query,
        answer_text=result["answer"],
        confidence_score=result["confidence"],
        sources_used=json.dumps(result["sources"]),
        response_time_ms=result["response_time_ms"]
    )
    db.add(query_log)
    await db.commit()
    await db.refresh(query_log)
    
    result["query_id"] = query_log.id
    return result


@router.post("/query/preview")
async def preview_context(
    request: QueryRequest,
    user_id: str = Depends(get_current_user),
):
    """Preview matching context for the current user's documents."""
    chunks = get_context_preview(request.query, top_k=request.top_k, user_id=user_id)
    return {"query": request.query, "matching_chunks": chunks}


@router.post("/feedback")
async def submit_feedback(
    request: FeedbackRequest,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """Submit feedback (only on own queries)"""
    result = await db.execute(
        select(QueryLog).where(QueryLog.id == request.query_id, QueryLog.user_id == user_id)
    )
    query_log = result.scalar_one_or_none()
    
    if not query_log:
        raise HTTPException(status_code=404, detail="Query not found")
    
    query_log.was_helpful = request.was_helpful
    await db.commit()
    
    return {"message": "Feedback recorded", "query_id": request.query_id}
