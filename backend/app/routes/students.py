from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import get_db
from .. import schemas, crud
from ..utils.dependencies import get_current_user
from ..utils.email import send_lecturer_message

router = APIRouter()


@router.post("/students", response_model=schemas.StudentResponse)
def create_student(student: schemas.StudentCreate, db: Session = Depends(get_db)):
    return crud.create_student(db, student)


@router.get("/students", response_model=list[schemas.StudentResponse])
def read_students(db: Session = Depends(get_db)):
    return crud.get_students(db)


@router.get("/students/{student_id}", response_model=schemas.StudentResponse)
def read_student(student_id: int, db: Session = Depends(get_db)):
    return crud.get_student(db, student_id)


@router.post("/students/{student_id}/reset-password")
def reset_student_password(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.TokenPayload = Depends(get_current_user)
):
    lecturer = crud.get_student(db, current_user.student_id)
    if lecturer.role != "lecturer":
        raise HTTPException(status_code=403, detail="Only lecturers can reset passwords")
    crud.reset_student_password(db, student_id)
    student = crud.get_student(db, student_id)
    return {"message": f"Password reset to Arch@2025 for {student.name}. They must change it on next login."}


@router.post("/students/email")
def email_students(
    data: schemas.EmailStudentsRequest,
    db: Session = Depends(get_db),
    current_user: schemas.TokenPayload = Depends(get_current_user)
):
    lecturer = crud.get_student(db, current_user.student_id)
    if lecturer.role != "lecturer":
        raise HTTPException(status_code=403, detail="Only lecturers can send emails")

    if data.student_ids:
        students = [crud.get_student(db, sid) for sid in data.student_ids]
    else:
        students = crud.get_students(db)

    emails = [s.email for s in students if s.email]
    if not emails:
        raise HTTPException(status_code=400, detail="No recipients found")

    result = send_lecturer_message(emails, data.subject, data.body, lecturer.name)
    return {
        "message": f"Email sent to {len(result['sent'])} student(s).",
        "sent_count": len(result["sent"]),
        "failed_count": len(result["failed"]),
        "smtp_configured": len(result["sent"]) > 0 or len(result["failed"]) > 0,
    }
