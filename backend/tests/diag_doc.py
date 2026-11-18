import io
import asyncio
from pathlib import Path
from fastapi import UploadFile
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

async def main():
    print("1. Testing validation...")
    ext, mime = _validate_uploaded_file("doc.pdf", b"%PDF-1.4 header")
    print(f"Validation ok: {ext}, {mime}")

    print("2. Testing upload...")
    f = UploadFile(filename="fssai.pdf", file=io.BytesIO(b"%PDF-1.4 test content"))
    res = await upload_document(file=f, user_id="u1", category="license", title="FSSAI License", db=None)
    print(f"Upload ok: {res['document']['id']}")
    doc_id = res["document"]["id"]

    print("3. Testing status update...")
    upd = await update_document_status(document_id=doc_id, payload={"verification_status": "Verified by reviewer"}, db=None)
    print(f"Status update ok: {upd['verification_status']}")

    print("4. Testing list...")
    docs = await list_documents(user_id="u1", db=None)
    print(f"List ok: {len(docs)} documents")

    print("5. Testing delete...")
    del_res = await delete_document(document_id=doc_id, db=None)
    print(f"Delete ok: {del_res}")

    print("ALL TESTS COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(main())
