from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import get_db
from .. import schemas, crud
from utils.dependencies import get_current_user

router = APIRouter()

@router.post("/submissions", response_model=schemas.SubmissionResponse)
def create_submission(submission: schemas.SubmissionCreate, current_user: schemas.TokenPayload = Depends(get_current_user), db: Session = Depends(get_db)) -> schemas.SubmissionResponse:
    """
    Create a new submission for the authenticated student.
    Uses the current user's student_id from the token payload.
    """
    student_id = current_user.student_id  # ✅ use typed field, not dict access

    # Ensure the student exists
    student = crud.get_student(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    if student.group_id is None:
        raise HTTPException(status_code=400, detail="Student is not in a group")

    return crud.create_submission(
        db=db, 
        student_id = student_id,
        group_id= int(student.group_id),  # ✅ use student's group_id directly
        file_url= submission.file_url
        )  # ✅ pass student_id directly

@router.get("/submissions", response_model=list[schemas.SubmissionResponse])
def read_submissions(db: Session = Depends(get_db)):
    return crud.get_submissions(db)

@router.get("/submissions/student/{student_id}", response_model=list[schemas.SubmissionResponse])
def read_student_submissions(student_id: int, db: Session = Depends(get_db)):
    return crud.get_submissions_by_student(db, student_id)

@router.get("/submissions/group/{group_id}", response_model=list[schemas.SubmissionResponse])
def read_group_submissions(group_id: int, db: Session = Depends(get_db)):
    return crud.get_submissions_by_group(db, group_id)
