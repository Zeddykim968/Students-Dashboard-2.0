# Assignment-related API routes for the Student Group Assignment System.
# This module defines API endpoints for managing assignments, including listing all assignments, creating new assignments (restricted to lecturers), and deleting assignments (also restricted to lecturers). The routes are organized under the "/assignments" prefix and include appropriate error handling and response structures.

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..db import get_db
from .. import schemas, crud
from app.utils.dependencies import get_current_user

router = APIRouter()

# The list_assignments endpoint retrieves a list of all assignments from the database and returns them in the response.
@router.get("/assignments", response_model=List[schemas.AssignmentResponse])
def list_assignments(db: Session = Depends(get_db)):
    return crud.get_assignments(db)

# The create_assignment endpoint allows lecturers to create new assignments by providing the necessary data in the request body. It checks the user's role to ensure that only lecturers can create assignments and returns the created assignment in the response.
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

# The delete_assignment endpoint allows lecturers to delete existing assignments by providing the assignment ID in the URL path. It checks the user's role to ensure that only lecturers can delete assignments and returns a confirmation message upon successful deletion.
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
