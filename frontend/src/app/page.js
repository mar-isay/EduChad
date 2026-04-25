"use client";
import { useEffect, useState } from 'react';

export default function Home() {
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
      </div>
    </main>
  );
}