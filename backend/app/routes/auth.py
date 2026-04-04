from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..db import get_db
from ..crud import get_student_by_email
from passlib.context import CryptContext
from ..utils.auth import create_access_token
from app.models import Student
from typing import Dict, Any



router = APIRouter(prefix="/auth", tags=["auth"])

 # Authenticate student by email/password using bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
async def login(login_data: LoginRequest, db: Session = Depends(get_db)) -> Dict[str, Any]:
    student: Student | None = get_student_by_email(db, login_data.email)

    if not student or not pwd_context.verify(login_data.password, student.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Create JWT token - use student.id (matches models)
    token = create_access_token({
        "student_id": student.id,
        "email": student.email
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }
