"use client";
import { useEffect, useState } from 'react';

export default function Home() {
  // --- STATE TANIMLAMALARI ---
  const [email, setEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Yeni Özellikler için Stateler
  const [theme, setTheme] = useState('dark'); // 'dark' veya 'light'
  const [bildirim, setBildirim] = useState(""); // Ana sayfa bildirimi
  
  const [ozet, setOzet] = useState("");
  const [unis, setUnis] = useState([]);
  const [seciliUni, setSeciliUni] = useState(null);
  const [seciliFak, setSeciliFak] = useState(null);
  const [dil, setDil] = useState('tr');

  // Başlangıç bildirimi ve verileri çekme
  useEffect(() => {
    setBildirim(metinler[dil].hoşgeldinMesajı);
    fetch('http://localhost:8000/universiteler')
      .then(res => res.json())
      .then(data => setUnis(data))
      .catch(err => console.error("Bağlantı Hatası:", err));
  }, [dil]);

  // --- GİRİŞ YAPMA FONKSİYONU ---
  const handleLogin = async () => {
    if (!email) return alert("Lütfen mail girin");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("email", email);
      const res = await fetch("http://localhost:8000/login", { method: "POST", body: formData });
      const data = await res.json();
      setUser(data.user);
      setIsLoggedIn(true);
      setBildirim(`${email} olarak giriş yapıldı. Başarılar dileriz!`);
      if (data.user.university && data.user.department) {
        setSeciliUni({ ad: data.user.university });
        setSeciliFak({ ad: data.user.department });
      }
    } catch (err) {
      alert("Giriş hatası!");
    } finally {
      setLoading(false);
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
      await fetch("http://localhost:8000/update_profile", { method: "POST", body: formData });
      setUser({...user, university: seciliUni.ad, department: seciliFak.ad});
      setBildirim("Profilin güncellendi. Artık hızlıca not yükleyebilirsin!");
    } catch (err) {
      alert("Profil güncellenemedi.");
    } finally {
      setLoading(false);
    }
  };

  const metinler = {
    tr: { loading: "Yapay Zeka notu analiz ediyor...", baslik: "Üniversiteler", yukle: "Not Yükle", ozetBaslik: "✨ Yapay Zeka Özeti", altBaslik: "Akademik materyallere erişimi demokratikleştiriyoruz.", giris: "Giriş Yap", profilKaydet: "Profili Tamamla", hoşgeldinMesajı: "EduChad'e hoş geldin! Notunu yükle ve AI özetini al." },
    fr: { loading: "L'IA analyse la note...", baslik: "Universités", yukle: "Télécharger la Note", ozetBaslik: "✨ Résumé IA", altBaslik: "Démocratiser l'accès aux matériels académiques.", giris: "Se connecter", profilKaydet: "Compléter le profil", hoşgeldinMesajı: "Bienvenue sur EduChad ! Téléchargez et résumez." },
    ar: { loading: "الذكاء الاصطناعي يحلل المذكرة...", baslik: "الجامعات", yukle: "تحميل المذكرة", ozetBaslik: "✨ ملخص الذكاء الاصطناعي", altBaslik: "ديمقراطية الوصول إلى المواد الأكاديمية.", giris: "تسجيل الدخول", profilKaydet: "إكمال الملف الشخصي", hoşgeldinMesajı: "مرحباً بك في EduChad! قم بتحميل مذكرتك الآن." }
  };

  return (
    <main dir={dil === 'ar' ? 'rtl' : 'ltr'} 
          className={`flex min-h-screen flex-col items-center p-24 transition-all duration-700 ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* ÜST BAR: BİLDİRİM VE AYARLAR */}
      <div className="flex flex-col md:flex-row justify-between w-full max-w-5xl mb-12 gap-4 items-center">
          {/* Hareketli Bildirim Alanı */}
          <div className={`px-6 py-3 rounded-2xl text-sm font-bold border flex items-center gap-3 animate-pulse shadow-lg ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-blue-400' : 'bg-white border-blue-100 text-blue-600 shadow-blue-100'}`}>
              <span className="text-lg">🔔</span> {bildirim}
          </div>

          <div className="flex gap-4">
              {/* Tema Değiştirici Buton */}
              <button 
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className={`p-4 rounded-2xl transition-all active:scale-90 shadow-xl text-xl ${theme === 'dark' ? 'bg-slate-800 text-yellow-400 border border-slate-700' : 'bg-white text-slate-900 border border-slate-200'}`}
              >
                  {theme === 'dark' ? '☀️' : '🌙'}
              </button>

              {/* Dil Seçici */}
              <div className={`flex gap-2 p-2 rounded-2xl border shadow-xl ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                  {['tr', 'fr', 'ar'].map(l => (
                      <button key={l} onClick={() => setDil(l)} className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${dil === l ? 'bg-blue-600 text-white shadow-lg' : 'opacity-40 hover:opacity-100'}`}>
                          {l.toUpperCase()}
                      </button>
                  ))}
              </div>
          </div>
      </div>

      <h1 className={`text-7xl font-black mb-2 tracking-tighter ${theme === 'dark' ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500' : 'text-blue-600'}`}>EduChad</h1>
      <p className="opacity-60 italic mb-12 text-center max-w-sm font-medium">{metinler[dil].altBaslik}</p>

      {/* YÜKLEME ANİMASYONU */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-500 mb-6"></div>
          <p className="text-blue-400 font-black tracking-widest animate-pulse uppercase">{metinler[dil].loading}</p>
        </div>
      )}

      {!isLoggedIn ? (
        /* GİRİŞ EKRANI */
        <div className={`w-full max-w-md p-10 rounded-[3rem] shadow-2xl border transition-all ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700/50 backdrop-blur-xl' : 'bg-white border-slate-200'}`}>
          <h2 className="text-3xl font-black mb-8 text-center tracking-tight">Akademik Başlangıç</h2>
          <input 
            type="email" 
            placeholder="E-posta adresiniz" 
            className={`w-full p-5 rounded-2xl mb-6 outline-none focus:ring-4 focus:ring-blue-500/20 transition-all text-center font-bold text-lg ${theme === 'dark' ? 'bg-slate-900 border border-slate-700' : 'bg-slate-100 border border-slate-200 text-slate-900'}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={handleLogin} className="w-full bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 p-5 rounded-2xl font-black text-xl text-white shadow-blue-900/20 shadow-2xl transition-all active:scale-95">
            {metinler[dil].giris}
          </button>
        </div>
      ) : (
        /* ANA PANEL */
        <div className="w-full max-w-xl space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
          
          {(!user?.university || !user?.department) && (!seciliUni || !seciliFak) ? (
            <div className={`p-8 rounded-[2.5rem] border shadow-2xl ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              <h2 className="text-2xl font-black mb-6 border-b pb-4">{metinler[dil].baslik}</h2>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-3 custom-scrollbar">
                {unis.map(uni => (
                  <div key={uni.id} onClick={() => setSeciliUni(uni)} className={`p-4 rounded-2xl cursor-pointer font-bold transition-all ${seciliUni?.id === uni.id ? 'bg-blue-600 text-white scale-[1.03] shadow-lg' : theme === 'dark' ? 'bg-slate-900 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                    {uni.ad}
                  </div>
                ))}
              </div>
              {seciliUni && (
                <div className="mt-8 grid grid-cols-1 gap-3 animate-in zoom-in duration-300">
                  {seciliUni.fakulteler?.map(fak => (
                    <button key={fak.id} onClick={() => setSeciliFak(fak)} className={`p-4 rounded-2xl text-sm font-bold text-left transition-all ${seciliFak?.id === fak.id ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/30' : theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}`}>
                      {fak.ad}
                    </button>
                  ))}
                </div>
              )}
              {seciliUni && seciliFak && (
                <button onClick={saveProfile} className="mt-10 w-full bg-green-600 hover:bg-green-500 p-5 rounded-2xl font-black text-xl text-white shadow-xl transition-all">
                  {metinler[dil].profilKaydet}
                </button>
              )}
            </div>
          ) : (
            <>
              <div className={`p-10 rounded-[3rem] border shadow-2xl text-center relative overflow-hidden ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                <p className="text-blue-500 font-black text-xs uppercase tracking-[0.2em] mb-3">{email}</p>
                <h3 className="text-3xl font-black mb-2 tracking-tighter">🏫 {seciliUni?.ad}</h3>
                <p className="opacity-50 text-sm font-bold italic mb-10">{seciliFak?.ad}</p>
                
                <div className={`mt-4 p-10 border-4 border-dashed rounded-[2rem] transition-all group ${theme === 'dark' ? 'border-slate-700 hover:border-blue-500 bg-slate-900/50' : 'border-slate-200 hover:border-blue-500 bg-slate-50'}`}>
                  <input 
                    type="file" 
                    id="file-upload"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      setLoading(true);
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
                        setBildirim("Yapay Zeka notunu inceledi. Aşağıda özetini görebilirsin!");
                      } catch (err) {
                        alert("Dosya işleme hatası!");
                      } finally {
                        setLoading(false);
                      }
                    }}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg mb-4 group-hover:scale-110 transition-transform">📄</div>
                    <span className="text-xl font-black mb-1">{metinler[dil].yukle}</span>
                    <span className="text-[10px] uppercase font-black tracking-widest opacity-40">PDF, DOCX veya TXT</span>
                  </label>
                </div>
              </div>

              {ozet && (
                <div className={`p-10 rounded-[3rem] border shadow-2xl animate-in slide-in-from-bottom-12 duration-1000 ${theme === 'dark' ? 'bg-slate-800 border-blue-500/30' : 'bg-white border-blue-200'}`}>
                  <div className="flex items-center gap-4 mb-8 border-b pb-6 border-slate-700/20">
                    <span className="text-4xl">🤖</span>
                    <h3 className="text-2xl font-black tracking-tighter text-blue-500 uppercase">{metinler[dil].ozetBaslik}</h3>
                  </div>
                  <div className={`text-base leading-loose whitespace-pre-wrap font-medium p-8 rounded-[2rem] ${theme === 'dark' ? 'bg-slate-900/50 text-slate-200' : 'bg-slate-50 text-slate-800 shadow-inner'}`}>
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