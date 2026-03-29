from sqlalchemy import Column, ForeignKey, Integer, String, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .db import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    reg_no = Column(String, unique=True, index=True)  # Registration number
    email = Column(String, unique=True, index=True)
    password = Column(String, nullable=False)  # Hashed password (bcrypt)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)

    submissions = relationship("Submission", back_populates="student")
    messages = relationship("Message", back_populates="student")  # For chat
    group = relationship("Group", back_populates="students")  # Direct group link

class Group(Base):
    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)

    submissions = relationship("Submission", back_populates="group")
    students = relationship("Student", back_populates="group")  # Students in group
    messages = relationship("Message", back_populates="group", order_by="Message.created_at")  # Chat messages

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    group_id = Column(Integer, ForeignKey("groups.id"))
    file_url = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("Student", back_populates="submissions")
    group = relationship("Group", back_populates="submissions")

# Chat Messages
class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    group = relationship("Group", back_populates="messages")
    student = relationship("Student", back_populates="messages")

# Run create_all to create messages table
