"""
Evidence storage service - local filesystem abstraction.
Designed to be swapped with S3-compatible storage in production.
"""
import os
import uuid
import mimetypes
import hashlib
from datetime import datetime
from typing import Optional, List, Dict, Any
from pathlib import Path

# Evidence storage base directory
UPLOAD_DIR = Path(__file__).parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# Supported image MIME types
ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
}

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

# In-memory evidence store (keyed by complaint_id)
_evidence_store: Dict[str, List[Dict[str, Any]]] = {}


def _sanitize_filename(filename: str) -> str:
    """Sanitize filename to prevent path traversal and injection."""
    # Only keep alphanumeric, dash, underscore, dot
    safe = "".join(c for c in filename if c.isalnum() or c in "._-")
    # Limit length
    return safe[:100] if safe else "evidence"


def _validate_image_magic_bytes(data: bytes) -> Optional[str]:
    """Validate image by magic bytes (not just extension/MIME)."""
    if data[:3] == b'\xff\xd8\xff':
        return "image/jpeg"
    if data[:8] == b'\x89PNG\r\n\x1a\n':
        return "image/png"
    if data[:4] == b'RIFF' and data[8:12] == b'WEBP':
        return "image/webp"
    return None


def validate_evidence_file(
    filename: str,
    content_type: str,
    file_bytes: bytes
) -> tuple[bool, str]:
    """
    Validate evidence file. Returns (is_valid, error_message).
    Validates: extension, MIME type, magic bytes, file size.
    """
    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        return False, f"Image must be smaller than 10 MB (got {len(file_bytes) / 1024 / 1024:.1f} MB)"

    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        return False, f"File type '{ext}' is not supported. Use JPG, PNG, or WEBP."

    if content_type not in ALLOWED_MIME_TYPES:
        return False, f"Content type '{content_type}' is not supported."

    detected_mime = _validate_image_magic_bytes(file_bytes)
    if detected_mime is None:
        return False, "Invalid image file. The file does not appear to be a valid image."

    return True, ""


def store_evidence(
    complaint_id: str,
    filename: str,
    content_type: str,
    file_bytes: bytes
) -> Dict[str, Any]:
    """
    Store evidence file and return metadata.
    In production, replace with S3 upload.
    """
    # Sanitize filename
    safe_name = _sanitize_filename(filename)
    ext = Path(filename).suffix.lower() or ".jpg"
    
    # Generate unique filename
    evidence_id = str(uuid.uuid4())
    stored_name = f"{evidence_id}{ext}"
    
    # Create complaint-specific directory
    complaint_dir = UPLOAD_DIR / complaint_id
    complaint_dir.mkdir(exist_ok=True)
    
    # Write file
    file_path = complaint_dir / stored_name
    with open(file_path, "wb") as f:
        f.write(file_bytes)
    
    now = datetime.utcnow().isoformat()
    
    evidence_record = {
        "id": evidence_id,
        "complaint_id": complaint_id,
        "filename": stored_name,
        "original_filename": safe_name,
        "file_type": content_type,
        "file_size_bytes": len(file_bytes),
        "storage_url": f"/api/evidence/{complaint_id}/{stored_name}",
        "upload_timestamp": now,
        "width": None,
        "height": None,
    }
    
    # Store in memory index
    if complaint_id not in _evidence_store:
        _evidence_store[complaint_id] = []
    _evidence_store[complaint_id].append(evidence_record)
    
    return evidence_record


def get_evidence_for_complaint(complaint_id: str) -> List[Dict[str, Any]]:
    """Get all evidence items for a complaint."""
    return _evidence_store.get(complaint_id, [])


def get_evidence_file(complaint_id: str, filename: str) -> Optional[bytes]:
    """
    Retrieve evidence file bytes. 
    Authorization check should happen at endpoint level.
    """
    # Security: validate path components to prevent traversal
    safe_complaint = "".join(c for c in complaint_id if c.isalnum() or c in "-_")
    safe_filename = "".join(c for c in filename if c.isalnum() or c in "._-")
    
    if not safe_complaint or not safe_filename:
        return None
    
    file_path = UPLOAD_DIR / safe_complaint / safe_filename
    
    # Ensure the resolved path is within UPLOAD_DIR
    try:
        resolved = file_path.resolve()
        upload_resolved = UPLOAD_DIR.resolve()
        if not str(resolved).startswith(str(upload_resolved)):
            return None
    except Exception:
        return None
    
    if file_path.exists() and file_path.is_file():
        with open(file_path, "rb") as f:
            return f.read()
    return None


def delete_evidence(complaint_id: str, evidence_id: str) -> bool:
    """Delete a specific evidence item."""
    records = _evidence_store.get(complaint_id, [])
    record = next((r for r in records if r["id"] == evidence_id), None)
    if not record:
        return False
    
    file_path = UPLOAD_DIR / complaint_id / record["filename"]
    if file_path.exists():
        file_path.unlink()
    
    _evidence_store[complaint_id] = [r for r in records if r["id"] != evidence_id]
    return True


def get_total_evidence_count() -> int:
    """Get total evidence files stored."""
    return sum(len(v) for v in _evidence_store.values())
