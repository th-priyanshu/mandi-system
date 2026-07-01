import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Purchases from './pages/Purchases'; 
import Sales from './pages/Sales'; 
import Auth from './pages/Auth'; // Aapka simple username-password wala component

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check karo ki browser memory mein login token pehle se h ya nahi
    const token = localStorage.getItem('mandiToken');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('mandiToken');
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100 font-bold text-stone-500">
        🔄 Mandi System Boot Ho Raha Hai...
      </div>
    );
  }

  // 🔐 AGAR LOGGED IN NAHI HAI TOH DIRECT SIMPLE LOGIN SCREEN DIKHAO
  if (!isAuthenticated) {
    return <Auth onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  // 🔓 LOGIN HONE KE BAAD KA APKA ORIGINAL TABS LAYOUT
  return (
    <div className="min-h-screen bg-stone-50">
      
      {/* 🟢 TOP ORIGINAL NAVIGATION TABS */}
      <nav className="bg-emerald-900 text-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-2" onClick={() => setActiveTab('dashboard')}>
          <span className="text-xl">🌾</span>
          <h1 className="text-lg font-black tracking-tight cursor-pointer">Mandi Vyapaar System</h1>
        </div>
        
        <div className="hidden md:flex items-center gap-6 text-xs font-bold">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`px-4 py-2 rounded-lg font-black transition-all cursor-pointer ${activeTab === 'dashboard' ? 'bg-white text-emerald-900 shadow' : 'hover:text-amber-400'}`}
          >
            Dashboard
          </button>
          
          <button 
            onClick={() => setActiveTab('purchases')} 
            className={`px-4 py-2 rounded-lg font-black transition-all cursor-pointer ${activeTab === 'purchases' ? 'bg-white text-emerald-900 shadow' : 'hover:text-amber-400'}`}
          >
            Maal Aamad (Purchase)
          </button>
          
          <button 
            onClick={() => setActiveTab('sales')} 
            className={`px-4 py-2 rounded-lg font-black transition-all cursor-pointer ${activeTab === 'sales' ? 'bg-white text-emerald-900 shadow' : 'hover:text-amber-400'}`}
          >
            Bikri Record (Sales)
          </button>
        </div>

        <button 
          onClick={handleLogout} 
          className="bg-red-600 hover:bg-red-700 text-xs font-black px-4 py-2 rounded-lg shadow transition-all cursor-pointer"
        >
          Logout
        </button>
      </nav>
      
      {/* SWITCHING CONTENT BLOCK */}
      <div className="p-6 max-w-7xl mx-auto">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'purchases' && <Purchases />}
        {activeTab === 'sales' && <Sales />}
      </div>
    </div>
  );
}