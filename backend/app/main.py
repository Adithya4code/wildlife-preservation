import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
from .routes import cameras, auth  # Import routers explicitly

app = FastAPI()

# Mount static files for images
app.mount(
    "/images",
    StaticFiles(directory=os.path.join(os.path.dirname(__file__), "../static/images")),
    name="images"
)

# Include routers with appropriate prefixes
app.include_router(cameras.router, prefix="/cameras", tags=["cameras"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Consider restricting origins for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)