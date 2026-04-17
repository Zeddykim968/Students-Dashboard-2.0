# This file sets up the database connection using SQLAlchemy. 
# It constructs the database URL based on environment variables, allowing for flexible configuration across different environments (Replit's built-in PostgreSQL, Supabase, or local SQLite). 
# It also defines a function to get a database session for use in API routes.
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv



load_dotenv()

# Use Replit's built-in PostgreSQL (always accessible from within the project)
# Falls back to the SUPABASE_URL or SQLite for local development
def _build_url():
    url = os.getenv("DATABASE_URL")

    if not url:
        raise ValueError("DATABASE_URL is not set. Configure your database.")

    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)

    return url
    


# Construct the database URL based on environment variables, allowing for flexible configuration across different environments (Replit's built-in PostgreSQL, Supabase, or local SQLite).
DATABASE_URL = _build_url()



connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
    connect_args=connect_args,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()



def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

print("Using database", DATABASE_URL)