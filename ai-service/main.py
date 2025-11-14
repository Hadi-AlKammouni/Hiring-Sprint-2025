from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse

app = FastAPI(title="Vehicle Damage AI Service", version="0.1.0")


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ai-service"}


@app.post("/detect-damage")
async def detect_damage(
    stage: str = Form(..., description="pickup or return"),
    image: UploadFile = File(...),
):
    """
    Mock detection endpoint.
    Later we'll plug YOLO here, but for AI-1 we return a fake detection
    with the final JSON shape.
    """
    # For now, ignore image content – just simulate a single detection.
    # You can add simple logic based on filename or size later if you want.

    # Example fake response
    detections = [
        {
            "panel": "panel-1",
            "type": "dent",            # scratch | dent | crack in the future
            "confidence": 0.9,
            "area_ratio": 0.2,
        }
    ]

    return JSONResponse({"detections": detections})
