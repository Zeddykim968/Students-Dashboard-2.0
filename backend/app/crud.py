from sqlalchemy.orm import Session
from fastapi import HTTPException
from . import models, schemas
from passlib.context import CryptContext
from typing import List, Optional
from datetime import datetime, timezone, timedelta
import secrets

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Student
def get_student(db: Session, student_id: int) -> models.Student:
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

def get_student_by_email(db: Session, email: str) -> Optional[models.Student]:
    return db.query(models.Student).filter(models.Student.email == email.strip().lower()).first()

def get_students(db: Session, skip: int = 0, limit: int = 100) -> List[models.Student]:
    return db.query(models.Student).filter(models.Student.role == "student").offset(skip).limit(limit).all()

def create_student(db: Session, student: schemas.StudentCreate):
    hashed_password = pwd_context.hash(student.password)
    db_student = models.Student(
        name=student.name,
        reg_no=student.reg_no,
        email=student.email,
        password=hashed_password,
        group_id=student.group_id,
        must_change_password=True,
    )
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

def change_password(db: Session, student_id: int, current_password: str, new_password: str) -> models.Student:
    student = get_student(db, student_id)
    if not pwd_context.verify(current_password, student.password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")
    student.password = pwd_context.hash(new_password)
    student.must_change_password = False
    student.reset_token = None
    student.reset_token_expiry = None
    db.commit()
    db.refresh(student)
    return student

def create_reset_token(db: Session, email: str) -> Optional[str]:
    student = get_student_by_email(db, email)
    if not student:
        return None
    token = secrets.token_urlsafe(32)
    student.reset_token = token
    student.reset_token_expiry = datetime.now(timezone.utc) + timedelta(hours=1)
    db.commit()
    return token

def reset_password_with_token(db: Session, token: str, new_password: str) -> models.Student:
    student = db.query(models.Student).filter(models.Student.reset_token == token).first()
    if not student:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link")
    if not student.reset_token_expiry:
        raise HTTPException(status_code=400, detail="Invalid reset link")
    expiry = student.reset_token_expiry
    if expiry.tzinfo is None:
        expiry = expiry.replace(tzinfo=timezone.utc)
    if datetime.now(timezone.utc) > expiry:
        raise HTTPException(status_code=400, detail="Reset link has expired. Please request a new one.")
    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    student.password = pwd_context.hash(new_password)
    student.must_change_password = False
    student.reset_token = None
    student.reset_token_expiry = None
    db.commit()
    db.refresh(student)
    return student

# Group
def get_group(db: Session, group_id: int) -> Optional[models.Group]:
    group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if group is None:
        raise HTTPException(status_code=404, detail="Group not found")
    return group

def get_group_by_student_email(db: Session, email: str) -> Optional[models.Group]:
    student = db.query(models.Student).filter(models.Student.email == email).first()
    if not student:
        return None
    return student.group or None

def get_group_by_student_id(db: Session, student_id: int) -> Optional[models.Group]:
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if student is None:
        return None
    return student.group or None

def get_groups(db: Session, skip: int = 0, limit: int = 100) -> List[models.Group]:
    return db.query(models.Group).offset(skip).limit(limit).all()

def create_group(db: Session, group: schemas.GroupCreate) -> models.Group:
    db_group = models.Group(**group.model_dump())
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group

# Submissions
def get_submissions(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Submission).offset(skip).limit(limit).all()

def get_submissions_by_student(db: Session, student_id: int):
    return db.query(models.Submission).filter(models.Submission.student_id == student_id).order_by(models.Submission.created_at.desc()).all()

def get_submissions_by_group(db: Session, group_id: int):
    return db.query(models.Submission).filter(models.Submission.group_id == group_id).order_by(models.Submission.created_at.desc()).all()

def create_submission(db: Session, student_id: int, group_id: int, file_url: str, file_name: str, description: str = None):
    submission = models.Submission(
        student_id=student_id,
        group_id=group_id,
        file_url=file_url,
        file_name=file_name,
        description=description
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return submission

def grade_submission(db: Session, submission_id: int, grade: str, comment: str):
    submission = db.query(models.Submission).filter(models.Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    submission.grade = grade
    submission.lecturer_comment = comment
    db.commit()
    db.refresh(submission)
    return submission

def delete_submission(db: Session, submission_id: int):
    submission = db.query(models.Submission).filter(models.Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    db.delete(submission)
    db.commit()

# Messages
def create_message(db: Session, message: schemas.MessageCreate) -> models.Message:
    db_msg = models.Message(
        group_id=message.group_id,
        student_id=message.student_id,
        message=message.message,
        created_at=datetime.now(timezone.utc)
    )
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    return db_msg

def get_messages_by_group(db: Session, group_id: int, skip: int = 0, limit: int = 100):
    return (
        db.query(models.Message)
        .filter(models.Message.group_id == group_id)
        .order_by(models.Message.created_at.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )

# Assignments
def get_assignments(db: Session) -> List[models.Assignment]:
    return db.query(models.Assignment).order_by(models.Assignment.created_at.desc()).all()

def create_assignment(db: Session, assignment: schemas.AssignmentCreate) -> models.Assignment:
    db_assignment = models.Assignment(**assignment.model_dump())
    db.add(db_assignment)
    db.commit()
    db.refresh(db_assignment)
    return db_assignment

def delete_assignment(db: Session, assignment_id: int):
    assignment = db.query(models.Assignment).filter(models.Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    db.delete(assignment)
    db.commit()
