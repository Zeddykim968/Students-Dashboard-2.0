# Student Group Assignment System

A full-stack web application for managing student group assignments in an architecture course. Built with **FastAPI** (Python) on the backend and **React + Vite** on the frontend, backed by **PostgreSQL**.

---

## Features

### For Students
- **Login** with your university email and password
- **View your group** — see all 6 members of your assigned group
- **Upload assignments** — supports PDF, PNG, JPG, DWG, DXF, SVG, DOCX, PPTX, ZIP, MP4
- **View group submissions** — see what your group members have uploaded
- **Group chat** — real-time messaging within your group (5-second polling)
- **View assignments** — check active assignments, descriptions, and deadlines
- **Track grades** — see grades and feedback left by the lecturer on your submissions

### For the Lecturer
- **Dashboard** — overview of all submissions across all 9 groups
- **Manage assignments** — create assignments with titles, descriptions, and deadlines
- **Grade submissions** — assign a score (0–100) and written comments to any submission
- **Download files** — download any student submission directly
- **Delete submissions** — remove any submission from the system
- **Monitor group chat** — view messages within any group

---

## Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React 18, Vite, Axios                           |
| Backend    | FastAPI (Python 3.11), SQLAlchemy ORM           |
| Database   | PostgreSQL (Replit-managed)                     |
| Auth       | JWT (7-day tokens), bcrypt password hashing     |
| File Store | Local filesystem (`backend/uploads/submissions/`)|

---

## Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app entry point, static file mounts
│   │   ├── models.py          # SQLAlchemy models (Student, Group, Submission, Assignment, Message)
│   │   ├── schemas.py         # Pydantic schemas for request/response validation
│   │   ├── crud.py            # Database helper functions
│   │   ├── database.py        # DB connection (PostgreSQL / SQLite fallback)
│   │   └── routes/
│   │       ├── auth.py        # POST /auth/login
│   │       ├── students.py    # Student CRUD
│   │       ├── groups.py      # Group management, group chat
│   │       ├── submissions.py # Upload, grade, download, delete submissions
│   │       └── assignments.py # Assignment CRUD
│   ├── seed.py                # Seeds 54 students across 9 groups + lecturer account
│   └── uploads/
│       └── submissions/       # Uploaded files stored here
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Root component, routing, auth context
│   │   ├── components/
│   │   │   ├── GroupView.jsx      # Group members grid, upload slots, grading UI
│   │   │   ├── GroupChat.jsx      # In-group chat with polling
│   │   │   ├── Assignments.jsx    # Assignment list for students/lecturer
│   │   │   ├── Submissions.jsx    # Student's own submission list
│   │   │   └── LecturerDashboard.jsx  # All submissions, grade/download/delete
│   │   ├── services/
│   │   │   └── api.js         # Centralized API calls with JWT injection & 401 handling
│   │   └── main.jsx
│   ├── vite.config.js         # Proxies /api → localhost:8000
│   └── package.json
│
└── README.md
```

---

## Getting Started (Local Development)

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (or SQLite for local fallback)

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python seed.py          # Seeds the database with students, groups, and a lecturer
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

The frontend runs on **port 5000** and proxies all `/api` requests to `localhost:8000`.

---

## Default Credentials

| Role     | Email                          | Password      |
|----------|--------------------------------|---------------|
| Lecturer | `lecturer@ku.ac.ke`            | `lecturer123` |
| Student  | `0703.2025@students.ku.ac.ke`  | `password123` |

> All 54 student accounts follow the pattern `XXXX.2025@students.ku.ac.ke` with password `password123`.

---

## API Endpoints

| Method | Endpoint                              | Description                        | Auth     |
|--------|---------------------------------------|------------------------------------|----------|
| POST   | `/api/auth/login`                     | Login, returns JWT token           | Public   |
| GET    | `/api/groups`                         | List all groups                    | Required |
| GET    | `/api/my-group`                       | Get current student's group        | Student  |
| GET    | `/api/groups/{id}/students`           | Members of a group                 | Required |
| GET    | `/api/groups/{id}/messages`           | Chat messages for a group          | Required |
| POST   | `/api/groups/{id}/messages`           | Send a chat message                | Required |
| GET    | `/api/submissions`                    | All submissions (lecturer only)    | Lecturer |
| GET    | `/api/submissions/group/{id}`         | Submissions for a group            | Required |
| POST   | `/api/submissions`                    | Upload a new submission            | Student  |
| PATCH  | `/api/submissions/{id}/grade`         | Grade a submission                 | Lecturer |
| GET    | `/api/submissions/{id}/download`      | Download a submission file         | Required |
| DELETE | `/api/submissions/{id}`               | Delete a submission                | Lecturer |
| GET    | `/api/assignments`                    | List all assignments               | Required |
| POST   | `/api/assignments`                    | Create a new assignment            | Lecturer |
| DELETE | `/api/assignments/{id}`               | Delete an assignment               | Lecturer |

---

## Supported File Types

Uploads accept the following formats:
- **Images:** PNG, JPG/JPEG
- **Documents:** PDF, DOCX, PPTX
- **CAD/Design:** DWG, DXF, SVG
- **Archives:** ZIP
- **Video:** MP4

---

## Environment Variables

The backend reads the following environment variables (auto-provided on Replit):

| Variable       | Description                          |
|----------------|--------------------------------------|
| `PGHOST`       | PostgreSQL host                      |
| `PGUSER`       | PostgreSQL user                      |
| `PGPASSWORD`   | PostgreSQL password                  |
| `PGDATABASE`   | PostgreSQL database name             |
| `SECRET_KEY`   | JWT signing key (default set in code)|

---

## Deployment

This project is configured to run on **Replit**:
- Backend workflow: `cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000`
- Frontend workflow: `cd frontend && npm run dev`

For production deployment, publish directly via Replit's Deploy feature. The app will be available under a `.replit.app` domain.

---

## Course Context

Built for **Architecture Design Studio** at Kenyatta University. Organises 54 students into 9 groups of 6, allowing collaborative submission and peer review of architectural drawings.
