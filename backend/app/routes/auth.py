# Authentication routes for the Student Group Assignment System.
# This module defines API endpoints for user authentication, including login, password change, and password reset functionality. It uses JWT tokens for authentication and includes security measures such as password hashing and token-based password resets. The routes are organized under the "/auth" prefix and include appropriate error handling and response structures.

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ..db import get_db
from ..crud import get_student_by_email, change_password, create_reset_token, reset_password_with_token
from passlib.context import CryptContext
from ..utils.auth import create_access_token
from ..utils.email import send_password_reset_email
from ..utils.dependencies import get_current_user
from app.models import Student
from .. import schemas
from typing import Dict, Any

router = APIRouter(prefix="/auth", tags=["auth"])
# The LoginRequest model defines the expected structure of the login request body, which includes an email and a password.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
async def login(login_data: LoginRequest, db: Session = Depends(get_db)) -> Dict[str, Any]:
    student: Student | None = get_student_by_email(db, login_data.email)

    if not student or not pwd_context.verify(login_data.password, student.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({
        "student_id": student.id,
        "email": student.email
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": student.id,
            "name": student.name,
            "email": student.email,
            "reg_no": student.reg_no,
            "group_id": student.group_id,
            "role": student.role,
            "must_change_password": student.must_change_password,
        }
    }

# The change_user_password endpoint allows authenticated users to change their password by providing the current password and a new password. It verifies the current password and updates it if valid.
@router.post("/change-password")
async def change_user_password(
    data: schemas.ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: schemas.TokenPayload = Depends(get_current_user)
):
    student = change_password(db, current_user.student_id, data.current_password, data.new_password)
    return {
        "message": "Password changed successfully",
        "must_change_password": student.must_change_password
    }

# The forgot_password endpoint allows users to request a password reset by providing their email. If the email exists, a reset token is generated and an email is sent with instructions to reset the password. The reset_password endpoint allows users to reset their password using the token they received via email, along with the new password they want to set. It verifies the token and updates the password if valid.
@router.post("/forgot-password")
async def forgot_password(
    data: schemas.ForgotPasswordRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    token = create_reset_token(db, data.email)
    if token:
        student = get_student_by_email(db, data.email)
        origin = request.headers.get("origin") or str(request.base_url).rstrip("/")
        send_password_reset_email(data.email, student.name, token, origin)
    return {"message": "If that email exists in our system, a reset link has been sent."}

@router.post("/reset-password")
async def reset_password(
    data: schemas.ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    reset_password_with_token(db, data.token, data.new_password)
    return {"message": "Password reset successfully. You can now log in."}
