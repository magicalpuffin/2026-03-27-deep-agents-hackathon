"""
utils.py — Document processing utilities
"""


def chunk_document(text: str, max_chars: int = 8000, overlap: int = 500) -> list[str]:
    """Split text into chunks on paragraph boundaries.

    Args:
        text: The full document text.
        max_chars: Maximum characters per chunk.
        overlap: Number of characters to overlap between chunks.

    Returns:
        List of text chunks.
    """
    if len(text) <= max_chars:
        return [text]

    paragraphs = text.split("\n\n")
    chunks: list[str] = []
    current_chunk: list[str] = []
    current_len = 0

    for para in paragraphs:
        para_len = len(para) + 2  # account for \n\n
        if current_len + para_len > max_chars and current_chunk:
            chunks.append("\n\n".join(current_chunk))
            # Keep paragraphs for overlap
            overlap_chunk: list[str] = []
            overlap_len = 0
            for p in reversed(current_chunk):
                if overlap_len + len(p) + 2 > overlap:
                    break
                overlap_chunk.insert(0, p)
                overlap_len += len(p) + 2
            current_chunk = overlap_chunk
            current_len = overlap_len

        current_chunk.append(para)
        current_len += para_len

    if current_chunk:
        chunks.append("\n\n".join(current_chunk))

    return chunks
