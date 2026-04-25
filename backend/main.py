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