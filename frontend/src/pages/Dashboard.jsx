import React, { useState, useEffect, useCallback } from 'react';

export default function Dashboard() {
  const [stock, setStock] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [liveMarketRates, setLiveMarketRates] = useState([]); 
  const [searchCrop, setSearchCrop] = useState('');
  const [loadingRates, setLoadingRates] = useState(true);

  // 🔄 PURE UNTRACKED RE-FETCH SYSTEM (Direct Database Hit)
  const syncEverythingWithDatabase = useCallback(async () => {
    try {
      // 1. Stock Sync
      const stockRes = await fetch('https://mandi-system.onrender.com/api/inventory/stock');
      if (stockRes.ok) {
        const stockData = await stockRes.json();
        setStock(Array.isArray(stockData) ? stockData : []);
      }

      // 2. Purchases Sync
      const purchaseRes = await fetch('https://mandi-system.onrender.comhttps://mandi-system.onrender.com/api/purchases/add');
      if (purchaseRes.ok) {
        const purchaseData = await purchaseRes.json();
        setPurchases(Array.isArray(purchaseData) ? purchaseData : []);
      }

      // 3. Sales Sync
      const salesRes = await fetch('https://mandi-system.onrender.comhttps://mandi-system.onrender.com/api/sales/add');
      if (salesRes.ok) {
        const salesData = await salesRes.json();
        setSales(Array.isArray(salesData) ? salesData : []);
      }
    } catch (err) {
      console.error("Sync error:", err);
    }
  }, []);

  useEffect(() => {
    // Live Market Setup
    fetch ('https://mandi-system.onrender.com/api/live-mandi-rates')
      .then(res => res.json())
      .then(data => { 
        setLiveMarketRates(Array.isArray(data) ? data : []); 
        setLoadingRates(false); 
      })
      .catch(() => {
        setLiveMarketRates([]);
        setLoadingRates(false);
      });

    // Pehle initial load
    syncEverythingWithDatabase();

    // 🌟 FAST ENGINE: Har 1 second me state refresh matrix force karega
    const coreInterval = setInterval(() => {
      syncEverythingWithDatabase();
    }, 1000);

    return () => clearInterval(coreInterval);
  }, [syncEverythingWithDatabase]);

  // 🧮 LIVE RENDERING MATH (Dynamic Ledger Calculations)
  const totalIn = purchases.reduce((sum, p) => sum + (Number(p.totalAmount) || 0), 0);
  const totalOut = sales.reduce((sum, s) => sum + (Number(s.netBillAmount) || 0), 0);
  
  // 🌟 SATEEK FIX: Kul bill me se jama raqam minus karke asli baki udhaari nikalega dashboard ke liye
  const pendingSales = sales.reduce((sum, s) => {
    const jama = Number(s.amountPaid || (s.paymentStatus === 'Paid' ? s.netBillAmount : 0));
    const baki = Number(s.netBillAmount || 0) - jama;
    return sum + baki;
  }, 0);

  const netProfitLoss = totalOut - totalIn;

  const filteredRates = liveMarketRates.filter(rate => 
    rate.commodity?.toLowerCase().includes(searchCrop.toLowerCase())
  );

  return (
    <div className="space-y-8">
      
      {/* 📡 LIVE MANDI PRICES DISPLAY */}
      {!loadingRates && liveMarketRates.length > 0 && (
        <div className="bg-gradient-to-r from-stone-900 via-emerald-950 to-stone-900 text-white p-6 rounded-2xl shadow-lg border border-emerald-900/60 transition-all duration-300">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-emerald-800/60 pb-4 mb-4 gap-4">
            <div>
              <h2 className="text-xl font-black text-amber-400 flex items-center gap-2">
                🏢 मैनपूरी मंडी - आज का असली चालू भाव (Official Prices)
              </h2>
              <p className="text-xs text-emerald-200 mt-0.5">Aalo ke liye katta-mann aur baaki sabhi faslon ke liye shuddh Quintal rate tracker</p>
            </div>
            <div className="w-full md:w-auto relative">
              <input 
                type="text" 
                placeholder="Fasal ka naam dalo..." 
                value={searchCrop}
                onChange={e => setSearchCrop(e.target.value)}
                className="p-2.5 rounded-lg text-xs bg-stone-900 border border-emerald-700 text-white placeholder-stone-400 focus:outline-none focus:border-amber-400 w-full md:w-60 font-bold shadow-inner"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {filteredRates.map((rate, index) => {
              const isPotato = rate.commodity?.toLowerCase().includes('potato') || rate.commodity?.includes('आलू');
              return (
                <div key={index} className="bg-stone-950/90 border border-stone-800 p-4 rounded-xl flex flex-col justify-between shadow-md">
                  <div>
                    <span className="text-[10px] bg-emerald-900/50 text-emerald-300 px-2 py-0.5 rounded font-bold">📍 {rate.market}</span>
                    <p className="text-sm font-black text-white mt-2 uppercase tracking-wide border-b border-stone-800 pb-1.5">{rate.commodity}</p>
                    {isPotato ? (
                      <div className="mt-3 space-y-2">
                        <div className="bg-stone-900 p-2.5 rounded-lg flex justify-between items-center border border-stone-800/40">
                          <span className="text-[11px] text-stone-400 font-bold">प्रति कट्टा (50 Kg):</span>
                          <p className="text-base font-black text-amber-400">₹{rate.localPrice50Kg}</p>
                        </div>
                        <div className="bg-stone-900 p-2.5 rounded-lg flex justify-between items-center border border-stone-800/40">
                          <span className="text-[11px] text-stone-400 font-bold">प्रति मन (40 Kg):</span>
                          <p className="text-sm font-black text-emerald-400">₹{rate.localPrice40Kg}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 bg-stone-900 p-4 rounded-lg text-center border border-stone-800/40">
                        <span className="text-[10px] text-stone-400 block font-bold mb-1">मंडी भाव</span>
                        <p className="text-xl font-black text-amber-400">₹{rate.quintalPrice} <span className="text-xs font-normal text-stone-400">/ Qtl</span></p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 📊 FINANCIAL ANALYTICS */}
      <div>
        <h2 className="text-xl font-black text-stone-900 tracking-tight mb-4">📊 Mandi Vyapaar Nafa-Nuksaan Aakde</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
            <p className="text-xs font-bold text-stone-400 uppercase">KUL KHAREEDI (INWARD)</p>
            <p className="text-2xl font-black text-red-600 mt-1">₹{totalIn.toFixed(2)}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
            <p className="text-xs font-bold text-stone-400 uppercase">KUL BIKRI (OUTWARD)</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">₹{totalOut.toFixed(2)}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
            <p className="text-xs font-bold text-stone-400 uppercase">UDHAARI (PENDING RECOVERY)</p>
            <p className="text-2xl font-black text-amber-600 mt-1">₹{pendingSales.toFixed(2)}</p>
          </div>
          <div className={`p-5 rounded-xl border shadow-sm ${netProfitLoss >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
            <p className="text-xs font-bold text-stone-500 uppercase">NET MUNAFA / NAFA</p>
            <p className={`text-2xl font-black ${netProfitLoss >= 0 ? 'text-emerald-700' : 'text-red-700'} mt-1`}>
              ₹{netProfitLoss.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* 📈 STOCK BREAKDOWN */}
      <div>
        <h2 className="text-xl font-black text-stone-900 tracking-tight mb-4">📈 Live Godown Stock Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stock.map((item) => (
            <div key={item._id} className="bg-white p-6 rounded-2xl shadow-md border border-stone-200 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black uppercase tracking-wide text-emerald-800 bg-emerald-50 px-3 py-1 rounded-md">{item.commodity}</h3>
                <span className="text-lg">📦</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                  <p className="text-xs text-stone-400 uppercase font-bold">NET WEIGHT</p>
                  <p className="text-lg font-black text-stone-800 mt-1">{Number(item.totalQuantity || 0).toFixed(2)} <span className="text-xs font-normal text-stone-500">Qtl</span></p>
                </div>
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                  <p className="text-xs text-stone-400 uppercase font-bold">BORIYAN COUNT</p>
                  <p className="text-lg font-black text-stone-700 mt-1">{item.totalBags || 0} <span className="text-xs font-normal text-stone-500">Bags</span></p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}