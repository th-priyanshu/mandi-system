import React, { useState } from 'react';

export default function Auth({ onLoginSuccess }) {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Username ya Password sahi nahi hai bhai!');
      }

      localStorage.setItem('mandiToken', data.token);
      onLoginSuccess(); 
    } catch (err) {
      if (err.message.includes('fetch')) {
        setError('Backend Server (Port 5001) chalu nahi hai bhai. Terminal par npm start karo!');
      } else {
        setError(err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative"
      style={{ 
        // 🌾 High-quality lush green Indian farm background
        backgroundImage: `url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=2070&auto=format&fit=crop')` 
      }}
    >
      {/* 🌲 Dark Organic Overlay to give perfect contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-stone-900/40 via-emerald-950/60 to-stone-950/80 backdrop-blur-[2px]"></div>

      {/* 🎴 Premium Frosted Glass Merchant Card */}
      <div className="relative bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.25)] border border-white/40 w-full max-w-md transition-all duration-300 hover:shadow-[0_35px_70px_rgba(4,47,31,0.35)]">
        
        {/* Decorative Top Leaf/Crop Element */}
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-amber-500 text-stone-9alled text-xs font-black px-4 py-1 rounded-full shadow-md tracking-wider uppercase">
          🌾 समृद्ध किसान, समृद्ध व्यापार
        </div>

        {/* Logo & Header */}
        <div className="text-center mb-8 mt-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-700 via-emerald-850 to-stone-900 text-white text-3xl shadow-lg shadow-emerald-950/30 mb-3">
            🚜
          </div>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight bg-gradient-to-r from-emerald-900 via-stone-800 to-emerald-950 bg-clip-text text-transparent">
            मंडी व्यापार सिस्टम
          </h2>
          <p className="text-[10px] text-emerald-800 mt-1 font-black tracking-widest uppercase bg-emerald-50 inline-block px-2 py-0.5 rounded-md border border-emerald-100">
            BR TRADERS • कृषि मंडी आढ़त ledger
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="bg-red-50 text-red-700 p-3.5 rounded-xl text-xs font-bold mb-5 border border-red-200 flex items-center gap-2 shadow-sm">
            <span>❌</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-[10px] font-black text-stone-500 uppercase tracking-wider block pl-1">
              Username / Firm Name
            </label>
            <input 
              type="text" 
              name="username" 
              required 
              placeholder="Enter Name"
              value={formData.username}
              onChange={handleChange} 
              className="w-full mt-1 px-4 py-3 text-sm border border-stone-200 rounded-xl bg-stone-50/60 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-emerald-700 focus:bg-white font-bold transition-all duration-200 shadow-inner" 
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-stone-500 uppercase tracking-wider block pl-1">
              Secure Password
            </label>
            <input 
              type="password" 
              name="password" 
              required 
              placeholder="*****"
              value={formData.password}
              onChange={handleChange} 
              className="w-full mt-1 px-4 py-3 text-sm border border-stone-200 rounded-xl bg-stone-50/60 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-emerald-700 focus:bg-white font-bold transition-all duration-200 shadow-inner" 
            />
          </div>

          {/* Login Button */}
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`w-full bg-gradient-to-r from-emerald-800 via-emerald-900 to-stone-900 text-white py-3.5 rounded-xl text-sm font-black shadow-lg shadow-emerald-950/20 hover:shadow-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 border-b-4 border-emerald-950 ${isSubmitting ? 'opacity-80 cursor-wait' : 'hover:-translate-y-0.5 active:translate-y-0 active:border-b-0'}`}
          >
            {isSubmitting ? (
              <>🔄 Verified Ho Raha Hai...</>
            ) : (
              <>🌾 Mandi Portal Login</>
            )}
          </button>
        </form>

        {/* Small Trust Badge */}
        <div className="mt-8 text-center text-[10px] text-stone-400 font-bold tracking-wider uppercase border-t border-stone-100 pt-4 flex items-center justify-center gap-1">
          <span>🎯</span> Hisaab Saaf, Vyapaar Sahi!
        </div>

      </div>
    </div>
  );
}