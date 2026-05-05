"use client";
import { useEffect, useState } from 'react';

export default function Home() {
  // --- STATE TANIMLAMALARI ---
  const [email, setEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false); // Yükleme durumu için yeni state
  
  const [ozet, setOzet] = useState("");
  const [unis, setUnis] = useState([]);
  const [seciliUni, setSeciliUni] = useState(null);
  const [seciliFak, setSeciliFak] = useState(null);
  const [dil, setDil] = useState('tr');

  useEffect(() => {
    fetch('http://localhost:8000/universiteler')
      .then(res => res.json())
      .then(data => setUnis(data))
      .catch(err => console.error("Bağlantı Hatası:", err));
  }, []);

  // --- GİRİŞ YAPMA FONKSİYONU ---
  const handleLogin = async () => {
    if (!email) return alert("Lütfen mail girin");
    setLoading(true); // Giriş yapılırken bekleme başlat
    
    try {
      const formData = new FormData();
      formData.append("email", email);

      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      
      setUser(data.user);
      setIsLoggedIn(true);
      
      if (data.user.university && data.user.department) {
        setSeciliUni({ ad: data.user.university });
        setSeciliFak({ ad: data.user.department });
      }
    } catch (err) {
      alert("Giriş hatası!");
    } finally {
      setLoading(false); // İşlem bittiğinde durdur
    }
  };

  // --- PROFİL KAYDETME FONKSİYONU ---
  const saveProfile = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("email", email);
    formData.append("uni", seciliUni.ad);
    formData.append("bolum", seciliFak.ad);
    formData.append("dil", dil);

    try {
      await fetch("http://localhost:8000/update_profile", {
        method: "POST",
        body: formData
      });
      setUser({...user, university: seciliUni.ad, department: seciliFak.ad});
      alert("Profiliniz kaydedildi!");
    } catch (err) {
      alert("Profil güncellenemedi.");
    } finally {
      setLoading(false);
    }
  };

  const metinler = {
    tr: { loading: "Yapay Zeka notu analiz ediyor...", baslik: "Üniversiteler", yukle: "Not Yükle", ozetBaslik: "✨ Yapay Zeka Özeti", altBaslik: "Akademik materyallere erişimi demokratikleştiyoruz.", giris: "Giriş Yap", profilKaydet: "Profili Tamamla" },
    fr: { loading: "L'IA analyse la note...", baslik: "Universités", yukle: "Télécharger la Note", ozetBaslik: "✨ Résumé IA", altBaslik: "Démocratiser l'accès aux matériels académiques.", giris: "Se connecter", profilKaydet: "Compléter le profil" },
    ar: { loading: "الذكاء الاصطناعي يحلل المذكرة...", baslik: "الجامعات", yukle: "تحميل المذكرة", ozetBaslik: "✨ ملخص الذكاء الاصطناعي", altBaslik: "ديمقراطية الوصول إلى المواد الأكاديمية.", giris: "تسجيل الدخول", profilKaydet: "إكمال الملف الشخصي" }
  };

  return (
    <main dir={dil === 'ar' ? 'rtl' : 'ltr'} className="flex min-h-screen flex-col items-center p-24 bg-slate-900 text-white transition-all duration-500">
      
      {/* Dil Seçici */}
      <div className="flex gap-2 mb-8 bg-slate-800/50 backdrop-blur-md p-2 rounded-full border border-slate-700 shadow-lg">
        {['tr', 'fr', 'ar'].map((l) => (
          <button 
            key={l}
            onClick={() => setDil(l)} 
            className={`px-6 py-2 rounded-full text-xs font-extrabold transition-all duration-300 ${dil === l ? 'bg-blue-600 shadow-md shadow-blue-500/50 scale-110' : 'hover:bg-slate-700 opacity-60 hover:opacity-100'}`}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 mb-2 drop-shadow-sm">EduChad</h1>
      <p className="text-slate-400 italic mb-10 text-center max-w-sm">{metinler[dil].altBaslik}</p>

      {/* YÜKLEME ANİMASYONU (LOADING OVERLAY) */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
          <p className="text-blue-400 font-bold animate-pulse">{metinler[dil].loading}</p>
        </div>
      )}

      {!isLoggedIn ? (
        <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-lg p-10 rounded-3xl shadow-2xl border border-slate-700/50 transform transition-all hover:scale-[1.01]">
          <h2 className="text-2xl font-bold mb-6 text-center">Akademik Giriş</h2>
          <input 
            type="email" 
            placeholder="E-posta adresiniz" 
            className="w-full p-4 rounded-xl bg-slate-900/50 border border-slate-700 mb-6 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-center font-medium"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button 
            onClick={handleLogin} 
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 p-4 rounded-xl font-black text-lg transition-all active:scale-95 shadow-xl"
          >
            {metinler[dil].giris}
          </button>
        </div>
      ) : (
        <div className="w-full max-w-lg space-y-6 animate-in fade-in zoom-in duration-500">
          
          {(!user?.university || !user?.department) && (!seciliUni || !seciliFak) ? (
            <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl">
              <h2 className="text-xl font-bold mb-6 border-b border-slate-700 pb-2">{metinler[dil].baslik}</h2>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {unis.map(uni => (
                  <div 
                    key={uni.id} 
                    onClick={() => setSeciliUni(uni)} 
                    className={`p-4 rounded-xl cursor-pointer transition-all ${seciliUni?.id === uni.id ? 'bg-blue-600 scale-[1.02] shadow-lg' : 'bg-slate-700/50 hover:bg-slate-700'}`}
                  >
                    {uni.ad}
                  </div>
                ))}
              </div>
              {seciliUni && (
                <div className="mt-6 grid grid-cols-1 gap-2 animate-in slide-in-from-bottom-4">
                  {seciliUni.fakulteler?.map(fak => (
                    <button 
                      key={fak.id} 
                      onClick={() => setSeciliFak(fak)} 
                      className={`p-3 rounded-xl text-sm text-left transition-all ${seciliFak?.id === fak.id ? 'bg-indigo-600 ring-2 ring-indigo-400 shadow-lg' : 'bg-slate-900/50 hover:bg-slate-800'}`}
                    >
                      {fak.ad}
                    </button>
                  ))}
                </div>
              )}
              {seciliUni && seciliFak && (
                <button onClick={saveProfile} className="mt-8 w-full bg-green-600 hover:bg-green-500 p-4 rounded-xl font-black shadow-lg transition-all active:scale-95">
                  {metinler[dil].profilKaydet}
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl text-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                <p className="text-blue-400 font-bold text-xs uppercase tracking-widest mb-2">{email}</p>
                <h3 className="text-2xl font-black text-white mb-2 tracking-tight">🏫 {seciliUni?.ad}</h3>
                <p className="text-slate-400 text-sm font-medium mb-8 italic">{seciliFak?.ad}</p>
                
                <div className="mt-4 p-8 border-2 border-dashed border-slate-600 rounded-2xl bg-slate-900/30 hover:border-blue-500 transition-colors group-hover:bg-blue-900/5">
                  <input 
                    type="file" 
                    id="file-upload"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      setLoading(true); // Yükleme başladığında animasyonu göster
                      setOzet("");
                      
                      const formData = new FormData();
                      formData.append("file", file);
                      formData.append("uni_ad", seciliUni.ad);
                      formData.append("fak_ad", seciliFak.ad);
                      formData.append("dil", dil);

                      try {
                        const res = await fetch("http://localhost:8000/upload", { method: "POST", body: formData });
                        const data = await res.json();
                        setOzet(data.ozet);
                      } catch (err) {
                        alert("Dosya işleme hatası!");
                      } finally {
                        setLoading(false); // Bittiğinde gizle
                      }
                    }}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                    <span className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-blue-500 transition-all mb-2">
                      {metinler[dil].yukle}
                    </button>
                    <span className="text-xs text-slate-500 uppercase font-bold tracking-tighter">PDF veya Metin Belgesi</span>
                  </label>
                </div>
              </div>

              {ozet && (
                <div className="p-8 bg-slate-800 border border-blue-500/30 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div className="flex items-center gap-2 mb-6 border-b border-slate-700 pb-4">
                    <span className="text-2xl">✨</span>
                    <h3 className="text-xl font-black text-blue-400 uppercase tracking-tight">{metinler[dil].ozetBaslik}</h3>
                  </div>
                  <div className="text-slate-200 leading-relaxed whitespace-pre-wrap text-sm font-medium bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50">
                    {ozet}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </main>
  );
}