import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ logOut }) {
  const location = useLocation();
  const linkClass = (path) => `px-4 py-2 rounded-lg font-semibold text-sm transition-all ${location.pathname === path ? 'bg-white text-emerald-950 shadow-sm' : 'text-emerald-100 hover:bg-emerald-700/50'}`;

  return (
    <nav className="bg-emerald-900 text-white px-6 py-4 shadow-lg border-b border-emerald-950">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌾</span>
          <h1 className="text-xl font-black tracking-tight">Mandi Vyapaar System</h1>
        </div>
        <div className="flex items-center gap-2 md:gap-4 flex-wrap">
          <Link to="/" className={linkClass('/')}>Dashboard</Link>
          <Link to="/purchases" className={linkClass('/purchases')}>Maal Aamad (Purchase)</Link>
          <Link to="/sales" className={linkClass('/sales')}>Bikri Record (Sales)</Link>
          
          {/* 👇 Ab yaha direct simple "Logout" likha hua aayega 👇 */}
          <button 
            onClick={logOut} 
            className="ml-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-all active:scale-95"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}