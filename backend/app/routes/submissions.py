from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from sqlalchemy.orm import Session
from ..db import get_db
from .. import schemas, crud
from app.utils.dependencies import get_current_user
import os

router = APIRouter()

@router.post("/submissions", response_model=schemas.SubmissionResponse)
async def create_submission(
    file: UploadFile = File(...),
    student_id: int = Form(...),
    group_id: int = Form(...),
    db: Session = Depends(get_db),
    current_user: schemas.TokenPayload = Depends(get_current_user)
) -> schemas.SubmissionResponse:
    """
    Create a new submission with file upload via FormData.
    Expects student_id and group_id from frontend FormData.
    """
    # Verify current user matches submitted student_id
    if current_user.student_id != student_id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    # Ensure the student exists
    student = crud.get_student(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Simple None check using Python value
    if student.group_id is None:
        raise HTTPException(status_code=400, detail="Student is not in a group")
    
    if int(student.group_id) != group_id:
        raise HTTPException(status_code=400, detail="Student not in this group")

    # Save uploaded file
    os.makedirs("uploads/submissions", exist_ok=True)
    file_path = f"uploads/submissions/{file.filename}"
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    file_url = f"/static/{file.filename}"

    return crud.create_submission(
        db, student_id, group_id, file_url
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

