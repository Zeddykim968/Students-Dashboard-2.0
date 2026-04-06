from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from .db import engine, Base, SessionLocal
from .routes import auth, students, groups, submissions, assignments


def _seed_if_empty():
    from passlib.context import CryptContext
    from . import models

    db = SessionLocal()
    try:
        if db.query(models.Student).count() > 0:
            return

        pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

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
            ("Brenda Wambui",      "B11/0703/2025",    "0703.2025@students.ku.ac.ke",   "password123", 1),
            ("Becky Biwott",       "B11/0698/2025",    "0698.2025@students.ku.ac.ke",   "password456", 1),
            ("Ishmael Kipkemoi",   "B11/10701/2025",   "10701.2025@students.ku.ac.ke",  "password789", 1),
            ("Shem Maingi",        "B11/0691/2025",    "0691.2025@students.ku.ac.ke",   "password012", 1),
            ("David Kiarie",       "B11S/20790/2025",  "20790.2025@students.ku.ac.ke",  "password345", 1),
            ("Felix Owino",        "B11/0726/2025",    "0726.2025@students.ku.ac.ke",   "password678", 1),
            ("Nisah Muroki",       "B11/0706/2025",    "0706.2025@students.ku.ac.ke",   "password901", 2),
            ("Christine Atieno",   "B11S/20072/2025",  "20072.2025@students.ku.ac.ke",  "password234", 2),
            ("Clement Maina",      "B11/0714/2025",    "0714.2025@students.ku.ac.ke",   "password567", 2),
            ("Cammy Akut",         "B11S/20097/2025",  "20097.2025@students.ku.ac.ke",  "password890", 2),
            ("Okindo Leon",        "B11/0712/2025",    "0712.2025@students.ku.ac.ke",   "password123", 2),
            ("Eaton Amaru",        "B11/0697/2025",    "0697.2025@students.ku.ac.ke",   "password456", 2),
            ("Stacy Osumba",       "B11S/20108/2025",  "20108.2025@students.ku.ac.ke",  "password789", 3),
            ("Lynet Kanene",       "B11/0705/2025",    "0705.2025@students.ku.ac.ke",   "password012", 3),
            ("Keith Mukambi",      "B11S/20076/2025",  "20076.2025@students.ku.ac.ke",  "password345", 3),
            ("Erick Muthomi",      "B11/0713/2025",    "0713.2025@students.ku.ac.ke",   "password678", 3),
            ("Joe Matara",         "B11S/21428/2025",  "21428.2025@students.ku.ac.ke",  "password901", 3),
            ("Alvin Mwangi",       "B11/0716/2025",    "0716.2025@students.ku.ac.ke",   "password123", 3),
            ("Sally Njoki",        "B11/0710/2025",    "0710.2025@students.ku.ac.ke",   "password456", 4),
            ("Ibrahim Kiroga",     "B11/0707/2025",    "0707.2025@students.ku.ac.ke",   "password789", 4),
            ("Bravin Osoro",       "B11/0733/2025",    "0733.2025@students.ku.ac.ke",   "password012", 4),
            ("Peter Kioko",        "B11/204149/2025",  "20149.2025@students.ku.ac.ke",  "password345", 4),
            ("Ian Kariri",         "B11/0695/2025",    "0695.2025@students.ku.ac.ke",   "password678", 4),
            ("Collince Odhiambo",  "B11/0731/2025",    "0731.2025@students.ku.ac.ke",   "password901", 4),
            ("Jerica Onita",       "B11S/21121/2025",  "21121.2025@students.ku.ac.ke",  "password234", 5),
            ("Odiwuor Collines",   "B11/0728/2025",    "0728.2025@students.ku.ac.ke",   "password567", 5),
            ("Peterson Moguche",   "B11/0734/2025",    "0734.2025@students.ku.ac.ke",   "password577", 5),
            ("Leon Sefu",          "B11/0723/2025",    "0723.2025@students.ku.ac.ke",   "password890", 5),
            ("Jerome Teddy",       "B11/0736/2025",    "0736.2025@students.ku.ac.ke",   "password123", 5),
            ("Bramwel Elijah",     "B11/0699/2025",    "0699.2025@students.ku.ac.ke",   "password356", 5),
            ("Gloria Ngila",       "B11/0709/2025",    "0709.2025@students.ku.ac.ke",   "password222", 6),
            ("Samuel Gachimu",     "B11/0700/2025",    "0700.2025@students.ku.ac.ke",   "password333", 6),
            ("Elijah Getui",       "B11/0735/2025",    "0735.2025@students.ku.ac.ke",   "password555", 6),
            ("Ethan Macharia",     "B11/0720/2025",    "0720.2025@students.ku.ac.ke",   "password777", 6),
            ("Brighton Osaka",     "B011/0722/2025",   "0722.2025@students.ku.ac.ke",   "password999", 6),
            ("Weddy Michubu",      "B11/10555/2025",   "10555.2025@students.ku.ac.ke",  "password111", 6),
            ("Rosemary Adhola",    "B11/0732/2025",    "0732.2025@students.ku.ac.ke",   "password767", 7),
            ("Muli Charles",       "B11/0690/2025",    "0690.2025@students.ku.ac.ke",   "password444", 7),
            ("Jimmy Kihenjo",      "B11/0730/2025",    "0730.2025@students.ku.ac.ke",   "password465", 7),
            ("Christian Namu",     "B11/0729/2025",    "0729.2025@students.ku.ac.ke",   "password889", 7),
            ("Jared Osira",        "B11/0708/2025",    "0708.2025@students.ku.ac.ke",   "password123", 7),
            ("Waweru Githundi",    "B11/0693/2025",    "0693.2025@students.ku.ac.ke",   "password998", 7),
            ("Joy Akinyi",         "B11/0721/2025",    "0721.2025@students.ku.ac.ke",   "password783", 8),
            ("Brian Benedict",     "B11/11530/2025",   "11530.2025@students.ku.ac.ke",  "password664", 8),
            ("Cromwel Ndirangu",   "B11/21431/2025",   "21431.2025@students.ku.ac.ke",  "password123", 8),
            ("Naphtali Ogenga",    "B11/0727/2025",    "0727.2025@students.ku.ac.ke",   "password456", 8),
            ("Obwewa Juma",        "B11/0724/2025",    "0724.2025@students.ku.ac.ke",   "password788", 8),
            ("Fareed Kimaru",      "B11/20308/2025",   "20308.2025@students.ku.ac.ke",  "password223", 8),
            ("Anita Shama",        "B11/0718/2025",    "0718.2025@students.ku.ac.ke",   "password458", 9),
            ("Raymond Chekenen",   "B11/20322/2025",   "20322.2025@students.ku.ac.ke",  "password789", 9),
            ("Thomas Micheal",     "B11EA/21134/2025", "21134.2025@students.ku.ac.ke",  "password123", 9),
            ("Nickel Sharma",      "B11S/20001/2025",  "20001.2025@students.ku.ac.ke",  "password446", 9),
            ("Austyn Mwangi",      "B11/20514/2025",   "20514.2025@students.ku.ac.ke",  "password799", 9),
            ("Amos Aminga",        "B11/0717/2025",    "0717.2025@students.ku.ac.ke",   "password123", 9),
        ]

        for name, reg_no, email, plain_pw, group_num in students_data:
            db.add(models.Student(
                name=name, reg_no=reg_no, email=email,
                password=pwd.hash(plain_pw), role="student", group_id=gid[group_num],
            ))

        db.add(models.Student(
            name="Lecturer", reg_no="LECTURER/001", email="lecturer@ku.ac.ke",
            password=pwd.hash("lecturer123"), role="lecturer", group_id=None,
        ))

        db.commit()
        print("Database seeded successfully.")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    os.makedirs("uploads/submissions", exist_ok=True)
    _seed_if_empty()
    yield

app = FastAPI(title="Student Group Assignment System API", lifespan=lifespan)

_raw_origins = os.getenv("ALLOWED_ORIGINS", "*")
_origins = [o.strip() for o in _raw_origins.split(",")] if _raw_origins != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
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
