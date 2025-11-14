from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from ultralytics import YOLO
from PIL import Image
from io import BytesIO

app = FastAPI(title="Vehicle Damage AI Service", version="0.2.0")

# 🔹 Load YOLO model once at startup
# For now, we use a generic YOLOv8 model. In a real system, this would be a
# car-damage–fine-tuned model, e.g. "models/car_damage.pt".
MODEL_PATH = "yolov8n.pt"
model = YOLO(MODEL_PATH)


@app.get("/health")
def health_check():
  return {"status": "ok", "service": "ai-service", "model": MODEL_PATH}


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

    # 🔹 Compute area ratio of this detection
    box_area = max(0.0, float(x2 - x1) * float(y2 - y1))
    area_ratio = box_area / image_area if image_area > 0 else 0.0

    # 🔹 Map YOLO class to a "damage type"
    # With a real damage model, cls_id would map to scratch/dent/crack.
    # With generic yolov8n.pt, we just treat any detection as "damage"
    # and pick a default type. You can refine this later.
    damage_type = "dent"  # default for demo

    # 🔹 Panel naming heuristic (simple for now)
    # A real system could use camera metadata + segmentation.
    panel_name = f"panel-{i + 1}"

    detections.append(
      {
        "panel": panel_name,
        "type": damage_type,
        "confidence": conf,
        "area_ratio": area_ratio,
      }
    )

  return JSONResponse({"detections": detections})
