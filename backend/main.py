from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from google import genai # Yeni kütüphane
from dotenv import load_dotenv
import os
import shutil

load_dotenv()
app = FastAPI()

# Yeni Gemini Yapılandırması
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/test-ai")
def test_ai():
    # Yeni kütüphane yazım şekli
    response = client.models.generate_content(
        model="gemini-1.5-flash", 
        contents="EduChad sistemi için kısa bir teknik onay mesajı ver."
    )
    return {"mesaj": response.text}
import shutil
from fastapi import File, UploadFile
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Frontend'in (Next.js) backend'e erişmesine izin veren güvenlik ayarı
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "EduChad Backend Hazır!", "status": "active"}

@app.get("/universiteler")
def get_universities():
    # Dokümandaki hiyerarşi hedefleri
    return [
        {"id": 1, "ad": "N'Djamena Üniversitesi"},
        {"id": 2, "ad": "Moundou Üniversitesi"},
        {"id": 3, "ad": "Abeche Üniversitesi"}
    ]
UPLOAD_DIR = "uploads"

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"filename": file.filename, "message": "Dosya başarıyla yüklendi!"}