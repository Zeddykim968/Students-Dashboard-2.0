from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..db import get_db
from .. import schemas, crud
from app.utils.dependencies import get_current_user

router = APIRouter()

@router.get("/assignments", response_model=List[schemas.AssignmentResponse])
def list_assignments(db: Session = Depends(get_db)):
    return crud.get_assignments(db)

@router.post("/assignments", response_model=schemas.AssignmentResponse)
def create_assignment(
    data: schemas.AssignmentCreate,
    db: Session = Depends(get_db),
    current_user: schemas.TokenPayload = Depends(get_current_user)
):
    student = crud.get_student(db, current_user.student_id)
    if student.role != "lecturer":
        raise HTTPException(status_code=403, detail="Only lecturers can create assignments")
    return crud.create_assignment(db, data)

@router.delete("/assignments/{assignment_id}")
def delete_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.TokenPayload = Depends(get_current_user)
):
    student = crud.get_student(db, current_user.student_id)
    if student.role != "lecturer":
        raise HTTPException(status_code=403, detail="Only lecturers can delete assignments")
    crud.delete_assignment(db, assignment_id)
    return {"message": "Deleted"}
