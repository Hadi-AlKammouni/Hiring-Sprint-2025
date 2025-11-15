FROM python:3.11-slim

WORKDIR /app

# System packages needed for ultralytics/OpenCV/PIL
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ffmpeg \
    libsm6 \
    libxext6 && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the AI service code
COPY . .

# Expose FastAPI port
EXPOSE 8000

# Environment (optional, can still override MODEL_PATH at runtime)
ENV MODEL_PATH=models/car_damage.pt

# Run FastAPI app with uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
