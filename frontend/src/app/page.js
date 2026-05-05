"use client";
import { useEffect, useState } from 'react';

export default function Home() {
  // --- STATE TANIMLAMALARI ---
  const [email, setEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  
  const [ozet, setOzet] = useState("");
  const [unis, setUnis] = useState([]);
  const [seciliUni, setSeciliUni] = useState(null);
  const [seciliFak, setSeciliFak] = useState(null);
  const [dil, setDil] = useState('tr');

  // Üniversite listesini çek
  useEffect(() => {
    fetch('http://localhost:8000/universiteler')
      .then(res => res.json())
      .then(data => setUnis(data))
      .catch(err => console.error("Bağlantı Hatası:", err));
  }, []);

  // --- GİRİŞ YAPMA FONKSİYONU ---
  const handleLogin = async () => {
    if (!email) return alert("Lütfen mail girin");
    
    const formData = new FormData();
    formData.append("email", email);

    const res = await fetch("http://localhost:8000/login", {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    
    setUser(data.user);
    setIsLoggedIn(true);
    
    // Eğer veritabanında okul bilgisi varsa otomatik ayarla
    if (data.user.university && data.user.department) {
      setSeciliUni({ ad: data.user.university });
      setSeciliFak({ ad: data.user.department });
    }
  };

  // --- PROFİL KAYDETME FONKSİYONU ---
  const saveProfile = async () => {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("uni", seciliUni.ad);
    formData.append("bolum", seciliFak.ad);
    formData.append("dil", dil);

    await fetch("http://localhost:8000/update_profile", {
      method: "POST",
      body: formData
    });
    alert("Profiliniz kaydedildi!");
    // Sayfayı yenilemeden veriyi güncelle
    setUser({...user, university: seciliUni.ad, department: seciliFak.ad});
  };

  // Dil bazlı metinler
  const metinler = {
    tr: { baslik: "Üniversiteler", yukle: "Not Yükle", ozetBaslik: "✨ Yapay Zeka Özeti", altBaslik: "Akademik materyallere erişimi demokratikleştiyoruz.", giris: "Giriş Yap", profilKaydet: "Profili Tamamla" },
    fr: { baslik: "Universités", yukle: "Télécharger la Note", ozetBaslik: "✨ Résumé IA", altBaslik: "Démocratiser l'accès aux matériels académiques.", giris: "Se connecter", profilKaydet: "Compléter le profil" },
    ar: { baslik: "الجامعات", yukle: "تحميل المذكرة", ozetBaslik: "✨ ملخص الذكاء الاصطناعي", altBaslik: "ديمقراطية الوصول إلى المواد الأكاديمية.", giris: "تسجيل الدخول", profilKaydet: "إكمال الملف الشخصي" }
  };

  return (
    <main dir={dil === 'ar' ? 'rtl' : 'ltr'} className="flex min-h-screen flex-col items-center p-24 bg-slate-900 text-white transition-all">
      
      {/* Dil Seçici */}
      <div className="flex gap-2 mb-8 bg-slate-800 p-2 rounded-full border border-slate-700">
        <button onClick={() => setDil('tr')} className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${dil === 'tr' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}>🇹🇷 TR</button>
        <button onClick={() => setDil('fr')} className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${dil === 'fr' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}>🇫🇷 FR</button>
        <button onClick={() => setDil('ar')} className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${dil === 'ar' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}>🇸🇦 AR</button>
      </div>

      <h1 className="text-5xl font-extrabold text-blue-400 mb-2">EduChad</h1>
      <p className="text-slate-400 italic mb-10">{metinler[dil].altBaslik}</p>

      {!isLoggedIn ? (
        /* 1. ADIM: GİRİŞ EKRANI */
        <div className="w-full max-w-md bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700 text-center">
          <h2 className="text-2xl font-bold mb-6">Akademik Giriş</h2>
          <input 
            type="email" 
            placeholder="E-posta adresiniz" 
            className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 mb-4 outline-none focus:border-blue-500 text-center"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={handleLogin} className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-lg font-bold transition-all">
            {metinler[dil].giris}
          </button>
        </div>
      ) : (
        /* 2. ADIM: ANA PANEL */
        <div className="w-full max-w-md space-y-6">
          
          {/* Eğer okul seçili değilse profil tamamlama ekranı gelir */}
          {(!user?.university || !user?.department) && (!seciliUni || !seciliFak) ? (
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
              <h2 className="text-xl font-bold mb-4">{metinler[dil].baslik}</h2>
              <ul className="space-y-4">
                {unis.map(uni => (
                  <li key={uni.id} onClick={() => setSeciliUni(uni)} className={`p-3 rounded-lg cursor-pointer ${seciliUni?.id === uni.id ? 'bg-blue-600' : 'bg-slate-700'}`}>
                    {uni.ad}
                  </li>
                ))}
              </ul>
              {seciliUni && (
                <div className="mt-4 grid gap-2">
                  {seciliUni.fakulteler?.map(fak => (
                    <button key={fak.id} onClick={() => setSeciliFak(fak)} className={`p-2 rounded-lg text-sm text-left ${seciliFak?.id === fak.id ? 'bg-blue-500' : 'bg-slate-600'}`}>
                      {fak.ad}
                    </button>
                  ))}
                </div>
              )}
              {seciliUni && seciliFak && (
                <button onClick={saveProfile} className="mt-6 w-full bg-green-600 p-3 rounded-lg font-bold">
                  {metinler[dil].profilKaydet}
                </button>
              )}
            </div>
          ) : (
            /* 3. ADIM: DOSYA YÜKLEME VE ÖZETLEME */
            <>
              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 text-center">
                <p className="text-blue-300 text-sm mb-2">Hoş geldin, {email}</p>
                <h3 className="text-lg font-bold text-white mb-4">🏫 {seciliUni?.ad}</h3>
                <p className="text-slate-400 text-xs mb-4">{seciliFak?.ad}</p>
                
                <div className="mt-4 p-4 border-2 border-dashed border-blue-500 rounded-xl bg-blue-900/20">
                  <input 
                    type="file" 
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const formData = new FormData();
                      formData.append("file", file);
                      formData.append("uni_ad", seciliUni.ad);
                      formData.append("fak_ad", seciliFak.ad);
                      formData.append("dil", dil);

                      const res = await fetch("http://localhost:8000/upload", { method: "POST", body: formData });
                      const data = await res.json();
                      setOzet(data.ozet);
                    }}
                    className="block w-full text-sm text-slate-400 file:bg-blue-600 file:text-white file:rounded-full file:border-0 file:px-4 file:py-2"
                  />
                </div>
              </div>

              {ozet && (
                <div className="p-6 bg-slate-800 border-2 border-blue-500 rounded-2xl shadow-2xl animate-pulse">
                  <h3 className="text-xl font-bold text-blue-400 mb-4">{metinler[dil].ozetBaslik}</h3>
                  <div className="text-slate-200 leading-relaxed whitespace-pre-wrap text-sm">{ozet}</div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </main>
  );
}