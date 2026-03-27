from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
from cv.preprocess import preprocess
from cv.detect_lines import detect_lines
from cv.detect_objects import detect_objects

app = FastAPI()

# === CORS FIX ===
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === STORAGE PATH ===
UPLOAD_FOLDER = "samples"

# Ensure folder exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.get("/")
def home():
    return {"status": "Backend Running"}

@app.post("/process-blueprint")
async def process_blueprint(file: UploadFile = File(...)):
    file_location = f"{UPLOAD_FOLDER}/{file.filename}"
    
    with open(file_location, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # Process with OpenCV
    img, gray, edges = preprocess(file_location)
    walls = detect_lines(edges, img)  # Pass original image for color extraction
    objects = detect_objects(img, gray)  # Detect furniture and fixtures

    return {
        "filename": file.filename,
        "walls": walls,
        "objects": objects  # NEW: Return detected objects
    }
