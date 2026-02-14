"""
Query log model for tracking all queries and analytics
"""

from sqlalchemy import Column, Integer, String, DateTime, Float, Text, Boolean
from datetime import datetime

from app.database.db import Base


class QueryLog(Base):
    __tablename__ = "query_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(255), nullable=False, index=True)
    query_text = Column(Text, nullable=False)
    answer_text = Column(Text)
    confidence_score = Column(Float)
    sources_used = Column(Text)  # JSON string of source files
    response_time_ms = Column(Integer)
    was_helpful = Column(Boolean, nullable=True)  # User feedback
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            "id": self.id,
            "query_text": self.query_text,
            "answer_text": self.answer_text,
            "confidence_score": self.confidence_score,
            "sources_used": self.sources_used,
            "response_time_ms": self.response_time_ms,
            "was_helpful": self.was_helpful,
            "created_at": self.created_at.isoformat()
        }
