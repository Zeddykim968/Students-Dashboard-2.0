# This file defines the SQLAlchemy models for the Student Group Assignment System. 
# It includes models for students, groups, submissions, messages, and assignments, along with their relationships. Each model corresponds to a database table, and the fields represent the columns in those tables.
# The Student model includes fields for authentication and password management, while the Group model manages the relationships between students and their submissions. The Submission model tracks file uploads and grading, and the Message model allows for communication within groups. Finally, the Assignment model defines the structure for assignments created by lecturers.

from sqlalchemy import Column, ForeignKey, Integer, String, DateTime, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .db import Base

# SQLAlchemy models for the Student Group Assignment System
class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    reg_no = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String, nullable=False)
    role = Column(String, default="student", nullable=False)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=True)
    must_change_password = Column(Boolean, default=True, nullable=False)
    reset_token = Column(String, nullable=True)
    reset_token_expiry = Column(DateTime(timezone=True), nullable=True)

    submissions = relationship("Submission", back_populates="student")
    messages = relationship("Message", back_populates="student")
    group = relationship("Group", back_populates="students")

# The Group model manages the relationships between students and their submissions. 
class Group(Base):
    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)

    submissions = relationship("Submission", back_populates="group")
    students = relationship("Student", back_populates="group")
    messages = relationship("Message", back_populates="group", order_by="Message.created_at")

# The Submission model tracks file uploads and grading. 
Class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    group_id = Column(Integer, ForeignKey("groups.id"))
    file_url = Column(String)
    file_name = Column(String)
    description = Column(Text, nullable=True)
    grade = Column(String, nullable=True)
    lecturer_comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("Student", back_populates="submissions")
    group = relationship("Group", back_populates="submissions")

# The Message model allows for communication within groups.
Class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    group = relationship("Group", back_populates="messages")
    student = relationship("Student", back_populates="messages")

# The Assignment model defines the structure for assignments created by lecturers.
class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    deadline = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
