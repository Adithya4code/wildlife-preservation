# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.staticfiles import StaticFiles
# from .routes import cameras, auth  # Import routers explicitly
# import os
#
# app = FastAPI()
#
# # Add CORS middleware before including routers or mounting static files
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # Adjust as needed
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )
#
# # Mount static files for images
# app.mount(
#     "/images",
#     StaticFiles(directory=os.path.join(os.path.dirname(__file__), "../static/images")),
#     name="images"
# )
#
# # Include routers with appropriate prefixes
# app.include_router(cameras.router, prefix="/cameras", tags=["cameras"])
# app.include_router(auth.router, prefix="/auth", tags=["auth"])
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .routes import cameras, auth
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Use absolute path for static files
STATIC_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "static", "images"))
if not os.path.exists(STATIC_DIR):
    print(f"Static directory not found: {STATIC_DIR}")
app.mount("/images", StaticFiles(directory=STATIC_DIR), name="images")

app.include_router(cameras.router, prefix="/cameras", tags=["cameras"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])