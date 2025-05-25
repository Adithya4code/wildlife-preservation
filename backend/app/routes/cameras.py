from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models.camera import Camera
from ..models.detection import Detection
from ultralytics import YOLO
import httpx
from PIL import Image, ImageDraw
import io
import base64
from pydantic import BaseModel
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "custom_yolo.pt")
if not os.path.exists(MODEL_PATH):
    logger.error(f"Model file not found at {MODEL_PATH}")
    raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")

logger.info(f"Loading YOLO model from {MODEL_PATH}")
model = YOLO(MODEL_PATH)
logger.info(f"Model loaded successfully. Classes: {model.names}")

class DetectRequest(BaseModel):
    camera_id: int

@router.get("/")
def read_cameras(db: Session = Depends(get_db)):
    cameras = db.query(Camera).all()
    logger.info(f"Fetched {len(cameras)} cameras from database")
    return cameras

@router.post("/detect/")
async def detect_poacher(request: DetectRequest, db: Session = Depends(get_db)):
    logger.info(f"Received detection request for camera_id: {request.camera_id}")
    camera = db.query(Camera).filter(Camera.id == request.camera_id).first()
    if not camera:
        logger.error(f"Camera with ID {request.camera_id} not found")
        raise HTTPException(status_code=404, detail="Camera not found")

    # Try fetching image via HTTP
    logger.info(f"Fetching image from {camera.feed_url}")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(camera.feed_url, timeout=5.0)
            response.raise_for_status()
        img_bytes = io.BytesIO(response.content)
    except httpx.HTTPError as e:
        logger.warning(f"HTTP fetch failed: {e}. Falling back to local file.")
        # Fallback to local file
        img_path = os.path.join(os.path.dirname(__file__), "..", "..", "static", "images", f"camera{request.camera_id}.jpg")
        if not os.path.exists(img_path):
            logger.error(f"Image file not found at {img_path}")
            raise HTTPException(status_code=400, detail=f"Image file not found: {img_path}")
        img_bytes = open(img_path, "rb")

    try:
        pil_image = Image.open(img_bytes).convert("RGB")
    except Exception as e:
        logger.error(f"Failed to open image: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid image format: {e}")
    finally:
        if not isinstance(img_bytes, io.BytesIO):
            img_bytes.close()

    logger.info("Running YOLO detection")
    try:
        results = model(pil_image)
    except Exception as e:
        logger.error(f"YOLO detection failed: {e}")
        raise HTTPException(status_code=500, detail=f"Detection failed: {e}")

    draw = ImageDraw.Draw(pil_image)
    detections = []
    for result in results:
        boxes = result.boxes
        for box in boxes:
            cls_id = int(box.cls[0])
            confidence = float(box.conf[0])
            label = model.names[cls_id]
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            draw.rectangle((x1, y1, x2, y2), outline="red", width=2)
            draw.text((x1, y1 - 10), f"{label} {confidence:.2f}", fill="red")
            detections.append({
                "label": label,
                "confidence": round(confidence, 2),
                "bbox": [x1, y1, x2, y2]
            })

    output_img_bytes = io.BytesIO()
    pil_image.save(output_img_bytes, format="JPEG")
    encoded_img = base64.b64encode(output_img_bytes.getvalue()).decode("utf-8")

    for detection in detections:
        new_detection = Detection(
            camera_id=camera.id,
            type=detection["label"],
            details=str(detection)
        )
        db.add(new_detection)
    db.commit()
    logger.info(f"Stored {len(detections)} detections for camera_id {camera.id}")

    return {
        "camera_id": camera.id,
        "detections": detections,
        "total": len(detections),
        "image": f"data:image/jpeg;base64,{encoded_img}",
        "camera_name": camera.name
    }