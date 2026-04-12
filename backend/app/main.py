# This file is the main entry point for the FastAPI application.
#  It sets up the application, including database initialization, CORS configuration, and route registration.
# It also includes a simple root endpoint for testing.
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from sqlalchemy import text
import os

from .db import engine, Base, SessionLocal
from .routes import auth, students, groups, submissions, assignments

# This function runs raw SQL commands to safely add new columns to existing tables without using Alembic.
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

# The lifespan function is used to perform setup tasks when the application starts, such as creating database tables and running migrations.
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    _run_migrations()
    #_auto_seed()
    os.makedirs("uploads/submissions", exist_ok=True)
    yield

# The FastAPI application is created with the specified title and lifespan function. CORS middleware is added to allow requests from any origin, and the API routes are included under the "/api" prefix. Finally, a static files route is set up to serve uploaded files, and a simple root endpoint is defined.
app = FastAPI(title="Student Group Assignment System API", lifespan=lifespan)

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000,http://127.0.0.1:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(students.router, prefix="/api")
app.include_router(groups.router, prefix="/api")
app.include_router(submissions.router, prefix="/api")
app.include_router(assignments.router, prefix="/api")

# Serve uploaded files from the "uploads" directory
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def root():
    return {"message": "Student Group Assignment System API"}
