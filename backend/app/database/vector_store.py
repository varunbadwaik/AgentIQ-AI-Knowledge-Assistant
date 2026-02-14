"""
Simple In-Memory Vector Store (Python 3.14 compatible)
Uses numpy for cosine similarity - no external vector DB needed.
Supports per-user data isolation via user_id in metadata.
"""

import numpy as np
from typing import List, Dict, Any, Optional
import json
import os

# Simple file-based persistence
IS_VERCEL = os.environ.get("VERCEL") == "1"
STORE_PATH = "/tmp/vector_store.json" if IS_VERCEL else os.path.join(os.path.dirname(__file__), "..", "..", "vector_store.json")


class SimpleVectorStore:
    def __init__(self):
        self.documents: List[str] = []
        self.embeddings: List[List[float]] = []
        self.metadatas: List[Dict[str, Any]] = []
        self.ids: List[str] = []
        self._load()
    
    def _load(self):
        """Load from disk if exists"""
        if os.path.exists(STORE_PATH):
            try:
                with open(STORE_PATH, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self.documents = data.get("documents", [])
                    self.embeddings = data.get("embeddings", [])
                    self.metadatas = data.get("metadatas", [])
                    self.ids = data.get("ids", [])
            except Exception:
                pass
    
    def _save(self):
        """Persist to disk"""
        os.makedirs(os.path.dirname(STORE_PATH), exist_ok=True)
        with open(STORE_PATH, 'w', encoding='utf-8') as f:
            json.dump({
                "documents": self.documents,
                "embeddings": self.embeddings,
                "metadatas": self.metadatas,
                "ids": self.ids
            }, f)
    
    def add(self, ids: List[str], documents: List[str], embeddings: List[List[float]], metadatas: List[Dict]):
        """Add documents to the store"""
        self.ids.extend(ids)
        self.documents.extend(documents)
        self.embeddings.extend(embeddings)
        self.metadatas.extend(metadatas)
        self._save()
    
    def search(self, query_embedding: List[float], n_results: int = 5, user_id: str = None) -> Dict[str, Any]:
        """Search for similar documents using cosine similarity, filtered by user_id"""
        if not self.embeddings:
            return {"documents": [[]], "metadatas": [[]], "distances": [[]]}
        
        # Filter indices by user_id
        if user_id:
            indices = [i for i, m in enumerate(self.metadatas) if m.get("user_id") == user_id]
        else:
            indices = list(range(len(self.embeddings)))
        
        if not indices:
            return {"documents": [[]], "metadatas": [[]], "distances": [[]]}
        
        query_vec = np.array(query_embedding)
        filtered_embeddings = np.array([self.embeddings[i] for i in indices])
        
        # Cosine similarity
        query_norm = query_vec / (np.linalg.norm(query_vec) + 1e-10)
        doc_norms = filtered_embeddings / (np.linalg.norm(filtered_embeddings, axis=1, keepdims=True) + 1e-10)
        similarities = np.dot(doc_norms, query_norm)
        
        # Get top N
        top_k = min(n_results, len(indices))
        top_relative = np.argsort(similarities)[::-1][:top_k]
        top_indices = [indices[i] for i in top_relative]
        
        distances = [float(1 - similarities[i]) for i in top_relative]
        documents = [self.documents[idx] for idx in top_indices]
        metadatas = [self.metadatas[idx] for idx in top_indices]
        
        return {
            "documents": [documents],
            "metadatas": [metadatas],
            "distances": [distances]
        }
    
    def count(self, user_id: str = None) -> int:
        if user_id:
            return sum(1 for m in self.metadatas if m.get("user_id") == user_id)
        return len(self.documents)
    
    def get_all_sources(self, user_id: str = None) -> List[str]:
        sources = set()
        for m in self.metadatas:
            if m and "source" in m:
                if user_id is None or m.get("user_id") == user_id:
                    sources.add(m["source"])
        return list(sources)
    
    def delete_by_source(self, source: str, user_id: str = None):
        """Delete all chunks from a specific source, scoped to user"""
        if user_id:
            indices_to_keep = [
                i for i, m in enumerate(self.metadatas)
                if not (m.get("source") == source and m.get("user_id") == user_id)
            ]
        else:
            indices_to_keep = [i for i, m in enumerate(self.metadatas) if m.get("source") != source]
        
        self.ids = [self.ids[i] for i in indices_to_keep]
        self.documents = [self.documents[i] for i in indices_to_keep]
        self.embeddings = [self.embeddings[i] for i in indices_to_keep]
        self.metadatas = [self.metadatas[i] for i in indices_to_keep]
        self._save()


# Global instance
_store: Optional[SimpleVectorStore] = None


def get_store() -> SimpleVectorStore:
    global _store
    if _store is None:
        _store = SimpleVectorStore()
    return _store


def add_documents(ids: List[str], documents: List[str], embeddings: List[List[float]], metadatas: List[Dict[str, Any]]) -> None:
    get_store().add(ids, documents, embeddings, metadatas)


def search_similar(query_embedding: List[float], n_results: int = 5, user_id: str = None) -> Dict[str, Any]:
    return get_store().search(query_embedding, n_results, user_id=user_id)


def get_document_count(user_id: str = None) -> int:
    return get_store().count(user_id=user_id)


def delete_by_source(source_file: str, user_id: str = None) -> None:
    get_store().delete_by_source(source_file, user_id=user_id)


def get_all_sources(user_id: str = None) -> List[str]:
    return get_store().get_all_sources(user_id=user_id)
