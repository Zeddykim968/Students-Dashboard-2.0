# Student-related API routes for the Student Group Assignment System.
# This module defines API endpoints for managing students, including creating new students, retrieving student information, and sending emails to students. The routes are organized under the "/students" prefix and include appropriate error handling and response structures.

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import get_db
from .. import schemas, crud
from ..utils.dependencies import get_current_user
from ..utils.email import send_lecturer_message

router = APIRouter()

# The create_student endpoint allows for the creation of new student records by accepting a StudentCreate schema in the request body. It uses the CRUD function to create the student in the database and returns the created student information in the response.
@router.post("/students", response_model=schemas.StudentResponse)
def create_student(student: schemas.StudentCreate, db: Session = Depends(get_db)):
    return crud.create_student(db, student)

# The read_students endpoint retrieves a list of all students from the database and returns them in the response. The read_student endpoint retrieves information for a specific student based on their ID and returns it in the response.
@router.get("/students", response_model=list[schemas.StudentResponse])
def read_students(db: Session = Depends(get_db)):
    return crud.get_students(db)

@router.get("/students/{student_id}", response_model=schemas.StudentResponse)
def read_student(student_id: int, db: Session = Depends(get_db)):
    return crud.get_student(db, student_id)

<<<<<<< HEAD
# The email_students endpoint allows lecturers to send emails to students. It accepts a list of student IDs (or sends to all students if no IDs are provided), along with the email subject and body. It checks the user's role to ensure that only lecturers can send emails and returns a summary of the email sending results in the response.
=======
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

>>>>>>> a4fac41769f427bf35d0e94cdfd0a2c0edc7d7c1
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
