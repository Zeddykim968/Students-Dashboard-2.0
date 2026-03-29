from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class TokenPayload(BaseModel):
    student_id: int
    email: EmailStr | None = None
    exp: datetime

# Student
class StudentBase(BaseModel):
    name: str
    reg_no: str
    email: EmailStr
    password: str  # Will be hashed on create
    group_id: int

class StudentCreate(StudentBase):
    pass

class StudentResponse(StudentBase):
    id: int
    submissions: Optional[List['SubmissionResponse']] = []
    group: Optional['GroupResponse'] = None

    model_config = {"from_attributes": True}

# Group
class GroupBase(BaseModel):
    name: str

class GroupCreate(GroupBase):
    pass

class GroupResponse(GroupBase):
    id: int
    submissions: Optional[List['SubmissionResponse']] = []

    model_config = {"from_attributes": True}

# Submission
class SubmissionBase(BaseModel):
    student_id: int
    group_id: int
    file_url: str

class SubmissionCreate(SubmissionBase):
    file_url: str

class SubmissionResponse(SubmissionBase):
    id: int
    created_at: datetime
    student: Optional['StudentResponse'] = None
    group: Optional['GroupResponse'] = None
    file_url: str

    model_config = {"from_attributes": True}

# Message for chat
class MessageBase(BaseModel):
    group_id: int
    student_id: int
    message: str

class MessageCreate(MessageBase):
    pass

class MessageResponse(MessageBase):
    id: int
    created_at: datetime
    student_name: str

    model_config = {"from_attributes": True}

StudentResponse.model_rebuild()
GroupResponse.model_rebuild()
SubmissionResponse.model_rebuild()
MessageResponse.model_rebuild()
