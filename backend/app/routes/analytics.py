"""
Analytics routes for usage statistics and knowledge insights.
All routes are authenticated and scoped to the current user.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from datetime import datetime, timedelta
import json

from app.database.db import get_db
from app.database.vector_store import get_document_count, get_all_sources
from app.models.query_log import QueryLog
from app.models.document import Document
from app.middleware.auth import get_current_user

router = APIRouter()


@router.get("/stats")
async def get_stats(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """Get the current user's knowledge base statistics"""
    query_count = await db.execute(
        select(func.count(QueryLog.id)).where(QueryLog.user_id == user_id)
    )
    total_queries = query_count.scalar() or 0
    
    doc_count = await db.execute(
        select(func.count(Document.id)).where(Document.user_id == user_id)
    )
    total_documents = doc_count.scalar() or 0
    
    avg_conf = await db.execute(
        select(func.avg(QueryLog.confidence_score))
        .where(QueryLog.user_id == user_id, QueryLog.confidence_score > 0)
    )
    avg_confidence = avg_conf.scalar() or 0
    
    helpful_count = await db.execute(
        select(func.count(QueryLog.id))
        .where(QueryLog.user_id == user_id, QueryLog.was_helpful == True)
    )
    not_helpful_count = await db.execute(
        select(func.count(QueryLog.id))
        .where(QueryLog.user_id == user_id, QueryLog.was_helpful == False)
    )
    helpful = helpful_count.scalar() or 0
    not_helpful = not_helpful_count.scalar() or 0
    total_feedback = helpful + not_helpful
    helpful_rate = (helpful / total_feedback * 100) if total_feedback > 0 else 0
    
    return {
        "total_documents": total_documents,
        "total_chunks": get_document_count(user_id=user_id),
        "total_queries": total_queries,
        "average_confidence": round(avg_confidence, 1),
        "helpful_rate": round(helpful_rate, 1),
        "feedback_count": total_feedback
    }


@router.get("/top-sources")
async def get_top_sources(
    limit: int = 10,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """Get the user's most frequently used sources"""
    result = await db.execute(
        select(QueryLog.sources_used)
        .where(QueryLog.user_id == user_id, QueryLog.sources_used.isnot(None))
    )
    rows = result.all()
    
    source_counts = {}
    for row in rows:
        try:
            sources = json.loads(row[0]) if row[0] else []
            for source in sources:
                name = source.get("source", "Unknown")
                source_counts[name] = source_counts.get(name, 0) + 1
        except json.JSONDecodeError:
            pass
    
    sorted_sources = sorted(source_counts.items(), key=lambda x: x[1], reverse=True)[:limit]
    return {
        "top_sources": [{"source": s, "usage_count": c} for s, c in sorted_sources]
    }


@router.get("/low-confidence")
async def get_low_confidence_queries(
    threshold: float = 50.0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """Get the user's queries with low confidence scores"""
    result = await db.execute(
        select(QueryLog)
        .where(QueryLog.user_id == user_id, QueryLog.confidence_score < threshold)
        .order_by(QueryLog.confidence_score.asc())
        .limit(limit)
    )
    queries = result.scalars().all()
    
    return {
        "knowledge_gaps": [
            {
                "id": q.id,
                "query": q.query_text,
                "confidence": q.confidence_score,
                "created_at": q.created_at.isoformat()
            }
            for q in queries
        ],
        "threshold": threshold,
        "count": len(queries)
    }


@router.delete("/query/{query_id}")
async def delete_query_log(
    query_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """Delete a query log (only own entries)"""
    result = await db.execute(
        select(QueryLog).where(QueryLog.id == query_id, QueryLog.user_id == user_id)
    )
    query = result.scalar_one_or_none()
    
    if not query:
        raise HTTPException(status_code=404, detail="Query log not found")
    
    await db.delete(query)
    await db.commit()
    
    return {"message": "Query deleted", "query_id": query_id}


@router.get("/recent-queries")
async def get_recent_queries(
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """Get the user's most recent queries"""
    result = await db.execute(
        select(QueryLog)
        .where(QueryLog.user_id == user_id)
        .order_by(QueryLog.created_at.desc())
        .limit(limit)
    )
    queries = result.scalars().all()
    
    return {"queries": [q.to_dict() for q in queries]}


@router.get("/trends")
async def get_query_trends(
    days: int = 7,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """Get the user's query volume trends"""
    cutoff = datetime.utcnow() - timedelta(days=days)
    
    result = await db.execute(
        select(QueryLog.created_at)
        .where(QueryLog.user_id == user_id, QueryLog.created_at >= cutoff)
        .order_by(QueryLog.created_at)
    )
    queries = result.all()
    
    daily_counts = {}
    for q in queries:
        day = q[0].strftime("%Y-%m-%d")
        daily_counts[day] = daily_counts.get(day, 0) + 1
    
    return {
        "period_days": days,
        "daily_queries": [{"date": d, "count": c} for d, c in sorted(daily_counts.items())]
    }
