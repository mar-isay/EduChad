from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from dotenv import load_dotenv
import os
import shutil
import fitz  # PyMuPDF: PDF okumak için

# Kurulumlar
load_dotenv()
app = FastAPI()

# Gemini Yapılandırması
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# Frontend erişim izni
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Güncel Üniversite Listesi
@app.get("/universiteler")
def get_universities():
    return [
        {"id": 1, "ad": "Université de N'Djaména"},
        {"id": 2, "ad": "Université Roi Fayçal (Faisal)"},
        {"id": 3, "ad": "HEC-TCHAD Business School"},
        {"id": 4, "ad": "Université de Moundou"},
        {"id": 5, "ad": "Université de Sarh"},
        {"id": 6, "ad": "Université de Abéché (UNABA)"}
    ]

# 2. Dosya Yükleme ve AI Özetleme (PDF ve TXT Destekli)
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        content = ""
        # PDF Dosyası ise içeriği çıkar
        if file.filename.lower().endswith(".pdf"):
            doc = fitz.open(file_path)
            for page in doc:
                content += page.get_text()
            doc.close()
        # Metin dosyası ise oku
        else:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
        
        # Boş dosya kontrolü
        if not content.strip():
            return {"message": "Dosya içeriği boş veya okunamadı."}

        # Gemini'den akademik özet iste
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=f"Sen bir akademik asistansın. Aşağıdaki ders notunu bir öğrenci için en önemli noktaları vurgulayarak özetle, varsa formülleri veya önemli tarihleri belirt ve 5 anahtar madde çıkar: {content}"
        )
        
        return {
            "filename": file.filename,
            "message": "Analiz tamamlandı!",
            "ozet": response.text
        }
        
    except Exception as e:
        return {"message": f"Hata oluştu: {str(e)}"}

@app.get("/")
def read_root():
    return {"message": "EduChad Backend Aktif!", "universiteler": "/universiteler"}