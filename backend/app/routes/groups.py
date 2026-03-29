from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session


from ..db import get_db
from .. import schemas, crud
from utils.dependencies import get_current_user  # ✅ reuse, don't redefine

router = APIRouter()


# -------------------------
# 📌 Get My Group
# -------------------------
@router.get("/my-group", response_model=schemas.GroupResponse)
def read_my_group(
    current_user: schemas.TokenPayload = Depends(get_current_user),  # ✅ typed object
    db: Session = Depends(get_db)
):
    """
    Fetch the group of the currently authenticated student.
    """
    student_id = current_user.student_id  # ✅ use typed field, not dict access

    group = crud.get_group_by_student_id(db, student_id)

    if not group:
        raise HTTPException(
            status_code=404,
            detail="Group not found for this student"
        )

    return group


# -------------------------
# 💬 Send Message to Group
# -------------------------
@router.post("/groups/{group_id}/messages", response_model=schemas.MessageResponse)
def send_message(
    group_id: int,
    message: schemas.MessageCreate,
    current_user: schemas.TokenPayload = Depends(get_current_user),  # ✅ typed object
    db: Session = Depends(get_db)
):
    """
    Send a message to a group chat.
    Uses authenticated user instead of manually passing student_id.
    """
    student_id = current_user.student_id  # ✅ use typed field, not dict access

    student = crud.get_student(db, student_id)

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    
    

    return crud.create_message(db, message)


# -------------------------
# 📥 Get Group Messages
# -------------------------
@router.get("/groups/{group_id}/messages", response_model=schemas.MessageResponse)
def get_group_messages(
    group_id: int,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """
    Get recent messages for a group chat.
    """
    messages = crud.get_messages_by_group(db, group_id, skip, limit)

    return messages[::-1]  # reverse: newest first