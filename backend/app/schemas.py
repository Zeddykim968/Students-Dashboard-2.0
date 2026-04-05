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

# Lightweight student (no nested group/submissions to avoid circularity)
class StudentBasic(BaseModel):
    id: int
    name: str
    reg_no: str
    email: EmailStr
    role: str = "student"
    group_id: Optional[int] = None
    model_config = {"from_attributes": True}

# Submission (uses StudentBasic to avoid circular refs)
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

# Student with their submissions (no group to avoid recursion)
class StudentResponse(StudentBasic):
    submissions: Optional[List[SubmissionResponse]] = []

# Group
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

# Message
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

# Assignment
class AssignmentCreate(BaseModel):
    title: str
    description: Optional[str] = None
    deadline: Optional[datetime] = None

class AssignmentResponse(AssignmentCreate):
    id: int
    created_at: datetime
    model_config = {"from_attributes": True}
