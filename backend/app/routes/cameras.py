from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models.camera import Camera
from ..models.detection import Detection
from ultralytics import YOLO
import requests
from PIL import Image, ImageDraw
import io
import base64
from pydantic import BaseModel
import os

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Set model path relative to project root (adjust based on your structure)
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "custom_yolo.pt")
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")

# Load the custom YOLO model
model = YOLO(MODEL_PATH)

# Pydantic model for request body
class DetectRequest(BaseModel):
    camera_id: int

@router.get("/")
def read_cameras(db: Session = Depends(get_db)):
    cameras = db.query(Camera).all()
    return cameras

@router.post("/detect/")
async def detect_poacher(request: DetectRequest, db: Session = Depends(get_db)):
    camera = db.query(Camera).filter(Camera.id == request.camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")

    # Fetch the image from the feed URL
    try:
        response = requests.get(camera.feed_url)
        response.raise_for_status()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch image: {e}")

    img_bytes = io.BytesIO(response.content)
    pil_image = Image.open(img_bytes).convert("RGB")

    # Run YOLO detection with the custom model
    results = model(pil_image)

    # Draw bounding boxes on the image
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

    # Save the processed image to a BytesIO object
    output_img_bytes = io.BytesIO()
    pil_image.save(output_img_bytes, format="JPEG")
    encoded_img = base64.b64encode(output_img_bytes.getvalue()).decode("utf-8")

    # Store detections in the database
    for detection in detections:
        new_detection = Detection(
            camera_id=camera.id,
            type=detection["label"],
            details=str(detection)
        )
        db.add(new_detection)
    db.commit()

    return {
        "camera_id": camera.id,
        "detections": detections,
        "total": len(detections),
        "image": f"data:image/jpeg;base64,{encoded_img}",
        "camera_name": camera.name
    }