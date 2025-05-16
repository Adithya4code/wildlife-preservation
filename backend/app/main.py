# from fastapi import FastAPI, UploadFile, File
#
# app = FastAPI()
#
# @app.get("/api/health")
# def health_check():
#     return {"status": "ok"}
#
# @app.post("/api/detect")
# def detect_poacher(image: UploadFile = File(...)):
#     # Placeholder for YOLO detection logic
#     return {"message": "Detection endpoint"}
import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware

from .routes import cameras

app = FastAPI()

app.mount("/images", StaticFiles(directory=os.path.join(os.path.dirname(__file__), "../static/images")), name="images")
app.include_router(cameras.router, prefix="/cameras")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["*"] to allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Optional test route
@app.get("/")
async def root():
    return {"message": "Hello, world!"}