from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class TokenPayload(BaseModel):
    student_id: int
    email: EmailStr | None = None
    exp: datetime

class GradeSubmission(BaseModel):
    grade: Optional[str] = None
    lecturer_comment: Optional[str] = None

class StudentBasic(BaseModel):
    id: int
    name: str
    reg_no: str
    email: EmailStr
    role: str = "student"
    group_id: Optional[int] = None
    must_change_password: bool = False
    model_config = {"from_attributes": True}

class SubmissionResponse(BaseModel):
    id: int
    student_id: int
    group_id: int
    file_url: str
    file_name: Optional[str] = None
    description: Optional[str] = None
    grade: Optional[str] = None
    lecturer_comment: Optional[str] = None
    created_at: datetime
    student: Optional[StudentBasic] = None
    model_config = {"from_attributes": True}

class StudentResponse(StudentBasic):
    submissions: Optional[List[SubmissionResponse]] = []

class GroupBase(BaseModel):
    name: str

class GroupCreate(GroupBase):
    pass

class GroupResponse(GroupBase):
    id: int
    students: Optional[List[StudentResponse]] = []
    submissions: Optional[List[SubmissionResponse]] = []
    model_config = {"from_attributes": True}

class StudentCreate(BaseModel):
    name: str
    reg_no: str
    email: EmailStr
    password: str
    group_id: Optional[int] = None

class MessageCreate(BaseModel):
    group_id: int
    student_id: int
    message: str

class MessageResponse(BaseModel):
    id: int
    group_id: int
    student_id: int
    message: str
    created_at: datetime
    student_name: str
    model_config = {"from_attributes": True}

class AssignmentCreate(BaseModel):
    title: str
    description: Optional[str] = None
    deadline: Optional[datetime] = None

class AssignmentResponse(AssignmentCreate):
    id: int
    created_at: datetime
    model_config = {"from_attributes": True}

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class EmailStudentsRequest(BaseModel):
    subject: str
    body: str
    student_ids: Optional[List[int]] = None
