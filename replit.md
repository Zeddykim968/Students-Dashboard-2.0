# Student Group Assignment System

## Overview
A full-stack web application for managing students, group assignments, and project submissions at Kenyatta University Architecture Department. It features separate views for students and lecturers.

## Architecture

### Frontend (React + Vite)
- Located in `/frontend`
- Port: 5000
- Framework: React 18 with React Router DOM
- Styling: Tailwind CSS
- Build tool: Vite 6
- Key dependencies: `lucide-react`, `react-hot-toast`, `react-dropzone`
- API calls use relative paths (e.g., `/api/...`) proxied through Vite to the backend

### Backend (FastAPI + Python)
- Located in `/backend`
- Port: 8000
- Framework: FastAPI with uvicorn
- Database: PostgreSQL (via Replit's built-in PG env vars) with SQLite fallback
- Authentication: JWT (python-jose) + bcrypt password hashing
- Migration tool: Alembic

## Workflows
- **Start application**: Runs the React/Vite frontend on port 5000 (`cd frontend && npm run dev`)
- **Backend API**: Runs the FastAPI backend on port 8000 (`cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000`)

## Key Files
- `frontend/src/services/api.js` — API service layer using relative URLs
- `frontend/vite.config.js` — Vite config with proxy to backend and Replit host settings
- `backend/app/main.py` — FastAPI app entry point with CORS, auto-seed, and route registration
- `backend/app/db.py` — Database setup (PostgreSQL preferred, SQLite fallback)
- `backend/app/models.py` — SQLAlchemy models (Students, Groups, Submissions, Messages)
- `backend/app/routes/` — API route handlers

## User Roles
- **Students**: View group, upload assignments, group chat (default password: `Arch@2025`)
- **Lecturer**: Manage assignments, view all submissions, grade work (email: `lecturer@ku.ac.ke`, password: `Lecturer2025`)

## Notes
- Frontend uses Vite proxy to forward `/api` and `/uploads` requests to the backend
- CORS is set to allow all origins for development flexibility
- Database is auto-seeded with 54 students across 9 groups on first run
- File uploads are stored in `backend/uploads/submissions/`
