import io
import asyncio
from pathlib import Path
import pytest
from fastapi import UploadFile, HTTPException
from app.modules.api_routes import (
    _validate_uploaded_file,
    upload_document,
    list_documents,
    get_document,
    update_document_status,
    download_document,
    delete_document,
    DOCUMENTS_UPLOAD_DIR,
)
from app.database.models_document import VALID_STATUSES


def test_validation_allowed_extensions_and_types():
    """Verify that PDF, PNG, and JPEG magic bytes pass validation."""
    # Valid PDF
    pdf_content = b"%PDF-1.4 sample content with valid header"
    ext, mime = _validate_uploaded_file("report.pdf", pdf_content)
    assert ext == ".pdf"
    assert mime == "application/pdf"

    # Valid PNG
    png_content = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR"
    ext, mime = _validate_uploaded_file("photo.png", png_content)
    assert ext == ".png"
    assert mime == "image/png"

    # Valid JPEG
    jpg_content = b"\xff\xd8\xff\xe0\x00\x10JFIF"
    ext, mime = _validate_uploaded_file("receipt.jpg", jpg_content)
    assert ext in {".jpg", ".jpeg"}
    assert mime == "image/jpeg"


def test_validation_rejects_unsupported_extensions():
    """Step 2: Reject files with extensions outside PDF, JPG, PNG."""
    with pytest.raises(HTTPException) as exc_info:
        _validate_uploaded_file("script.py", b"print('hello')")
    assert exc_info.value.status_code == 400
    assert "Unsupported file extension" in exc_info.value.detail


def test_validation_rejects_empty_files():
    """Step 2: Reject empty 0-byte files."""
    with pytest.raises(HTTPException) as exc_info:
        _validate_uploaded_file("empty.pdf", b"")
    assert exc_info.value.status_code == 400
    assert "Empty file" in exc_info.value.detail


def test_validation_rejects_oversized_files():
    """Step 2: Reject files exceeding 5MB."""
    oversized = b"%PDF" + b"0" * (5 * 1024 * 1024 + 10)
    with pytest.raises(HTTPException) as exc_info:
        _validate_uploaded_file("big.pdf", oversized)
    assert exc_info.value.status_code == 400
    assert "exceeds maximum permitted size" in exc_info.value.detail


def test_validation_rejects_corrupted_header():
    """Step 2: Reject files with mismatched magic bytes."""
    with pytest.raises(HTTPException) as exc_info:
        _validate_uploaded_file("fake.pdf", b"This is plain text pretending to be PDF")
    assert exc_info.value.status_code == 400
    assert "Corrupt or invalid PDF" in exc_info.value.detail


def run_coro(coro):
    try:
        coro.send(None)
    except StopIteration as e:
        return e.value
    raise RuntimeError("Coroutine did not finish synchronously")


def test_upload_and_verification_workflow():
    """Step 3, 4, 5: Upload valid document, verify secure UUID storage, and test 4 lifecycle statuses."""
    pdf_bytes = b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"
    upload_file = UploadFile(
        file=io.BytesIO(pdf_bytes),
        filename="fssai_cert.pdf",
        headers={"content-type": "application/pdf"}
    )

    # Step 3: Upload
    res = run_coro(upload_document(
        file=upload_file,
        user_id="usr_test123",
        category="license",
        title="FSSAI Food Manufacturing License",
        db=None
    ))
    assert res["success"] is True
    doc = res["document"]
    doc_id = doc["id"]

    # Step 4: Secure UUID filename outside web root
    assert doc_id in doc["stored_filename"]
    assert doc["verification_status"] == "Uploaded"
    assert doc["category"] == "license"
    assert doc["title"] == "FSSAI Food Manufacturing License"

    # Verify file exists on disk in DOCUMENTS_UPLOAD_DIR
    stored_path = DOCUMENTS_UPLOAD_DIR / doc["stored_filename"]
    assert stored_path.exists()
    assert stored_path.stat().st_size == len(pdf_bytes)

    # Step 5: Test 4 Lifecycle verification statuses
    for target_status in ["Pending review", "Verified by reviewer", "Rejected"]:
        updated = run_coro(update_document_status(
            document_id=doc_id,
            payload={
                "verification_status": target_status,
                "reviewer_notes": f"Appraised to status {target_status}",
                "rejection_reason": "Missing QR code" if target_status == "Rejected" else None
            },
            db=None
        ))
        assert updated["verification_status"] == target_status

    # Step 5b: Reject invalid status
    with pytest.raises(HTTPException) as exc_info:
        run_coro(update_document_status(
            document_id=doc_id,
            payload={"verification_status": "InvalidCustomStatus"},
            db=None
        ))
    assert exc_info.value.status_code == 400

    # Test get single document
    fetched = run_coro(get_document(doc_id, db=None))
    assert fetched["id"] == doc_id
    assert fetched["category"] == "license"

    # Test list endpoint
    all_docs = run_coro(list_documents(user_id="usr_test123", category="license", db=None))
    doc_ids = [d["id"] for d in all_docs]
    assert doc_id in doc_ids

    # Test file download endpoint returns FileResponse pointing to valid path
    dl_resp = run_coro(download_document(doc_id, db=None))
    assert Path(dl_resp.path).exists()
    assert dl_resp.filename == "fssai_cert.pdf"

    # Clean up test document
    del_res = run_coro(delete_document(doc_id, db=None))
    assert del_res["success"] is True
    assert not stored_path.exists()


def test_png_document_upload_and_delete():
    """Verify PNG upload, metadata formatting, and cleanup."""
    png_bytes = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDRsample"
    upload_file = UploadFile(
        file=io.BytesIO(png_bytes),
        filename="land_712.png",
        headers={"content-type": "image/png"}
    )

    res = run_coro(upload_document(
        file=upload_file,
        user_id="usr_test456",
        category="land_712",
        title="Katol 7/12 Land Record",
        db=None
    ))
    assert res["success"] is True
    doc = res["document"]
    assert doc["verification_status"] == "Uploaded"
    assert doc["file_type"] == "image/png"

    # Clean up
    del_res = run_coro(delete_document(doc["id"], db=None))
    assert del_res["success"] is True
