"""
RAG Engine - Core orchestration for retrieval-augmented generation
"""

from typing import Dict, Any, List
import time

from app.services.embedder import get_embedding, get_query_embedding
from app.services.llm_client import generate_answer, generate_answer_no_context
from app.database.vector_store import search_similar


def query_knowledge_base(
    query: str,
    top_k: int = 5,
    min_relevance: float = 0.3,
    user_id: str = None
) -> Dict[str, Any]:
    """
    Main RAG pipeline: Query -> Embed -> Search -> Generate Answer
    
    Args:
        query: The user's question
        top_k: Number of similar chunks to retrieve
        min_relevance: Minimum similarity score (0-1) to include a result
    
    Returns:
        Dictionary containing answer, sources, confidence, and metadata
    """
    start_time = time.time()
    
    # Step 1: Generate embedding for the query
    query_embedding = get_query_embedding(query)
    
    # Step 2: Search for similar documents
    search_results = search_similar(query_embedding, n_results=top_k, user_id=user_id)
    
    # Step 3: Filter and format results
    context_chunks = []
    sources = []
    
    if search_results and search_results.get("documents"):
        documents = search_results["documents"][0]
        metadatas = search_results.get("metadatas", [[]])[0]
        distances = search_results.get("distances", [[]])[0]
        
        for i, (doc, metadata, distance) in enumerate(zip(documents, metadatas, distances)):
            # ChromaDB returns L2 distance, convert to similarity
            # Lower distance = more similar
            similarity = 1 / (1 + distance)
            
            if similarity >= min_relevance:
                context_chunks.append({
                    "text": doc,
                    "metadata": metadata,
                    "similarity": similarity
                })
                
                source_info = {
                    "source": metadata.get("source", "Unknown"),
                    "chunk_index": metadata.get("chunk_index", 0),
                    "similarity": round(similarity * 100, 1)
                }
                if source_info not in sources:
                    sources.append(source_info)
    
    # Step 4: Generate answer
    if context_chunks:
        answer, confidence = generate_answer(query, context_chunks)
    else:
        answer = generate_answer_no_context(query)
        confidence = 0.0
        sources = []
    
    # Calculate response time
    response_time_ms = int((time.time() - start_time) * 1000)
    
    return {
        "query": query,
        "answer": answer,
        "confidence": confidence,
        "sources": sources,
        "chunks_retrieved": len(context_chunks),
        "response_time_ms": response_time_ms
    }


def get_context_preview(query: str, top_k: int = 3, user_id: str = None) -> List[Dict]:
    """Get a preview of matching context without generating an answer"""
    query_embedding = get_query_embedding(query)
    search_results = search_similar(query_embedding, n_results=top_k, user_id=user_id)
    
    chunks = []
    if search_results and search_results.get("documents"):
        documents = search_results["documents"][0]
        metadatas = search_results.get("metadatas", [[]])[0]
        distances = search_results.get("distances", [[]])[0]
        
        for doc, metadata, distance in zip(documents, metadatas, distances):
            similarity = 1 / (1 + distance)
            chunks.append({
                "text": doc[:300] + "..." if len(doc) > 300 else doc,
                "source": metadata.get("source", "Unknown"),
                "similarity": round(similarity * 100, 1)
            })
    
    return chunks
