from fastapi import APIRouter
from .auth import router as auth_router
from .cameras import router as cameras_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(cameras_router, prefix="/cameras", tags=["cameras"])
