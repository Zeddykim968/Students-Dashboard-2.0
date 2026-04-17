from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from sqlalchemy import text
from passlib.context import CryptContext
import os
from . import models
from .db import engine, Base, SessionLocal
from .routes import auth, students, groups, submissions, assignments
from . import models

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

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

def _auto_seed():
    """Seed the database with groups and students only if it is empty."""
    db = SessionLocal()
    try:
        if db.query(models.Student).count() > 0:
            return

        hashed_uniform = pwd_context.hash("Arch@2025")

        group_names = [
            "Group 1", "Group 2", "Group 3", "Group 4", "Group 5",
            "Group 6", "Group 7", "Group 8", "Group 9",
        ]
        groups = []
        for name in group_names:
            g = models.Group(name=name)
            db.add(g)
            db.flush()
            groups.append(g)
        db.commit()

        gid = {i + 1: groups[i].id for i in range(9)}

        students_data = [
            ("Brenda Wambui",      "B11/0703/2025",    "0703.2025@students.ku.ac.ke",   1),
            ("Becky Biwott",       "B11/0698/2025",    "0698.2025@students.ku.ac.ke",   1),
            ("Ishmael Kipkemoi",   "B11/10701/2025",   "10701.2025@students.ku.ac.ke",  1),
            ("Shem Maingi",        "B11/0691/2025",    "0691.2025@students.ku.ac.ke",   1),
            ("David Kiarie",       "B11S/20790/2025",  "20790.2025@students.ku.ac.ke",  1),
            ("Felix Owino",        "B11/0726/2025",    "0726.2025@students.ku.ac.ke",   1),
            ("Nisah Muroki",       "B11/0706/2025",    "0706.2025@students.ku.ac.ke",   2),
            ("Christine Atieno",   "B11S/20072/2025",  "20072.2025@students.ku.ac.ke",  2),
            ("Clement Maina",      "B11/0714/2025",    "0714.2025@students.ku.ac.ke",   2),
            ("Cammy Akut",         "B11S/20097/2025",  "20097.2025@students.ku.ac.ke",  2),
            ("Okindo Leon",        "B11/0712/2025",    "0712.2025@students.ku.ac.ke",   2),
            ("Eaton Amaru",        "B11/0697/2025",    "0697.2025@students.ku.ac.ke",   2),
            ("Stacy Osumba",       "B11S/20108/2025",  "20108.2025@students.ku.ac.ke",  3),
            ("Lynet Kanene",       "B11/0705/2025",    "0705.2025@students.ku.ac.ke",   3),
            ("Keith Mukambi",      "B11S/20076/2025",  "20076.2025@students.ku.ac.ke",  3),
            ("Erick Muthomi",      "B11/0713/2025",    "0713.2025@students.ku.ac.ke",   3),
            ("Joe Matara",         "B11S/21428/2025",  "21428.2025@students.ku.ac.ke",  3),
            ("Alvin Mwangi",       "B11/0716/2025",    "0716.2025@students.ku.ac.ke",   3),
            ("Sally Njoki",        "B11/0710/2025",    "0710.2025@students.ku.ac.ke",   4),
            ("Ibrahim Kiroga",     "B11/0707/2025",    "0707.2025@students.ku.ac.ke",   4),
            ("Bravin Osoro",       "B11/0733/2025",    "0733.2025@students.ku.ac.ke",   4),
            ("Peter Kioko",        "B11/204149/2025",  "20149.2025@students.ku.ac.ke",  4),
            ("Ian Kariri",         "B11/0695/2025",    "0695.2025@students.ku.ac.ke",   4),
            ("Collince Odhiambo",  "B11/0731/2025",    "0731.2025@students.ku.ac.ke",   4),
            ("Jerica Onita",       "B11S/21121/2025",  "21121.2025@students.ku.ac.ke",  5),
            ("Odiwuor Collines",   "B11/0728/2025",    "0728.2025@students.ku.ac.ke",   5),
            ("Peterson Moguche",   "B11/0734/2025",    "0734.2025@students.ku.ac.ke",   5),
            ("Leon Sefu",          "B11/0723/2025",    "0723.2025@students.ku.ac.ke",   5),
            ("Jerome Teddy",       "B11/0736/2025",    "0736.2025@students.ku.ac.ke",   5),
            ("Bramwel Elijah",     "B11/0699/2025",    "0699.2025@students.ku.ac.ke",   5),
            ("Gloria Ngila",       "B11/0709/2025",    "0709.2025@students.ku.ac.ke",   6),
            ("Samuel Gachimu",     "B11/0700/2025",    "0700.2025@students.ku.ac.ke",   6),
            ("Elijah Getui",       "B11/0735/2025",    "0735.2025@students.ku.ac.ke",   6),
            ("Ethan Macharia",     "B11/0720/2025",    "0720.2025@students.ku.ac.ke",   6),
            ("Brighton Osaka",     "B011/0722/2025",   "0722.2025@students.ku.ac.ke",   6),
            ("Weddy Michubu",      "B11/10555/2025",   "10555.2025@students.ku.ac.ke",  6),
            ("Rosemary Adhola",    "B11/0732/2025",    "0732.2025@students.ku.ac.ke",   7),
            ("Muli Charles",       "B11/0690/2025",    "0690.2025@students.ku.ac.ke",   7),
            ("Jimmy Kihenjo",      "B11/0730/2025",    "0730.2025@students.ku.ac.ke",   7),
            ("Christian Namu",     "B11/0729/2025",    "0729.2025@students.ku.ac.ke",   7),
            ("Jared Osira",        "B11/0708/2025",    "0708.2025@students.ku.ac.ke",   7),
            ("Waweru Githundi",    "B11/0693/2025",    "0693.2025@students.ku.ac.ke",   7),
            ("Joy Akinyi",         "B11/0721/2025",    "0721.2025@students.ku.ac.ke",   8),
            ("Brian Benedict",     "B11/11530/2025",   "11530.2025@students.ku.ac.ke",  8),
            ("Cromwel Ndirangu",   "B11/21431/2025",   "21431.2025@students.ku.ac.ke",  8),
            ("Naphtali Ogenga",    "B11/0727/2025",    "0727.2025@students.ku.ac.ke",   8),
            ("Obwewa Juma",        "B11/0724/2025",    "0724.2025@students.ku.ac.ke",   8),
            ("Fareed Kimaru",      "B11/20308/2025",   "20308.2025@students.ku.ac.ke",  8),
            ("Anita Shama",        "B11/0718/2025",    "0718.2025@students.ku.ac.ke",   9),
            ("Raymond Chekenen",   "B11/20322/2025",   "20322.2025@students.ku.ac.ke",  9),
            ("Thomas Micheal",     "B11EA/21134/2025", "21134.2025@students.ku.ac.ke",  9),
            ("Nickel Sharma",      "B11S/20001/2025",  "20001.2025@students.ku.ac.ke",  9),
            ("Austyn Mwangi",      "B11/20514/2025",   "20514.2025@students.ku.ac.ke",  9),
            ("Amos Aminga",        "B11/0717/2025",    "0717.2025@students.ku.ac.ke",   9),
        ]

        for name, reg_no, email, group_num in students_data:
            s = models.Student(
                name=name,
                reg_no=reg_no,
                email=email,
                password=hashed_uniform,
                role="student",
                group_id=gid[group_num],
                must_change_password=True,
            )
            db.add(s)

        lecturer = models.Student(
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
    except Exception as e:
        db.rollback()
        print(f"Auto-seed skipped or failed: {e}")
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    _run_migrations()
    #_auto_seed()
    os.makedirs("uploads/submissions", exist_ok=True)
    yield

app = FastAPI(title="Student Group Assignment System API", lifespan=lifespan)

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:5000,http://127.0.0.1:5173"
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

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def root():
    return {"message": "Student Group Assignment System API"}
