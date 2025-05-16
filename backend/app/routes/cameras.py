from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models.camera import Camera
from ..models.detection import Detection
from ultralytics import YOLO
import requests
from PIL import Image
import io

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

model = YOLO("yolov8n.pt")  # You can use yolov8s.pt, yolov8m.pt, etc. as needed

@router.get("/")
def read_cameras(db: Session = Depends(get_db)):
    cameras = db.query(Camera).all()
    return cameras

@router.post("/detect/")
async def detect_poacher(camera_id: int, db: Session = Depends(get_db)):
    camera = db.query(Camera).filter(Camera.id == camera_id).first()
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

    # Run YOLO detection
    results = model(pil_image)

    # Parse results
    detections = []
    for result in results:
        boxes = result.boxes
        for box in boxes:
            cls_id = int(box.cls[0])
            confidence = float(box.conf[0])
            label = model.names[cls_id]
            detections.append({
                "label": label,
                "confidence": round(confidence, 2)
            })

    # Optionally store to DB:
    # for detection in detections:
    #     new_detection = Detection(camera_id=camera.id, type=detection['label'], details=str(detection))
    #     db.add(new_detection)
    # db.commit()

    return {
        "camera_id": camera.id,
        "detections": detections,
        "total": len(detections)
    }