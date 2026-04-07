from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from sqlalchemy import text
import os

from .db import engine, Base, SessionLocal
from .routes import auth, students, groups, submissions, assignments


def _run_migrations():
    """Safely add new columns to existing tables without Alembic."""
    migrations = [
        "ALTER TABLE students ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT TRUE",
        "ALTER TABLE students ADD COLUMN IF NOT EXISTS reset_token VARCHAR",
        "ALTER TABLE students ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMPTZ",
        "UPDATE students SET must_change_password = FALSE WHERE role = 'lecturer'",
    ]
    with engine.connect() as conn:
        for sql in migrations:
            try:
                conn.execute(text(sql))
            except Exception:
                pass
        conn.commit()


def _ensure_lecturer_exists():
    """Create the lecturer account if it doesn't exist yet."""
    from passlib.context import CryptContext
    from .models import Student
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    db = SessionLocal()
    try:
        lecturer = db.query(Student).filter(Student.role == "lecturer").first()
        if not lecturer:
            lecturer = Student(
                name="Lecturer",
                reg_no="LECTURER/001",
                email="lecturer@ku.ac.ke",
                password=pwd_context.hash("Lecturer2025"),
                role="lecturer",
                group_id=None,
                must_change_password=False,
            )
            db.add(lecturer)
            db.commit()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    _run_migrations()
    _ensure_lecturer_exists()
    os.makedirs("uploads/submissions", exist_ok=True)
    yield


app = FastAPI(title="Student Group Assignment System API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(students.router, prefix="/api")
app.include_router(groups.router, prefix="/api")
app.include_router(submissions.router, prefix="/api")
app.include_router(assignments.router, prefix="/api")

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def root():
    return {"message": "Student Group Assignment System API"}
