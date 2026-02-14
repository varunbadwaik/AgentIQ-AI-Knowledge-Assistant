"""
Embedding service using Cohere API
"""

from typing import List
import cohere
import os

# Lazy-initialized Cohere client (avoids crash at import time if key is missing)
_co = None


def _get_client():
    """Get or create the Cohere client. Raises RuntimeError if API key is not set."""
    global _co
    if _co is None:
        api_key = os.environ.get("COHERE_API_KEY")
        if not api_key:
            raise RuntimeError("COHERE_API_KEY environment variable is not set")
        _co = cohere.Client(api_key=api_key)
    return _co


def _is_mock():
    return os.environ.get("MOCK_EMBEDDINGS") == "true"

def _get_mock_embedding(dim=1024) -> List[float]:
    import random
    return [random.uniform(-1, 1) for _ in range(dim)]


def get_embedding(text: str) -> List[float]:
    """Generate embedding for a single text (for documents)"""
    if _is_mock():
        return _get_mock_embedding()
        
    response = _get_client().embed(
        texts=[text],
        model="embed-english-v3.0",
        input_type="search_document"
    )
    return response.embeddings[0]


def get_embeddings(texts: List[str]) -> List[List[float]]:
    """Generate embeddings for multiple texts"""
    if not texts:
        return []
    
    if _is_mock():
        return [_get_mock_embedding() for _ in texts]
    
    # Cohere can handle batch embeddings
    response = _get_client().embed(
        texts=texts,
        model="embed-english-v3.0",
        input_type="search_document"
    )
    return response.embeddings


def get_query_embedding(text: str) -> List[float]:
    """Generate embedding optimized for queries/search"""
    if _is_mock():
        return _get_mock_embedding()

    response = _get_client().embed(
        texts=[text],
        model="embed-english-v3.0",
        input_type="search_query"
    )
    return response.embeddings[0]
