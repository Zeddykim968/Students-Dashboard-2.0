# Submission-related API routes for the Student Group Assignment System.
# This module defines API endpoints for managing submissions, including creating new submissions, grading submissions, deleting submissions, and retrieving submissions by student or group. The routes are organized under the "/submissions" prefix and include appropriate error handling and response structures.

from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from fastapi.responses import  RedirectResponse
from sqlalchemy.orm import Session
from ..db import get_db
from .. import schemas, crud
from app.utils.dependencies import get_current_user
import os, time, re
from dotenv import load_dotenv

import cloudinary
import cloudinary.uploader
import  cloudinary.api

load_dotenv()

# Configure Cloudinary with credentials from environment variables
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

router = APIRouter()


ALLOWED_EXTENSIONS = {
    ".pdf", ".png", ".jpg", ".jpeg", ".dwg", ".dxf",
    ".svg", ".zip", ".rar", ".docx", ".pptx", ".mp4", ".gif", ".webp"
}

def _cloudinary_configured():
    return all([
        os.getenv("CLOUDINARY_CLOUD_NAME"),
        os.getenv("CLOUDINARY_API_KEY"),
        os.getenv("CLOUDINARY_API_SECRET"),
    ])

def _configure_cloudinary():
    cloudinary.config(
        cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
        api_key=os.getenv("CLOUDINARY_API_KEY"),
        api_secret=os.getenv("CLOUDINARY_API_SECRET"),
        secure=True,
    )

def safe_filename(name: str) -> str:
    return re.sub(r"[^\w.\-]", "_", name)

# The create_submission endpoint allows students to upload files as submissions for their group assignments. It checks the student's authentication, verifies that they belong to the specified group, validates the file type, and saves the file to disk with a unique name. It then creates a submission record in the database and returns the submission information in the response.
@router.post("/submissions", response_model=schemas.SubmissionResponse)
async def create_submission(
    file: UploadFile = File(...),
    student_id: int = Form(...),
    group_id: int = Form(...),
    description: str = Form(default=""),
    db: Session = Depends(get_db),
    current_user: schemas.TokenPayload = Depends(get_current_user)
) -> schemas.SubmissionResponse:
    if current_user.student_id != student_id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    student = crud.get_student(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    if student.group_id is None:
        raise HTTPException(status_code=400, detail="Student is not in a group")

    if int(student.group_id) != group_id:
        raise HTTPException(status_code=400, detail="Student not in this group")
    
    #File type validation
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type '{ext}' is not supported")
    
    
    
    # Upload to Cloudinary
    try:

        file_content = await file.read()

        result = cloudinary.uploader.upload(
            file_content,
            public_id=f"submissions/{student_id}_{int(time.time())}",
            resource_type="auto"
        )

        file_url = result.get("secure_url")

        #create submission record in DB
        submission = crud.create_submission(
            db=db,
            student_id=student_id,
            group_id=group_id,
            file_url=file_url,
            description=description
        )

        return submission

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")    

   

    
# The grade_submission endpoint allows lecturers to grade student submissions by providing the submission ID, grade, and an optional comment. It checks the user's role to ensure that only lecturers can grade submissions and updates the submission record in the database with the provided grade and comment. The updated submission information is returned in the response.
@router.patch("/submissions/{submission_id}/grade", response_model=schemas.SubmissionResponse)
def grade_submission(
    submission_id: int,
    data: schemas.GradeSubmission,
    db: Session = Depends(get_db),
    current_user: schemas.TokenPayload = Depends(get_current_user)
):
    student = crud.get_student(db, current_user.student_id)
    if student.role != "lecturer":
        raise HTTPException(status_code=403, detail="Only lecturers can grade submissions")
    return crud.grade_submission(db, submission_id, data.grade, data.lecturer_comment)

# The delete_submission endpoint allows students to delete their own submissions or lecturers to delete any submission by providing the submission ID in the URL path. It checks the user's authentication and role to ensure that only authorized users can delete submissions and removes the submission record from the database. A confirmation message is returned in the response.
@router.delete("/submissions/{submission_id}")
def delete_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.TokenPayload = Depends(get_current_user)
):
    sub = db.query(crud.models.Submission).filter(crud.models.Submission.id == submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    student = crud.get_student(db, current_user.student_id)
    if sub.student_id != current_user.student_id and student.role != "lecturer":
        raise HTTPException(status_code=403, detail="Unauthorized")
    crud.delete_submission(db, submission_id)
    return {"message": "Deleted"}

# The download_submission endpoint allows users to download the file associated with a specific submission by providing the submission ID in the URL path. It checks if the submission exists and if the file is present on disk, then returns the file as a response for download. If the submission or file is not found, it raises an appropriate HTTP exception.
@router.get("/submissions/{submission_id}/download")
def download_submission(submission_id: int, db: Session = Depends(get_db)):
    sub = db.query(crud.models.Submission).filter(crud.models.Submission.id == submission_id).first()
    
    if not sub:
        raise HTTPException(status_code=404, detail="Not found")
    
    
    # redirect to cloudinary URL
    return RedirectResponse(url= sub.file_url)

# The read_submissions endpoint retrieves a list of all submissions from the database and returns them in the response. The read_student_submissions endpoint retrieves all submissions made by a specific student based on their student ID and returns them in the response. The read_group_submissions endpoint retrieves all submissions made by a specific group based on the group ID and returns them in the response.
@router.get("/submissions", response_model=list[schemas.SubmissionResponse])
def read_submissions(db: Session = Depends(get_db)):
    return crud.get_submissions(db)


@router.get("/submissions/student/{student_id}", response_model=list[schemas.SubmissionResponse])
def read_student_submissions(student_id: int, db: Session = Depends(get_db)):
    return crud.get_submissions_by_student(db, student_id)


@router.get("/submissions/group/{group_id}", response_model=list[schemas.SubmissionResponse])
def read_group_submissions(group_id: int, db: Session = Depends(get_db)):
    return crud.get_submissions_by_group(db, group_id)


# This function is used to get a database session for use in API routes. It creates a new session, yields it for use, and ensures that the session is properly closed after the request is completed.
from services.cloudinary import upload_file
from app.models import Assignment

