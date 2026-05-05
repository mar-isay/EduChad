"use client";
import { useEffect, useState } from 'react';

export default function Home() {
  const [ozet, setOzet] = useState("");
  const [unis, setUnis] = useState([]);
  const [seciliUni, setSeciliUni] = useState(null);
  const [seciliFak, setSeciliFak] = useState(null);
  const [dil, setDil] = useState('tr'); // Varsayılan dil Türkçe

  useEffect(() => {
    fetch('http://localhost:8000/universiteler')
      .then(res => res.json())
      .then(data => setUnis(data))
      .catch(err => console.error("Bağlantı Hatası:", err));
  }, []);

  // Dil bazlı metinler (Arayüzü yerelleştirmek için)
  const metinler = {
    tr: { baslik: "Üniversiteler", yukle: "Not Yükle", ozetBaslik: "✨ Yapay Zeka Özeti", altBaslik: "Akademik materyallere erişimi demokratikleştiriyoruz." },
    fr: { baslik: "Universités", yukle: "Télécharger la Note", ozetBaslik: "✨ Résumé IA", altBaslik: "Démocratiser l'accès aux matériels académiques." },
    ar: { baslik: "الجامعات", yukle: "تحميل المذكرة", ozetBaslik: "✨ ملخص الذكاء الاصطناعي", altBaslik: "ديمقراطية الوصول إلى المواد الأكاديمية." }
  };

  return (
    // Arapça seçildiğinde 'dir="rtl"' ekleyerek sayfa düzenini çeviriyoruz
    <main dir={dil === 'ar' ? 'rtl' : 'ltr'} className="flex min-h-screen flex-col items-center p-24 bg-slate-900 text-white transition-all">
      
      {/* Dil Seçici Butonlar */}
      <div className="flex gap-2 mb-8 bg-slate-800 p-2 rounded-full border border-slate-700">
        <button onClick={() => setDil('tr')} className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${dil === 'tr' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}>🇹🇷 TR</button>
        <button onClick={() => setDil('fr')} className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${dil === 'fr' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}>🇫🇷 FR</button>
        <button onClick={() => setDil('ar')} className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${dil === 'ar' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}>🇸🇦 AR</button>
      </div>

      <h1 className="text-5xl font-extrabold text-blue-400 mb-2">EduChad</h1>
      <p className="text-slate-400 italic mb-10">{metinler[dil].altBaslik}</p>
      
      <div className="w-full max-w-md bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700">
        <h2 className="text-2xl font-semibold mb-6 border-b border-slate-600 pb-2">{metinler[dil].baslik}</h2>
        
        <ul className="space-y-4">
          {unis.map(uni => (
            <li  
              key={uni.id} 
              onClick={() => {
                setSeciliUni(uni);
                setSeciliFak(null);
                setOzet("");
              }} 
              className={`flex items-center p-3 rounded-lg transition-all cursor-pointer ${
                seciliUni?.id === uni.id ? 'bg-blue-600 border-blue-400' : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              <span className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 ml-3 font-bold text-xs">
                {uni.id}
              </span>
              <span className="text-lg font-medium">{uni.ad}</span>
            </li>
          ))}
        </ul>

        {seciliUni && (
          <div className="mt-8 p-6 bg-slate-800 border-t-2 border-blue-500 rounded-b-2xl">
            <h3 className="text-lg font-bold text-blue-400 mb-4">🏫 {seciliUni.ad}</h3>
            <div className="grid grid-cols-1 gap-3">
              {seciliUni.fakulteler?.map((fak) => (
                <button 
                  key={fak.id}
                  onClick={() => setSeciliFak(fak)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    seciliFak?.id === fak.id ? 'bg-blue-600 border-blue-300' : 'bg-slate-700 border-slate-600 hover:border-blue-400'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-slate-200 font-medium">{fak.ad}</span>
                    {seciliFak?.id === fak.id && <span className="text-xs font-bold text-white">✓</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {seciliFak && (
          <div className="mt-8 p-4 border-2 border-dashed border-blue-500 rounded-xl text-center bg-blue-900/20">
            <h3 className="text-lg font-medium mb-4 text-blue-300">{metinler[dil].yukle}: {seciliFak.ad}</h3>
            <input 
              type="file" 
              onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const formData = new FormData();
                formData.append("file", file);
                formData.append("uni_ad", seciliUni.ad);
                formData.append("fak_ad", seciliFak.ad);
                formData.append("dil", dil); // Seçili dili Backend'e gönderiyoruz[cite: 1]

                const res = await fetch("http://localhost:8000/upload", {
                  method: "POST",
                  body: formData,
                });
                
                const data = await res.json();
                if (data.ozet) {
                  setOzet(data.ozet);
                } else {
                  alert(data.message || "Hata!");
                }
              }}
              className="block w-full text-sm text-slate-400 file:mr-4 file:ml-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
          </div>
        )}

        {ozet && (
          <div className="mt-8 p-6 bg-slate-800 border-2 border-blue-500 rounded-2xl shadow-2xl">
            <h3 className="text-xl font-bold text-blue-400 mb-4">{metinler[dil].ozetBaslik}</h3>
            <div className="text-slate-200 leading-relaxed whitespace-pre-wrap text-sm">
              {ozet}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}