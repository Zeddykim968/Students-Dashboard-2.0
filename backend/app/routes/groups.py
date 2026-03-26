from fastapi import APIRouter, Depends, Path
from sqlalchemy.orm import Session
from ...db import get_db
from ... import schemas, crud

router = APIRouter()

@router.post("/groups", response_model=schemas.GroupResponse)
def create_group(group: schemas.GroupCreate, db: Session = Depends(get_db)):
    return crud.create_group(db, group)

@router.get("/groups", response_model=list[schemas.GroupResponse])
def read_groups(db: Session = Depends(get_db)):
    return crud.get_groups(db)

@router.post("/groups/{group_id}/enroll/{student_id}")
def enroll_student(group_id: int = Path(..., title="Group ID"), student_id: int = Path(..., title="Student ID"), db: Session = Depends(get_db)):
    enrollment = schemas.EnrollmentCreate(group_id=group_id, student_id=student_id)
    crud.create_enrollment(db, enrollment)
    return {"message": f"Student {student_id} enrolled in group {group_id}"}
