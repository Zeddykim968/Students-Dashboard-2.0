from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ...db import get_db
from ... import schemas, crud

router = APIRouter()

@router.post("/submissions", response_model=schemas.SubmissionResponse)
def create_submission(submission: schemas.SubmissionCreate, db: Session = Depends(get_db)):
    return crud.create_submission(db, submission)

@router.get("/submissions", response_model=list[schemas.SubmissionResponse])
def read_submissions(db: Session = Depends(get_db)):
    return crud.get_submissions(db)

@router.get("/submissions/student/{student_id}", response_model=list[schemas.SubmissionResponse])
def read_student_submissions(student_id: int, db: Session = Depends(get_db)):
    return crud.get_submissions_by_student(db, student_id)

@router.get("/submissions/group/{group_id}", response_model=list[schemas.SubmissionResponse])
def read_group_submissions(group_id: int, db: Session = Depends(get_db)):
    return crud.get_submissions_by_group(db, group_id)
