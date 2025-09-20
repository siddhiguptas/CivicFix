import os
import shutil
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from classification_with_mongo import classify_and_save
from database import ImageClassificationDB
from chatbot import router as chatbot_router


# Initialize FastAPI app
app = FastAPI(title="Civic Connect API")
app.include_router(chatbot_router, prefix="/api", tags=["Chatbot"])
# Allow frontend (React on localhost:3000) to access backend (FastAPI on 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB instance
db = ImageClassificationDB()

# ------------------------
# Routes
# ------------------------

@app.post("/upload")
async def upload_issue(
    file: UploadFile = File(...),
    location: str = Form(""),
    description: str = Form(""),
    reporter_name: str = Form("Anonymous")
):
    """Upload an image + metadata, classify with AI, and save to DB"""
    try:
        # Save uploaded file locally
        upload_dir = "uploads"
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Classify & save in DB
        result = classify_and_save(
            image_path=file_path,
            location=location,
            description=description,
            reporter_name=reporter_name
        )

        return JSONResponse(content=result)

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.get("/reports")
def get_reports():
    """Fetch all saved reports"""
    try:
        reports = db.get_all_classifications()
        return {"reports": reports}
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.get("/")
def root():
    return {"message": "✅ Civic Connect API is running!"}
