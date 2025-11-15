import os
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from ultralytics import YOLO
from PIL import Image
from io import BytesIO

app = FastAPI(title="Vehicle Damage AI Service", version="0.4.0")

# 🔹 Fine-tune friendly model loading:
# 1) If MODEL_PATH env is set, use it.
# 2) Else, if models/car_damage.pt exists, use that.
# 3) Else, fall back to yolov8n.pt.
env_model_path = os.getenv("MODEL_PATH")
if env_model_path:
    MODEL_PATH = env_model_path
else:
    default_custom = Path(__file__).parent / "models" / "car_damage.pt"
    if default_custom.exists():
        MODEL_PATH = str(default_custom)
    else:
        MODEL_PATH = "yolov8n.pt"

model = YOLO(MODEL_PATH)

# Optional: get class names for later use
try:
    NAMES = model.model.names  # typical YOLOv8
except AttributeError:
    NAMES = getattr(model, "names", {})


def map_raw_name_to_type(raw_name: str, area_ratio: float) -> str:
    """
    Map the YOLO class name + area ratio to one of: scratch, dent, crack.
    - If model has specific damage classes, use those.
    - Otherwise, fall back to simple area-based heuristic.
    """
    raw = (raw_name or "").lower().strip()

    # 1) Direct matches (for fine-tuned car_damage.pt with proper labels)
    if raw in ("scratch", "scrape"):
        return "scratch"
    if raw in ("dent", "ding"):
        return "dent"
    if raw in ("crack", "broken_glass", "broken", "glass_crack", "bumper_crack"):
        return "crack"

    # 2) Partial keyword matches
    if "scratch" in raw or "scrape" in raw:
        return "scratch"
    if "dent" in raw or "ding" in raw:
        return "dent"
    if "crack" in raw or "broken" in raw or "glass" in raw:
        return "crack"

    # 3) Fallback: area-based heuristic (for generic models like yolov8n.pt)
    if area_ratio < 0.01:
        return "scratch"
    elif area_ratio < 0.05:
        return "dent"
    else:
        return "crack"


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "ai-service",
        "model_path": MODEL_PATH,
        "num_classes": len(NAMES) if isinstance(NAMES, dict) else None,
    }


@app.post("/detect-damage")
async def detect_damage(
    stage: str = Form(..., description="pickup or return"),
    image: UploadFile = File(...),
):
    """
    Real detection endpoint using YOLOv8.

    Input:
      - stage: "pickup" or "return"
      - image: vehicle image

    Output:
      {
        "detections": [
          {
            "panel": "panel-1",
            "type": "dent",
            "confidence": 0.9,
            "area_ratio": 0.2
          },
          ...
        ]
      }
    """
    if stage not in ("pickup", "return"):
        raise HTTPException(status_code=400, detail="stage must be 'pickup' or 'return'")

    # Read image into memory
    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty image file")

    try:
        pil_image = Image.open(BytesIO(image_bytes)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")

    width, height = pil_image.size
    image_area = float(width * height)

    # 🔹 Run YOLOv8 inference (CPU)
    # NOTE: verbose=False to avoid spam in console
    results = model.predict(pil_image, verbose=False)

    detections = []

    if not results:
        return JSONResponse({"detections": detections})

    result = results[0]
    boxes = result.boxes

    if boxes is None or boxes.xyxy is None:
        return JSONResponse({"detections": detections})

    xyxy = boxes.xyxy.cpu().numpy()
    confs = boxes.conf.cpu().numpy()
    classes = boxes.cls.cpu().numpy()

    for i in range(len(xyxy)):
        x1, y1, x2, y2 = xyxy[i]
        conf = float(confs[i])
        cls_id = int(classes[i])

        # Box & area
        box_w = float(x2 - x1)
        box_h = float(y2 - y1)
        box_area = max(0.0, box_w * box_h)
        area_ratio = box_area / image_area if image_area > 0 else 0.0

        # Center of the box (for rough side/panel detection)
        cx = float((x1 + x2) / 2.0)

        # 🔹 NEW: use YOLO class name + area to decide damage_type
        # Get raw class name from model
        if isinstance(NAMES, dict):
            raw_name = str(NAMES.get(cls_id, "damage"))
        else:
            try:
                raw_name = str(NAMES[cls_id])
            except Exception:
                raw_name = "damage"

        damage_type = map_raw_name_to_type(raw_name, area_ratio)

        # --- Panel name heuristic (unchanged) ---
        # Divide image into 3 vertical regions: left / center / right
        if cx < width / 3:
            side = "left"
        elif cx < 2 * width / 3:
            side = "center"
        else:
            side = "right"

        panel_name = f"{side}-side-panel"

        detections.append(
            {
                "panel": panel_name,
                "type": damage_type,
                "confidence": conf,
                "area_ratio": area_ratio,
            }
        )

    return JSONResponse({"detections": detections})
