from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .db import engine, Base
from .routes import auth, students, groups, submissions



@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup logic
    # Ensures all DB tables are created.
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(title="Student Group Assignment System API", lifespan= lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API route modules
app.include_router(auth.router, prefix="/api")
app.include_router(students.router, prefix="/api")
app.include_router(groups.router, prefix="/api")
app.include_router(submissions.router, prefix="/api")


@app.get("/")
def root():
    return {"Student Group Assignment Backend Running - /api/docs"}

