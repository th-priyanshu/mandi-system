import React, { useState, useEffect } from 'react';

export default function Purchases() {
  const [form, setForm] = useState({ sellerName: '', commodity: '', qtl: '', kg: '', gm: '', bagCount: '', ratePerQuintal: '', mandiTax: '', laborCharges: '', freightCharges: '' });
  const [purchases, setPurchases] = useState([]);
  const [searchDate, setSearchDate] = useState('');

  // 🟢 FIXED: Clean single secure HTTPS link for fetching
  const getPurchases = () => {
    fetch('https://mandi-system.onrender.com/api/purchases')
      .then(res => res.json())
      .then(data => setPurchases(data))
      .catch(err => console.error("Error fetching purchases:", err));
  };

  useEffect(() => { getPurchases(); }, []);

  const calculateTotalQuintals = () => {
    const q = Number(form.qtl || 0);
    const k = Number(form.kg || 0) / 100;
    const g = Number(form.gm || 0) / 100000;
    return q + k + g;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalQuantity = calculateTotalQuintals();
    
    if (finalQuantity <= 0) {
      alert("Error: Wazan 0 se zyaada hona chahiye bhai!");
      return;
    }

    const submissionData = {
      sellerName: form.sellerName,
      commodity: form.commodity,
      quantityQuintals: finalQuantity.toFixed(5),
      bagCount: form.bagCount,
      ratePerQuintal: form.ratePerQuintal,
      mandiTax: form.mandiTax || 0,
      laborCharges: form.laborCharges || 0,
      freightCharges: form.freightCharges || 0
    };

    // 🟢 FIXED: Clean single secure POST endpoint matched with backend
    const res = await fetch('https://mandi-system.onrender.com/api/purchases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submissionData)
    });
    
    if (res.ok) {
      alert("Purchase Record Saved Successfully!");
      setForm({ sellerName: '', commodity: '', qtl: '', kg: '', gm: '', bagCount: '', ratePerQuintal: '', mandiTax: '', laborCharges: '', freightCharges: '' });
      getPurchases();
    } else {
      alert("Server error: Entry save nahi ho payi bhai!");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Cyber system se ye khareedi delete karein?")) {
      // 🟢 FIXED: Clean single secure DELETE endpoint
      const res = await fetch(`https://mandi-system.onrender.com/api/purchases/${id}`, { method: 'DELETE' });
      if (res.ok) { getPurchases(); }
    }
  };

  const filteredPurchases = purchases.filter(p => {
    if (!searchDate) return true;
    return new Date(p.date).toISOString().split('T')[0] === searchDate;
  });

  const totalQuintalsLive = calculateTotalQuintals();
  const cropTotal = totalQuintalsLive * Number(form.ratePerQuintal || 0);
  const extraCharges = Number(form.mandiTax || 0) + Number(form.laborCharges || 0) + Number(form.freightCharges || 0);
  const netTotal = cropTotal + extraCharges;

  const formatMandiWeight = (qtlDecimal) => {
    const qtl = Math.floor(qtlDecimal);
    const remainderKg = (qtlDecimal - qtl) * 100;
    const kg = Math.floor(remainderKg);
    const gm = Math.round((remainderKg - kg) * 1000);
    return `${qtl} Qtl ${kg} Kg ${gm} Gm`;
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
      <div className="xl:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-md border border-stone-200 h-fit">
          <h2 className="text-xl font-black text-stone-800 mb-4 flex items-center gap-1">🌾 Nayi Aamad Form</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input type="text" placeholder="Kisaan / Seller Name" value={form.sellerName} onChange={e => setForm({ ...form, sellerName: e.target.value })} className="w-full p-2.5 border border-stone-300 rounded-lg text-sm" required />
            <input type="text" placeholder="Fasal Ka Naam" value={form.commodity} onChange={e => setForm({ ...form, commodity: e.target.value })} className="w-full p-2.5 border border-stone-300 rounded-lg text-sm" required />
            
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-2">
              <label className="text-xs font-black text-stone-600 block uppercase tracking-wider">⚖️ Kul Wazan (Split Entry):</label>
              <div className="grid grid-cols-3 gap-1.5">
                <div>
                  <input type="number" placeholder="Qtl" value={form.qtl} onChange={e => setForm({ ...form, qtl: e.target.value })} className="w-full p-2 border border-stone-300 rounded-lg text-xs text-center font-bold" />
                  <span className="text-[10px] text-stone-400 text-center block mt-0.5">Quintal</span>
                </div>
                <div>
                  <input type="number" placeholder="Kg" max="99" value={form.kg} onChange={e => setForm({ ...form, kg: e.target.value })} className="w-full p-2 border border-stone-300 rounded-lg text-xs text-center font-bold" />
                  <span className="text-[10px] text-stone-400 text-center block mt-0.5">Kilo</span>
                </div>
                <div>
                  <input type="number" placeholder="Gm" max="999" value={form.gm} onChange={e => setForm({ ...form, gm: e.target.value })} className="w-full p-2 border border-stone-300 rounded-lg text-xs text-center font-bold" />
                  <span className="text-[10px] text-stone-400 text-center block mt-0.5">Gram</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <input type="number" placeholder="Bori / Bag Count" value={form.bagCount} onChange={e => setForm({ ...form, bagCount: e.target.value })} className="w-full p-2.5 border border-stone-300 rounded-lg text-sm" required />
            </div>
            <input type="number" placeholder="Rate (Per Quintal)" value={form.ratePerQuintal} onChange={e => setForm({ ...form, ratePerQuintal: e.target.value })} className="w-full p-2.5 border border-stone-300 rounded-lg text-sm" required />
            
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-2">
              <input type="number" placeholder="Mandi Tax (₹)" value={form.mandiTax} onChange={e => setForm({ ...form, mandiTax: e.target.value })} className="w-full p-2.5 border border-stone-300 rounded-lg text-sm bg-white" />
              <input type="number" placeholder="Labor / Palledari (₹)" value={form.laborCharges} onChange={e => setForm({ ...form, laborCharges: e.target.value })} className="w-full p-2.5 border border-stone-300 rounded-lg text-sm bg-white" />
              <input type="number" placeholder="Bhada / Freight (₹)" value={form.freightCharges} onChange={e => setForm({ ...form, freightCharges: e.target.value })} className="w-full p-2.5 border border-stone-300 rounded-lg text-sm bg-white" />
            </div>
            <button className="w-full bg-emerald-800 text-white py-3 rounded-lg font-bold hover:bg-emerald-950 transition text-sm">Stock Inward Karein</button>
          </form>
        </div>

        <div className="bg-gradient-to-br from-stone-900 to-stone-950 text-white p-5 rounded-2xl shadow-lg border border-stone-800 space-y-2">
          <h3 className="text-sm font-black text-emerald-400 uppercase">🔍 Live Bill Breakdown</h3>
          <div className="text-xs text-stone-400">Total Weight: <span className="text-amber-400 font-bold">{totalQuintalsLive.toFixed(3)} Qtl</span></div>
          <div className="flex justify-between text-sm"><span>Fasal Price:</span><span>₹{cropTotal.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm text-stone-300 border-b border-stone-800 pb-2"><span>(+) Charges:</span><span>₹{extraCharges.toFixed(2)}</span></div>
          <div className="flex justify-between items-center pt-1"><span className="text-sm font-bold text-emerald-400">Kul Net:</span><span className="text-xl font-black">₹{netTotal.toFixed(2)}</span></div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-md border border-stone-200 xl:col-span-3 overflow-hidden h-fit space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-3">
          <h2 className="text-xl font-black text-stone-800">📋 Full Aamad Ledger Breakdown</h2>
          <div className="flex items-center gap-2">
            <input type="date" value={searchDate} onChange={e => setSearchDate(e.target.value)} className="p-2 border rounded-lg text-sm bg-stone-50" />
            {searchDate && <button onClick={() => setSearchDate('')} className="text-xs text-red-600 font-bold underline">Clear</button>}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b bg-stone-50 text-stone-600 font-bold">
                <th className="p-3">Tareeq / Seller</th>
                <th className="p-3">Fasal</th>
                <th className="p-3">Wazan Breakdown</th>
                <th className="p-3">Fasal Price</th>
                <th className="p-3 text-red-700">Charges</th>
                <th className="p-3 text-emerald-900">Kul Amount</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.map(p => {
                const baseCropPrice = Number(p.quantityQuintals) * Number(p.ratePerQuintal);
                const amt = p.totalAmount ? p.totalAmount : (baseCropPrice + Number(p.mandiTax || 0) + Number(p.laborCharges || 0) + Number(p.freightCharges || 0));
                return (
                  <tr key={p._id} className="border-b hover:bg-stone-50/80 transition">
                    <td className="p-3">
                      <div className="text-xs text-stone-400">{new Date(p.date).toLocaleDateString('en-IN')}</div>
                      <div className="font-medium text-stone-800">{p.sellerName}</div>
                    </td>
                    <td className="p-3 uppercase text-emerald-800 font-bold">{p.commodity}</td>
                    <td className="p-3 font-bold text-stone-700 whitespace-nowrap">{formatMandiWeight(p.quantityQuintals)}</td>
                    <td className="p-3">
                      <div className="font-bold text-stone-800">₹{baseCropPrice.toFixed(2)}</div>
                      <div className="text-xs text-stone-400">{p.quantityQuintals} Qtl @ ₹{p.ratePerQuintal}</div>
                    </td>
                    <td className="p-3 text-xs text-stone-500">
                      <div>Tax: ₹{p.mandiTax || 0} | Lab: ₹{p.laborCharges || 0} | Bhd: ₹{p.freightCharges || 0}</div>
                    </td>
                    <td className="p-3 font-black text-emerald-800 text-base">₹{amt.toFixed(2)}</td>
                    <td className="p-3 text-center">
                      <button onClick={() => handleDelete(p._id)} className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-md text-xs font-bold transition">Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}