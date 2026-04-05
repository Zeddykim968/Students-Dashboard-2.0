from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..db import get_db
from .. import schemas, crud, models
from app.utils.dependencies import get_current_user

router = APIRouter()

@router.get("/groups", response_model=List[schemas.GroupResponse])
def read_groups(db: Session = Depends(get_db)):
    return crud.get_groups(db)

@router.get("/groups/{group_id}", response_model=schemas.GroupResponse)
def read_group(group_id: int, db: Session = Depends(get_db)):
    return crud.get_group(db, group_id)

@router.get("/groups/{group_id}/students", response_model=List[schemas.StudentResponse])
def read_group_members(group_id: int, db: Session = Depends(get_db)):
    group = crud.get_group(db, group_id)
    return group.students

@router.post("/groups", response_model=schemas.GroupResponse)
def create_group(group: schemas.GroupCreate, db: Session = Depends(get_db)):
    return crud.create_group(db, group)

@router.post("/groups/{group_id}/enroll/{student_id}")
def enroll_student(group_id: int, student_id: int, db: Session = Depends(get_db)):
    student = crud.get_student(db, student_id)
    crud.get_group(db, group_id)
    student.group_id = group_id
    db.commit()
    db.refresh(student)
    return {"message": f"Student {student_id} enrolled in group {group_id}"}

@router.get("/my-group", response_model=schemas.GroupResponse)
def read_my_group(
    current_user: schemas.TokenPayload = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    group = crud.get_group_by_student_id(db, current_user.student_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found for this student")
    return group

@router.post("/groups/{group_id}/messages")
def send_message(
    group_id: int,
    message: schemas.MessageCreate,
    current_user: schemas.TokenPayload = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = crud.get_student(db, current_user.student_id)
    msg = crud.create_message(db, message)
    return {
        "id": msg.id,
        "group_id": msg.group_id,
        "student_id": msg.student_id,
        "message": msg.message,
        "created_at": msg.created_at.isoformat(),
        "student_name": student.name
    }

@router.get("/groups/{group_id}/messages")
def get_group_messages(
    group_id: int,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    messages = crud.get_messages_by_group(db, group_id, skip, limit)
    result = []
    for msg in messages:
        student = db.query(models.Student).filter(models.Student.id == msg.student_id).first()
        result.append({
            "id": msg.id,
            "group_id": msg.group_id,
            "student_id": msg.student_id,
            "message": msg.message,
            "created_at": msg.created_at.isoformat(),
            "student_name": student.name if student else "Unknown"
        })
    return result
