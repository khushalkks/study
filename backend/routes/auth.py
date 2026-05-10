from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os
from config.db import get_database

router = APIRouter(prefix="/api/auth", tags=["auth"])

# ── Security Config ───────────────────────────────────────────────────────────
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "cortexcraft-super-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24 * 7  # 7 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer_scheme = HTTPBearer(auto_error=False)

# ── Pydantic Models ───────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

# ── Helpers ───────────────────────────────────────────────────────────────────
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

# ── Dependency: get current user from JWT ─────────────────────────────────────
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_token(credentials.credentials)
    db = get_database()
    from bson import ObjectId
    user = await db["users"].find_one({"_id": ObjectId(payload["sub"])})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# ── REGISTER ──────────────────────────────────────────────────────────────────
@router.post("/register")
async def register(body: RegisterRequest):
    db = get_database()

    existing = await db["users"].find_one({"email": body.email.lower().strip()})
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    if len(body.password) < 6:
        raise HTTPException(status_code=422, detail="Password must be at least 6 characters")

    hashed = hash_password(body.password)
    avatar = f"https://api.dicebear.com/7.x/avataaars/svg?seed={body.name.replace(' ', '')}"

    new_user = {
        "name": body.name.strip(),
        "email": body.email.lower().strip(),
        "password_hash": hashed,
        "avatar": avatar,
        "created_at": datetime.utcnow(),
    }
    result = await db["users"].insert_one(new_user)
    user_id = str(result.inserted_id)

    token = create_token({"sub": user_id, "email": new_user["email"]})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "name": new_user["name"],
            "email": new_user["email"],
            "avatar": avatar,
        }
    }

# ── LOGIN ─────────────────────────────────────────────────────────────────────
@router.post("/login")
async def login(body: LoginRequest):
    db = get_database()
    user = await db["users"].find_one({"email": body.email.lower().strip()})

    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user_id = str(user["_id"])
    token = create_token({"sub": user_id, "email": user["email"]})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "name": user["name"],
            "email": user["email"],
            "avatar": user.get("avatar", ""),
        }
    }

# ── ME (verify token) ─────────────────────────────────────────────────────────
@router.get("/me")
async def me(current_user=Depends(get_current_user)):
    return {
        "id": str(current_user["_id"]),
        "name": current_user["name"],
        "email": current_user["email"],
        "avatar": current_user.get("avatar", ""),
    }
