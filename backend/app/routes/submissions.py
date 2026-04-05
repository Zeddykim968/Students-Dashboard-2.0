from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from ..db import get_db
from .. import schemas, crud
from app.utils.dependencies import get_current_user
import os, time, re

router = APIRouter()

ALLOWED_EXTENSIONS = {
    ".pdf", ".png", ".jpg", ".jpeg", ".dwg", ".dxf",
    ".svg", ".zip", ".rar", ".docx", ".pptx", ".mp4", ".gif", ".webp"
}

def safe_filename(name: str) -> str:
    return re.sub(r"[^\w.\-]", "_", name)

@router.post("/submissions", response_model=schemas.SubmissionResponse)
async def create_submission(
    file: UploadFile = File(...),
    student_id: int = Form(...),
    group_id: int = Form(...),
    description: str = Form(default=""),
    db: Session = Depends(get_db),
    current_user: schemas.TokenPayload = Depends(get_current_user)
) -> schemas.SubmissionResponse:
    if current_user.student_id != student_id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    student = crud.get_student(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    if student.group_id is None:
        raise HTTPException(status_code=400, detail="Student is not in a group")

    if int(student.group_id) != group_id:
        raise HTTPException(status_code=400, detail="Student not in this group")

    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type '{ext}' is not supported")

    os.makedirs("uploads/submissions", exist_ok=True)
    unique_name = f"{student_id}_{int(time.time())}_{safe_filename(file.filename)}"
    file_path = f"uploads/submissions/{unique_name}"
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    file_url = f"/uploads/submissions/{unique_name}"
    return crud.create_submission(db, student_id, group_id, file_url, file.filename, description or None)

@router.patch("/submissions/{submission_id}/grade", response_model=schemas.SubmissionResponse)
def grade_submission(
    submission_id: int,
    data: schemas.GradeSubmission,
    db: Session = Depends(get_db),
    current_user: schemas.TokenPayload = Depends(get_current_user)
):
    student = crud.get_student(db, current_user.student_id)
    if student.role != "lecturer":
        raise HTTPException(status_code=403, detail="Only lecturers can grade submissions")
    return crud.grade_submission(db, submission_id, data.grade, data.lecturer_comment)

@router.delete("/submissions/{submission_id}")
def delete_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.TokenPayload = Depends(get_current_user)
):
    sub = db.query(crud.models.Submission).filter(crud.models.Submission.id == submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    student = crud.get_student(db, current_user.student_id)
    if sub.student_id != current_user.student_id and student.role != "lecturer":
        raise HTTPException(status_code=403, detail="Unauthorized")
    crud.delete_submission(db, submission_id)
    return {"message": "Deleted"}

@router.get("/submissions/{submission_id}/download")
def download_submission(submission_id: int, db: Session = Depends(get_db)):
    sub = db.query(crud.models.Submission).filter(crud.models.Submission.id == submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Not found")
    file_path = sub.file_url.lstrip("/")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on disk")
    return FileResponse(
        path=file_path,
        filename=sub.file_name or os.path.basename(file_path),
        media_type="application/octet-stream"
    )

@router.get("/submissions", response_model=list[schemas.SubmissionResponse])
def read_submissions(db: Session = Depends(get_db)):
    return crud.get_submissions(db)

@router.get("/submissions/student/{student_id}", response_model=list[schemas.SubmissionResponse])
def read_student_submissions(student_id: int, db: Session = Depends(get_db)):
    return crud.get_submissions_by_student(db, student_id)

@router.get("/submissions/group/{group_id}", response_model=list[schemas.SubmissionResponse])
def read_group_submissions(group_id: int, db: Session = Depends(get_db)):
    return crud.get_submissions_by_group(db, group_id)
