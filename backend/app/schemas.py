from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# Student
class StudentBase(BaseModel):
    name: str
    email: EmailStr

class StudentCreate(StudentBase):
    pass

class StudentResponse(StudentBase):
    id: int
    submissions: Optional[List['SubmissionResponse']] = []

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
    pass

class SubmissionResponse(SubmissionBase):
    id: int
    created_at: datetime
    student: Optional['StudentResponse'] = None
    group: Optional['GroupResponse'] = None

    model_config = {"from_attributes": True}

# Enrollment
class EnrollmentBase(BaseModel):
    student_id: int
    group_id: int

class EnrollmentCreate(EnrollmentBase):
    pass

StudentResponse.model_rebuild()
GroupResponse.model_rebuild()
SubmissionResponse.model_rebuild()
