"use client";
import { useEffect, useState } from 'react';

export default function Home() {
  const [ozet, setOzet] = useState("");
  const [unis, setUnis] = useState([]);
  useEffect(() => {
    fetch('http://localhost:8000/universiteler')
      .then(res => res.json())
      .then(data => setUnis(data))
      .catch(err => console.error("Backend hatası:", err));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-slate-900 text-white">
      <h1 className="text-5xl font-extrabold text-blue-400 mb-2">EduChad</h1>
      <p className="text-slate-400 italic mb-10">Akademik materyallere erişimi demokratikleştiriyoruz.</p>
      
      <div className="w-full max-w-md bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700">
        <h2 className="text-2xl font-semibold mb-6 border-b border-slate-600 pb-2">Üniversiteler</h2>
        <ul className="space-y-4">
          {unis.map(uni => (
            <li key={uni.id} className="flex items-center p-3 bg-slate-700 rounded-lg hover:bg-blue-600 transition-all cursor-pointer">
              <span className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 font-bold">
                {uni.id}
              </span>
              <span className="text-lg font-medium">{uni.ad}</span>
            </li>
          ))}
        </ul>
        <div className="mt-8 p-4 border-2 border-dashed border-slate-600 rounded-xl text-center">
  <h3 className="text-lg font-medium mb-4">Ders Notu Yükle</h3>
  <input 
              type="file" 
              onChange={async (e) => {
                const file = e.target.files[0];
                const formData = new FormData();
                formData.append("file", file);

                const res = await fetch("http://localhost:8000/upload", {
                  method: "POST",
                  body: formData,
                });
                
                const data = await res.json();
                if (data.ozet) {
                  setOzet(data.ozet); // Özeti hafızaya al
                } else {
                  alert(data.message);
                }
              }}
              className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
          </div>

          {/* --- ÖZET KUTUSU (BURAYI EKLE) --- */}
          {ozet && (
            <div className="mt-8 p-6 bg-slate-800 border-2 border-blue-500 rounded-2xl shadow-2xl">
              <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center">
                ✨ Yapay Zeka Özeti
              </h3>
              <div className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                {ozet}
              </div>
            </div>
          )}
</div>
      </div>
    </main>
  );
}