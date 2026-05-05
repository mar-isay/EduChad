from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from dotenv import load_dotenv
import os
import shutil
import fitz  # PyMuPDF: PDF okumak için

# 1. Kurulumlar ve Çevre Değişkenleri
load_dotenv()
app = FastAPI()

# Gemini Yapılandırması
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_KEY)

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# 2. GÜNCEL CORS AYARLARI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Üniversite Listesi (Mevcut Yapı Korundu)
@app.get("/universiteler")
def get_universities():
    return [
        {
            "id": 1, 
            "ad": "Université de N'Djaména",
            "fakulteler": [
                {"id": 101, "ad": "Faculté des Sciences Exactes et Appliquées"},
                {"id": 102, "ad": "Faculté des Sciences de la Santé"},
                {"id": 103, "ad": "Faculté de Droit et des Sciences Juridiques"}
            ]
        },
        {
            "id": 2, 
            "ad": "Université Roi Fayçal (Faisal)",
            "fakulteler": [
                {"id": 201, "ad": "Faculté de Langue Arabe et Études Islamiques"},
                {"id": 202, "ad": "Faculté des Sciences de l'Éducation"},
                {"id": 203, "ad": "Faculté d'Économie et de Gestion"}
            ]
        },
        {
            "id": 3, 
            "ad": "HEC-TCHAD Business School",
            "fakulteler": [
                {"id": 301, "ad": "Faculté de Gestion et d'Économie"},
                {"id": 302, "ad": "Département des Technologies de l'Information"},
                {"id": 303, "ad": "Département de Communication"}
            ]
        },
        {
            "id": 4, 
            "ad": "Université de Moundou",
            "fakulteler": [
                {"id": 401, "ad": "Faculté des Sciences Techniques"},
                {"id": 402, "ad": "Faculté des Lettres ve Sciences Humaines"}
            ]
        },
        {
            "id": 5, 
            "ad": "Université d'Abéché (UNABA)",
            "fakulteler": [
                {"id": 501, "ad": "Faculté des Sciences de la Santé"},
                {"id": 502, "ad": "Institut Universitaire des Sciences et Techniques"}
            ]
        }
    ]

# 4. Dosya Yükleme ve Çok Dilli AI Özetleme[cite: 1]
@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...), 
    uni_ad: str = Form(...), 
    fak_ad: str = Form(...),
    dil: str = Form("tr") # Varsayılan dil Türkçe, ancak fr veya ar gelebilir[cite: 1]
):
    try:
        # Klasör yolunu temizle ve oluştur[cite: 1]
        safe_uni = uni_ad.replace(" ", "_").replace("'", "").replace("/", "_")
        safe_fak = fak_ad.replace(" ", "_").replace("'", "").replace("/", "_")
        
        target_dir = os.path.join(UPLOAD_DIR, safe_uni, safe_fak)
        
        if not os.path.exists(target_dir):
            os.makedirs(target_dir, exist_ok=True)
            
        file_path = os.path.join(target_dir, file.filename)
        
        # Dosyayı fiziksel olarak kaydet[cite: 1]
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Dosya içeriğini oku (PDF veya metin)[cite: 1]
        content = ""
        if file.filename.lower().endswith(".pdf"):
            doc = fitz.open(file_path)
            for page in doc:
                content += page.get_text()
            doc.close()
        else:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()

        if not content.strip():
            content = "Metin okunamadı."

        # DİL TALİMATI: Kullanıcının seçtiği dile göre Gemini'ye komut veriyoruz[cite: 1]
        dil_talimatlari = {
            "tr": "Lütfen bu ders notunu Türkçe olarak özetle.",
            "fr": "Veuillez résumer cette note de cours en français.",
            "ar": "يرجى تلخيص هذه المذكرة الدراسية باللغة العربية."
        }
        
        komut = dil_talimatlari.get(dil, dil_talimatlari["tr"])

        # Gemini Analizi (Çok Dilli Destekli)[cite: 1]
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=f"Bu not {uni_ad} - {fak_ad} bölümüne aittir. {komut} Not içeriği: {content}"
        )
        
        return {
            "filename": file.filename,
            "ozet": response.text if response.text else "Özet oluşturulamadı.",
            "path": file_path
        }
        
    except Exception as e:
        print(f"Hata detayı: {str(e)}") 
        return {"message": f"Sunucu hatası: {str(e)}"}

@app.get("/")
def read_root():
    return {"status": "online", "message": "EduChad Backend Aktif!"}