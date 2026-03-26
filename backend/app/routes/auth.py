from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
async def login(login_data: LoginRequest):
    # Dummy authentication per spec
    return {
        "access_token": "dummy-token",
        "token_type": "bearer"
    }
