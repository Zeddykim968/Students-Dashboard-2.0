from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from . import models, schemas
from .db import SessionLocal

def get_student(db: Session, student_id: int):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

def get_students(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Student).offset(skip).limit(limit).all()

def create_student(db: Session, student: schemas.StudentCreate):
    db_student = models.Student(**student.dict())
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

def get_group(db: Session, group_id: int):
    group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if group is None:
        raise HTTPException(status_code=404, detail="Group not found")
    return group

def get_groups(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Group).offset(skip).limit(limit).all()

def create_group(db: Session, group: schemas.GroupCreate):
    db_group = models.Group(**group.dict())
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group

def create_enrollment(db: Session, enrollment: schemas.EnrollmentCreate):
    try:
        db_enrollment = models.Enrollment(**enrollment.dict())
        db.add(db_enrollment)
        db.commit()
        db.refresh(db_enrollment)
        return db_enrollment
    except IntegrityError:
        raise HTTPException(status_code=400, detail="Enrollment already exists")

def get_submissions(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Submission).offset(skip).limit(limit).all()

def get_submissions_by_student(db: Session, student_id: int):
    return db.query(models.Submission).filter(models.Submission.student_id == student_id).all()

def get_submissions_by_group(db: Session, group_id: int):
    return db.query(models.Submission).filter(models.Submission.group_id == group_id).all()

def create_submission(db: Session, submission: schemas.SubmissionCreate):
    db_submission = models.Submission(**submission.dict())
    db.add(db_submission)
    db.commit()
    db.refresh(db_submission)
    return db_submission
