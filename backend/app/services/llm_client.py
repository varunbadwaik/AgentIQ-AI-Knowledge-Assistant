"""
LLM client for generating answers using Cohere
"""

import cohere
import os
from typing import List, Dict, Tuple

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


def generate_answer(
    query: str,
    context_chunks: List[Dict],
    max_tokens: int = 500
) -> Tuple[str, float]:
    """
    Generate an answer based on the query and retrieved context chunks.
    
    Returns:
        Tuple of (answer_text, confidence_score)
    """
    # Mock mode for local dev
    if os.environ.get("MOCK_EMBEDDINGS") == "true":
        sources = [c.get("metadata", {}).get("source", "Unknown") for c in context_chunks]
        source_list = ", ".join(set(sources)) if sources else "uploaded documents"
        return (
            f"[Mock LLM] Based on your documents ({source_list}), here is a placeholder answer for: '{query}'. "
            f"To get real AI answers, set your COHERE_API_KEY in backend/.env.",
            75.0
        )

    # Build context from chunks
    context_parts = []
    for i, chunk in enumerate(context_chunks):
        source = chunk.get("metadata", {}).get("source", "Unknown")
        text = chunk.get("text", "")
        context_parts.append(f"[Source {i+1}: {source}]\n{text}")
    
    context = "\n\n---\n\n".join(context_parts)
    
    prompt = f"""You are AgentIQ, an AI knowledge assistant for support agents. Your job is to:
1. Answer questions accurately based ONLY on the provided context
2. Always cite which source(s) you used for your answer
3. If the context doesn't contain enough information, say so clearly
4. Be concise but complete

Context from knowledge base:
{context}

---

Question: {query}

Provide a helpful answer based on the context above. Include source citations.
At the end of your response, write exactly: [CONFIDENCE: XX%] where XX is your confidence score from 0-100."""

    try:
        response = _get_client().chat(
            message=prompt,
            model="command-a-03-2025",
            temperature=0.3,
            max_tokens=max_tokens
        )
        
        answer = response.text
        
        # Extract confidence score
        confidence = 70.0  # Default
        if "[CONFIDENCE:" in answer:
            try:
                conf_str = answer.split("[CONFIDENCE:")[1].split("%]")[0].strip()
                confidence = float(conf_str)
                # Remove confidence from answer text
                answer = answer.split("[CONFIDENCE:")[0].strip()
            except (IndexError, ValueError):
                pass
        
        return answer, confidence
    except Exception as e:
        return f"Error generating answer: {str(e)}", 0.0


def generate_answer_no_context(query: str) -> str:
    """Generate a response when no relevant context is found"""
    if os.environ.get("MOCK_EMBEDDINGS") == "true":
        return "No relevant documents were found for your question. Please upload some documents first, then try again."
    
    try:
        response = _get_client().chat(
            message=f"The user asked: '{query}' but no relevant documents were found in the knowledge base. Politely explain this and suggest they upload relevant documents or rephrase their question.",
            model="command-a-03-2025",
            temperature=0.5,
            max_tokens=150
        )
        return response.text
    except Exception as e:
        return f"I couldn't find any relevant documents for your question. Please upload some documents first. (Error: {str(e)})"
