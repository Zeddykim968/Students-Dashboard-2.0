"""
Seed script: creates 9 groups and 54 students with a uniform default password.
Default password for ALL students: Arch@2025
Run from the backend/ directory:  python seed.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.db import SessionLocal, engine, Base
from app import models
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

Base.metadata.create_all(bind=engine)
db = SessionLocal()

# ── Clear existing data (safe for fresh setup) ─────────────────────────────
db.query(models.Message).delete()
db.query(models.Submission).delete()
db.query(models.Student).delete()
db.query(models.Group).delete()
db.commit()

UNIFORM_PASSWORD = "Arch@2025"
hashed_uniform = pwd_context.hash(UNIFORM_PASSWORD)

# ── Groups (9) ───────────────────────────────────────────────────────────────
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

# ── Students (54) ─────────────────────────────────────────────────────────────
students_data = [
    # Group 1
    ("Brenda Wambui",      "B11/0703/2025",    "0703.2025@students.ku.ac.ke",   1),
    ("Becky Biwott",       "B11/0698/2025",    "0698.2025@students.ku.ac.ke",   1),
    ("Ishmael Kipkemoi",   "B11/10701/2025",   "10701.2025@students.ku.ac.ke",  1),
    ("Shem Maingi",        "B11/0691/2025",    "0691.2025@students.ku.ac.ke",   1),
    ("David Kiarie",       "B11S/20790/2025",  "20790.2025@students.ku.ac.ke",  1),
    ("Felix Owino",        "B11/0726/2025",    "0726.2025@students.ku.ac.ke",   1),
    # Group 2
    ("Nisah Muroki",       "B11/0706/2025",    "0706.2025@students.ku.ac.ke",   2),
    ("Christine Atieno",   "B11S/20072/2025",  "20072.2025@students.ku.ac.ke",  2),
    ("Clement Maina",      "B11/0714/2025",    "0714.2025@students.ku.ac.ke",   2),
    ("Cammy Akut",         "B11S/20097/2025",  "20097.2025@students.ku.ac.ke",  2),
    ("Okindo Leon",        "B11/0712/2025",    "0712.2025@students.ku.ac.ke",   2),
    ("Eaton Amaru",        "B11/0697/2025",    "0697.2025@students.ku.ac.ke",   2),
    # Group 3
    ("Stacy Osumba",       "B11S/20108/2025",  "20108.2025@students.ku.ac.ke",  3),
    ("Lynet Kanene",       "B11/0705/2025",    "0705.2025@students.ku.ac.ke",   3),
    ("Keith Mukambi",      "B11S/20076/2025",  "20076.2025@students.ku.ac.ke",  3),
    ("Erick Muthomi",      "B11/0713/2025",    "0713.2025@students.ku.ac.ke",   3),
    ("Joe Matara",         "B11S/21428/2025",  "21428.2025@students.ku.ac.ke",  3),
    ("Alvin Mwangi",       "B11/0716/2025",    "0716.2025@students.ku.ac.ke",   3),
    # Group 4
    ("Sally Njoki",        "B11/0710/2025",    "0710.2025@students.ku.ac.ke",   4),
    ("Ibrahim Kiroga",     "B11/0707/2025",    "0707.2025@students.ku.ac.ke",   4),
    ("Bravin Osoro",       "B11/0733/2025",    "0733.2025@students.ku.ac.ke",   4),
    ("Peter Kioko",        "B11/204149/2025",  "20149.2025@students.ku.ac.ke",  4),
    ("Ian Kariri",         "B11/0695/2025",    "0695.2025@students.ku.ac.ke",   4),
    ("Collince Odhiambo",  "B11/0731/2025",    "0731.2025@students.ku.ac.ke",   4),
    # Group 5
    ("Jerica Onita",       "B11S/21121/2025",  "21121.2025@students.ku.ac.ke",  5),
    ("Odiwuor Collines",   "B11/0728/2025",    "0728.2025@students.ku.ac.ke",   5),
    ("Peterson Moguche",   "B11/0734/2025",    "0734.2025@students.ku.ac.ke",   5),
    ("Leon Sefu",          "B11/0723/2025",    "0723.2025@students.ku.ac.ke",   5),
    ("Jerome Teddy",       "B11/0736/2025",    "0736.2025@students.ku.ac.ke",   5),
    ("Bramwel Elijah",     "B11/0699/2025",    "0699.2025@students.ku.ac.ke",   5),
    # Group 6
    ("Gloria Ngila",       "B11/0709/2025",    "0709.2025@students.ku.ac.ke",   6),
    ("Samuel Gachimu",     "B11/0700/2025",    "0700.2025@students.ku.ac.ke",   6),
    ("Elijah Getui",       "B11/0735/2025",    "0735.2025@students.ku.ac.ke",   6),
    ("Ethan Macharia",     "B11/0720/2025",    "0720.2025@students.ku.ac.ke",   6),
    ("Brighton Osaka",     "B011/0722/2025",   "0722.2025@students.ku.ac.ke",   6),
    ("Weddy Michubu",      "B11/10555/2025",   "10555.2025@students.ku.ac.ke",  6),
    # Group 7
    ("Rosemary Adhola",    "B11/0732/2025",    "0732.2025@students.ku.ac.ke",   7),
    ("Muli Charles",       "B11/0690/2025",    "0690.2025@students.ku.ac.ke",   7),
    ("Jimmy Kihenjo",      "B11/0730/2025",    "0730.2025@students.ku.ac.ke",   7),
    ("Christian Namu",     "B11/0729/2025",    "0729.2025@students.ku.ac.ke",   7),
    ("Jared Osira",        "B11/0708/2025",    "0708.2025@students.ku.ac.ke",   7),
    ("Waweru Githundi",    "B11/0693/2025",    "0693.2025@students.ku.ac.ke",   7),
    # Group 8
    ("Joy Akinyi",         "B11/0721/2025",    "0721.2025@students.ku.ac.ke",   8),
    ("Brian Benedict",     "B11/11530/2025",   "11530.2025@students.ku.ac.ke",  8),
    ("Cromwel Ndirangu",   "B11/21431/2025",   "21431.2025@students.ku.ac.ke",  8),
    ("Naphtali Ogenga",    "B11/0727/2025",    "0727.2025@students.ku.ac.ke",   8),
    ("Obwewa Juma",        "B11/0724/2025",    "0724.2025@students.ku.ac.ke",   8),
    ("Fareed Kimaru",      "B11/20308/2025",   "20308.2025@students.ku.ac.ke",  8),
    # Group 9
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

# ── Lecturer account ─────────────────────────────────────────────────────────
lecturer = models.Student(
    name="Lecturer",
    reg_no="LECTURER/001",
    email="lecturer@ku.ac.ke",
    password=pwd_context.hash("Arch@2025"),
    role="lecturer",
    group_id=None,
    must_change_password=False,
)
db.add(lecturer)

db.commit()
db.close()

print(f"Done! Seeded {len(group_names)} groups and {len(students_data)} students.")
print(f"\nAll student uniform password: {UNIFORM_PASSWORD}")
print("Students will be prompted to change their password on first login.")
print("\nLecturer login: lecturer@ku.ac.ke / LecturerKU@2025")
