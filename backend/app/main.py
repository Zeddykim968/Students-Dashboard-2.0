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
        # Lecturer should never be forced to change password
        "UPDATE students SET must_change_password = FALSE WHERE role = 'lecturer'",
    ]
    with engine.connect() as conn:
        for sql in migrations:
            try:
                conn.execute(text(sql))
            except Exception:
                pass
        conn.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    _run_migrations()
    os.makedirs("uploads/submissions", exist_ok=True)
    yield


app = FastAPI(title="Student Group Assignment System API", lifespan=lifespan)

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5000,http://localhost:3000,http://127.0.0.1:5000"
).split(",")

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
