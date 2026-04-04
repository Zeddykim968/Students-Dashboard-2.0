from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..db import get_db
from .. import schemas, crud
from app.utils.dependencies import get_current_user

router = APIRouter()


# ── List all groups ───────────────────────────────────────────────────────────
@router.get("/groups", response_model=List[schemas.GroupResponse])
def read_groups(db: Session = Depends(get_db)):
    return crud.get_groups(db)


# ── Get a single group by ID ──────────────────────────────────────────────────
@router.get("/groups/{group_id}", response_model=schemas.GroupResponse)
def read_group(group_id: int, db: Session = Depends(get_db)):
    return crud.get_group(db, group_id)


# ── Get students in a group ───────────────────────────────────────────────────
@router.get("/groups/{group_id}/students", response_model=List[schemas.StudentResponse])
def read_group_members(group_id: int, db: Session = Depends(get_db)):
    group = crud.get_group(db, group_id)
    return group.students


# ── Create a group ────────────────────────────────────────────────────────────
@router.post("/groups", response_model=schemas.GroupResponse)
def create_group(group: schemas.GroupCreate, db: Session = Depends(get_db)):
    return crud.create_group(db, group)


# ── Enroll a student in a group ───────────────────────────────────────────────
@router.post("/groups/{group_id}/enroll/{student_id}")
def enroll_student(group_id: int, student_id: int, db: Session = Depends(get_db)):
    student = crud.get_student(db, student_id)
    crud.get_group(db, group_id)  # validates group exists
    student.group_id = group_id
    db.commit()
    db.refresh(student)
    return {"message": f"Student {student_id} enrolled in group {group_id}"}


# ── Get my group (authenticated) ─────────────────────────────────────────────
@router.get("/my-group", response_model=schemas.GroupResponse)
def read_my_group(
    current_user: schemas.TokenPayload = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    group = crud.get_group_by_student_id(db, current_user.student_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found for this student")
    return group


# ── Send a message to a group ─────────────────────────────────────────────────
@router.post("/groups/{group_id}/messages", response_model=schemas.MessageResponse)
def send_message(
    group_id: int,
    message: schemas.MessageCreate,
    current_user: schemas.TokenPayload = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = crud.get_student(db, current_user.student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return crud.create_message(db, message)


# ── Get messages for a group ──────────────────────────────────────────────────
@router.get("/groups/{group_id}/messages")
def get_group_messages(
    group_id: int,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    messages = crud.get_messages_by_group(db, group_id, skip, limit)
    return messages[::-1]
