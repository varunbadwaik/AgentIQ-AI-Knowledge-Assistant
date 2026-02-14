"""
Document chunking service for splitting documents into searchable chunks
"""

from typing import List, Dict, Any
import re


def chunk_text(
    text: str,
    chunk_size: int = 500,
    chunk_overlap: int = 100,
    source: str = "unknown"
) -> List[Dict[str, Any]]:
    """
    Split text into overlapping chunks for better context retrieval.
    
    Args:
        text: The full document text
        chunk_size: Target size for each chunk (in characters)
        chunk_overlap: Number of characters to overlap between chunks
        source: Source file name for metadata
    
    Returns:
        List of chunk dictionaries with text and metadata
    """
    # Clean the text
    text = text.strip()
    text = re.sub(r'\n{3,}', '\n\n', text)  # Normalize multiple newlines
    
    if len(text) <= chunk_size:
        return [{
            "text": text,
            "metadata": {
                "source": source,
                "chunk_index": 0,
                "total_chunks": 1,
                "char_start": 0,
                "char_end": len(text)
            }
        }]
    
    chunks = []
    start = 0
    chunk_index = 0
    
    while start < len(text):
        end = start + chunk_size
        
        # Try to break at a sentence or paragraph boundary
        if end < len(text):
            # Look for sentence endings
            last_period = text.rfind('.', start + chunk_size // 2, end)
            last_newline = text.rfind('\n', start + chunk_size // 2, end)
            
            break_point = max(last_period, last_newline)
            if break_point > start + chunk_size // 2:
                end = break_point + 1
        
        chunk_text_content = text[start:end].strip()
        
        if chunk_text_content:
            chunks.append({
                "text": chunk_text_content,
                "metadata": {
                    "source": source,
                    "chunk_index": chunk_index,
                    "char_start": start,
                    "char_end": end
                }
            })
            chunk_index += 1
        
        start = end - chunk_overlap
        if start >= len(text):
            break
    
    # Update total_chunks in all metadata
    for chunk in chunks:
        chunk["metadata"]["total_chunks"] = len(chunks)
    
    return chunks


def extract_text_from_pdf(file_path: str) -> str:
    """Extract text content from a PDF file"""
    from pypdf import PdfReader
    
    reader = PdfReader(file_path)
    text_parts = []
    
    for page_num, page in enumerate(reader.pages):
        page_text = page.extract_text()
        if page_text:
            text_parts.append(f"[Page {page_num + 1}]\n{page_text}")
    
    return "\n\n".join(text_parts)


def extract_text_from_docx(file_path: str) -> str:
    """Extract text content from a DOCX file"""
    from docx import Document
    
    doc = Document(file_path)
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    return "\n\n".join(paragraphs)


def extract_text(file_path: str) -> str:
    """Extract text from various file formats"""
    file_path_lower = file_path.lower()
    
    if file_path_lower.endswith('.pdf'):
        return extract_text_from_pdf(file_path)
    elif file_path_lower.endswith('.docx'):
        return extract_text_from_docx(file_path)
    elif file_path_lower.endswith(('.txt', '.md', '.markdown')):
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    else:
        raise ValueError(f"Unsupported file format: {file_path}")
