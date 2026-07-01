import React, { useState, useEffect } from 'react';

export default function Sales() {
  const [form, setForm] = useState({ buyerName: '', commodity: '', qtl: '', kg: '', gm: '', bagCount: '', ratePerQuintal: '', freightCharges: '', paymentStatus: 'Pending' });
  const [sales, setSales] = useState([]);
  const [stock, setStock] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchParty, setSearchParty] = useState('');

  const getSales = () => {
    fetch('http://localhost:5001/api/sales').then(res => res.json()).then(data => setSales(data));
  };

  const getStock = () => {
    fetch('http://localhost:5001/api/inventory/stock').then(res => res.json()).then(data => setStock(data));
  };

  useEffect(() => { getSales(); getStock(); }, []);

  const calculateTotalQuintals = () => {
    const q = Number(form.qtl || 0);
    const k = Number(form.kg || 0) / 100;
    const g = Number(form.gm || 0) / 100000;
    return q + k + g;
  };

  const getAvailableStockItem = (name) => {
    if (!name) return { totalQuantity: 0, totalBags: 0 };
    const item = stock.find(s => s.commodity.toLowerCase() === name.toLowerCase());
    return item ? { totalQuantity: item.totalQuantity, totalBags: item.totalBags || 0 } : { totalQuantity: 0, totalBags: 0 };
  };

  const totalQuintalsLive = calculateTotalQuintals();
  const stockItem = getAvailableStockItem(form.commodity);
  
  const isWeightShort = totalQuintalsLive > stockItem.totalQuantity;
  const isBagsShort = Number(form.bagCount || 0) > stockItem.totalBags;
  const cannotSubmit = isWeightShort || isBagsShort;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (totalQuintalsLive > stockItem.totalQuantity) {
      alert("Error: Godown me itna wazan nahi hai bhai!");
      return;
    }
    if (Number(form.bagCount) > stockItem.totalBags) {
      alert("Error: Godown me itni boriyan (bags) nahi bachi hain!");
      return;
    }

    const submissionData = {
      buyerName: form.buyerName,
      commodity: form.commodity,
      quantityQuintals: totalQuintalsLive.toFixed(5),
      bagCount: form.bagCount,
      ratePerQuintal: form.ratePerQuintal,
      freightCharges: form.freightCharges || '0',
      paymentStatus: form.paymentStatus
    };

    const res = await fetch('http://localhost:5001/api/sales/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submissionData)
    });
    if (res.ok) {
      alert("Sales Outward Invoice Created Successfully!");
      setForm({ buyerName: '', commodity: '', qtl: '', kg: '', gm: '', bagCount: '', ratePerQuintal: '', freightCharges: '', paymentStatus: 'Pending' });
      getSales();
      getStock();
    }
  };

  const handleApprovePayment = async (id, netBill, currentPaid = 0) => {
    const currentDue = netBill - currentPaid;
    const inputAmount = window.prompt(`Kul Bill: ₹${netBill.toFixed(2)}\nBaki Udhaari: ₹${currentDue.toFixed(2)}\n\nKitne rupaye mile? (Rupaye dalo):`);
    
    if (inputAmount === null) return; 
    const moneyReceived = Number(inputAmount);

    if (isNaN(moneyReceived) || moneyReceived <= 0) {
      alert("Sahi amount dalo bhai!");
      return;
    }

    if (moneyReceived > currentDue) {
      alert(`⚠️ Galti: Aap baki udhaari (₹${currentDue.toFixed(2)}) se zyada amount enter kar rhe ho!`);
      return;
    }

    const res = await fetch(`http://localhost:5001/api/sales/approve-payment/${id}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ moneyReceived })
    });

    if (res.ok) {
      alert("Hisaab khate me jod diya gaya hai!");
      getSales(); 
    } else {
      alert("Kuch gadbad hui bhai!");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bikri Entry delete karein? Isse stock wapas jud jayega.")) {
      const res = await fetch(`http://localhost:5001/api/sales/${id}`, { method: 'DELETE' });
      if (res.ok) { getSales(); getStock(); }
    }
  };

  const formatMandiWeight = (qtlDecimal) => {
    const qtl = Math.floor(qtlDecimal);
    const remainderKg = (qtlDecimal - qtl) * 100;
    const kg = Math.floor(remainderKg);
    const gm = Math.round((remainderKg - kg) * 1000);
    return `${qtl} Qtl ${kg} Kg ${gm} Gm`;
  };

  const handlePrint = (sale) => {
    const printWindow = window.open('', '_blank');
    const basePrice = sale.quantityQuintals * sale.ratePerQuintal;
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - BR TRADERS</title>
          <style>
            body { font-family: sans-serif; padding: 30px; color: #2d3748; }
            .bill-container { border: 1px solid #e2e8f0; padding: 30px; border-radius: 12px; max-width: 800px; margin: 0 auto; }
            .header-section { text-align: center; border-bottom: 2px solid #cbd5e1; padding-bottom: 15px; margin-bottom: 20px; }
            .logo-icon { font-size: 42px; }
            .firm-name { font-size: 32px; font-weight: 900; color: #065f46; margin: 0; }
            .bill-meta { display: flex; justify-content: space-between; margin: 20px 0; font-size: 14px; background: #f8fafc; padding: 12px 20px; border-radius: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #065f46; color: white; padding: 12px; text-align: left; }
            td { border-bottom: 1px solid #e2e8f0; padding: 14px 12px; }
            .text-right { text-align: right; }
            .total-row { font-size: 16px; font-weight: 800; background-color: #f8fafc; }
            .footer-note { margin-top: 40px; font-size: 11px; text-align: center; color: #94a3b8; border-top: 1px dashed #cbd5e1; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="bill-container">
            <div class="header-section">
              <div class="logo-icon">🌾</div>
              <h1 class="firm-name">BR TRADERS</h1>
              <p style="font-weight: bold; font-size: 12px; color: #64748b; text-transform: uppercase;">Galla Mandi, Commission Agent & Govt. Grain Supplier</p>
            </div>
            <div class="bill-meta">
              <div><strong>Party / Buyer Name:</strong> ${sale.buyerName.toUpperCase()}</div>
              <div><strong>Invoice Date:</strong> ${new Date(sale.date).toLocaleDateString('en-IN')}</div>
            </div>
            <table>
              <thead>
                <tr><th>Fasal</th><th>Wazan</th><th>Boriyan</th><th>Rate</th><th class="text-right">Base Value</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td style="font-weight:bold; color:#065f46;">${sale.commodity.toUpperCase()}</td>
                  <td style="font-weight:bold;">${formatMandiWeight(sale.quantityQuintals)}</td>
                  <td>${sale.bagCount} Bags</td>
                  <td>₹${sale.ratePerQuintal}</td>
                  <td class="text-right" style="font-weight:bold;">₹${basePrice.toFixed(2)}</td>
                </tr>
                <tr><td colspan="4" class="text-right" style="color:#64748b;">(+) Outward Freight:</td><td class="text-right" style="font-weight:bold;">₹${Number(sale.freightCharges || 0).toFixed(2)}</td></tr>
                <tr class="total-row"><td colspan="4" style="color:#065f46;">KUL LENA AMOUNT (NET):</td><td class="text-right" style="color:#065f46;">₹${sale.netBillAmount.toFixed(2)}</td></tr>
              </tbody>
            </table>
            <div class="footer-note"><p>Generated via Mandi Digital Ledger. Hisaab Saaf, Vyapaar Sahi!</p></div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredSales = sales.filter(s => {
    const matchesStatus = statusFilter === 'All' ? true : s.paymentStatus === statusFilter;
    const matchesParty = s.buyerName.toLowerCase().includes(searchParty.toLowerCase());
    return matchesStatus && matchesParty;
  });

  // 🌟 FIX 1: DYNAMIC CORRECTION - Pure filter logic me se paid part minus hoga real-time me
  const totalDuesOfFiltered = filteredSales
    .filter(s => s.paymentStatus === 'Pending')
    .reduce((sum, s) => {
      const jama = Number(s.amountPaid || 0);
      const baki = Number(s.netBillAmount || 0) - jama;
      return sum + baki;
    }, 0);

  const cropSalesTotal = totalQuintalsLive * Number(form.ratePerQuintal || 0);
  const netSalesTotal = cropSalesTotal + Number(form.freightCharges || 0);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
      {/* LEFT COLUMN: FORM */}
      <div className="xl:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-md border border-stone-200 h-fit">
          <h2 className="text-xl font-black text-stone-800 mb-4">🚛 Maal Bikri Form</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input type="text" placeholder="Buyer / Party Name" value={form.buyerName} onChange={e => setForm({ ...form, buyerName: e.target.value })} className="w-full p-2.5 border border-stone-300 rounded-lg text-sm" required />
            <input type="text" placeholder="Fasal Name" value={form.commodity} onChange={e => setForm({ ...form, commodity: e.target.value })} className="w-full p-2.5 border border-stone-300 rounded-lg text-sm" required />
            
            {form.commodity && (
              <div className="text-xs bg-stone-50 p-2.5 rounded-lg border border-stone-200 text-stone-600 space-y-0.5">
                <div>Stock Wazan: <span className="font-bold text-emerald-700">{formatMandiWeight(stockItem.totalQuantity)}</span></div>
                <div>Stock Boriyan: <span className="font-bold text-emerald-700">{stockItem.totalBags} Bags</span></div>
              </div>
            )}

            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-2">
              <label className="text-xs font-black text-stone-600 block uppercase tracking-wider">⚖️ Kitna Maal Becha (Weight):</label>
              <div className="grid grid-cols-3 gap-1.5">
                <input type="number" placeholder="Qtl" value={form.qtl} onChange={e => setForm({ ...form, qtl: e.target.value })} className={`w-full p-2 border rounded-lg text-xs text-center font-bold ${isWeightShort ? 'border-red-500 bg-red-50 text-red-700' : 'border-stone-300'}`} />
                <input type="number" placeholder="Kg" max="99" value={form.kg} onChange={e => setForm({ ...form, kg: e.target.value })} className={`w-full p-2 border rounded-lg text-xs text-center font-bold ${isWeightShort ? 'border-red-500 bg-red-50 text-red-700' : 'border-stone-300'}`} />
                <input type="number" placeholder="Gm" max="999" value={form.gm} onChange={e => setForm({ ...form, gm: e.target.value })} className={`w-full p-2 border rounded-lg text-xs text-center font-bold ${isWeightShort ? 'border-red-500 bg-red-50 text-red-700' : 'border-stone-300'}`} />
              </div>
            </div>

            <div>
              <input type="number" placeholder="Bags Count" value={form.bagCount} onChange={e => setForm({ ...form, bagCount: e.target.value })} className={`w-full p-2.5 border rounded-lg text-sm font-bold ${isBagsShort ? 'border-red-500 bg-red-50 text-red-700' : 'border-stone-300'}`} required />
            </div>
            
            {isWeightShort && <p className="text-xs text-red-600 font-bold bg-red-100 p-2 rounded">⚠️ Godown me itna wazan nahi hai!</p>}
            {isBagsShort && <p className="text-xs text-red-600 font-bold bg-red-100 p-2 rounded">⚠️ Godown me itni boriyan nahi hain!</p>}

            <input type="number" placeholder="Selling Rate" value={form.ratePerQuintal} onChange={e => setForm({ ...form, ratePerQuintal: e.target.value })} className="w-full p-2.5 border border-stone-300 rounded-lg text-sm" required />
            <input type="number" placeholder="Outward Bhada" value={form.freightCharges} onChange={e => setForm({ ...form, freightCharges: e.target.value })} className="w-full p-2.5 border border-stone-300 rounded-lg text-sm bg-white" />
            
            <select value={form.paymentStatus} onChange={e => setForm({ ...form, paymentStatus: e.target.value })} className="w-full p-2.5 border border-stone-300 rounded-lg text-sm font-bold bg-white">
              <option value="Pending">Udhaar (Pending)</option>
              <option value="Paid">Nokad (Paid)</option>
            </select>
            
            <button type="submit" disabled={cannotSubmit} className={`w-full py-3 rounded-lg font-bold text-sm shadow-md transition ${cannotSubmit ? 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none' : 'bg-amber-700 text-white hover:bg-amber-800'}`}>Bill Outward Karein</button>
          </form>
        </div>

        <div className="bg-gradient-to-br from-stone-900 to-stone-950 text-white p-5 rounded-2xl shadow-lg border border-stone-800 space-y-2">
          <h3 className="text-sm font-black text-amber-400 uppercase">🔍 Live Outward Preview</h3>
          <div className="text-xs text-stone-400">Total: <span className="text-amber-400 font-bold">{totalQuintalsLive.toFixed(3)} Qtl</span></div>
          <div className="flex justify-between text-sm"><span>Fasal Value:</span><span>₹{cropSalesTotal.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm text-stone-300 border-b border-stone-800 pb-2"><span>(+) Bhada:</span><span>₹{Number(form.freightCharges || 0).toFixed(2)}</span></div>
          <div className="flex justify-between items-center pt-1"><span className="text-sm font-bold text-amber-400">Net Value:</span><span className="text-xl font-black">₹{netSalesTotal.toFixed(2)}</span></div>
        </div>
      </div>

      {/* RIGHT COLUMN: TABLE BREAKDOWN */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-stone-200 xl:col-span-3 overflow-hidden h-fit space-y-4">
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex justify-between items-center shadow-sm">
          <div>
            <h4 className="text-xs font-black text-red-800 uppercase tracking-wider">💸 Kul Udhaari Recovery</h4>
          </div>
          <div className="text-xl font-black text-red-700 bg-white px-4 py-2 rounded-lg border border-red-200">₹{totalDuesOfFiltered.toFixed(2)}</div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-3">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <h2 className="text-xl font-black text-stone-800 whitespace-nowrap">📋 Bikri Ledger</h2>
            <input type="text" placeholder="🔍 Search Party..." value={searchParty} onChange={e => setSearchParty(e.target.value)} className="p-2 border rounded-lg text-xs w-full max-w-xs bg-stone-50" />
          </div>
          <div className="flex bg-stone-100 p-1 rounded-lg border text-xs font-bold">
            <button onClick={() => setStatusFilter('All')} className={`px-3 py-1.5 rounded-md transition ${statusFilter === 'All' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500'}`}>Sab Record</button>
            <button onClick={() => setStatusFilter('Pending')} className={`px-3 py-1.5 rounded-md transition ${statusFilter === 'Pending' ? 'bg-red-600 text-white shadow-sm' : 'text-stone-500'}`}>Udhaari Khata</button>
            <button onClick={() => setStatusFilter('Paid')} className={`px-3 py-1.5 rounded-md transition ${statusFilter === 'Paid' ? 'bg-emerald-600 text-white shadow-sm' : 'text-stone-500'}`}>Rokad Cash</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b bg-stone-50 text-stone-600 font-bold">
                <th className="p-3">Buyer / Tareeq</th>
                <th className="p-3">Fasal</th>
                <th className="p-3">Wazan Breakdown</th>
                <th className="p-3">Fasal Price</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-amber-900">Net Bill</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map(s => {
                const baseSalesPrice = Number(s.quantityQuintals) * Number(s.ratePerQuintal);
                
                // 🌟 FIX 2: RE-BINDING REAL VALUE FROM STATE 
                const jamaPaisa = Number(s.amountPaid || 0);
                const bakiPaisa = Number(s.netBillAmount || 0) - jamaPaisa;

                return (
                  <tr key={s._id} className="border-b hover:bg-stone-50/80 transition">
                    <td className="p-3">
                      <div className="text-xs text-stone-400">{new Date(s.date).toLocaleDateString('en-IN')}</div>
                      <div className="font-medium text-stone-800">{s.buyerName}</div>
                    </td>
                    <td className="p-3 uppercase text-amber-800 font-bold">{s.commodity}</td>
                    <td className="p-3 font-bold text-stone-700 whitespace-nowrap">{formatMandiWeight(s.quantityQuintals)}</td>
                    <td className="p-3 text-stone-600">
                      <div className="font-bold text-stone-800">₹{baseSalesPrice.toFixed(2)}</div>
                      <div className="text-xs text-stone-400">{s.quantityQuintals} Qtl @ ₹{s.ratePerQuintal}</div>
                    </td>
                    
                    {/* 🌟 FIX 3: DYNAMIC DUAL CARD STATE */}
                    <td className="p-3">
                      {s.paymentStatus === 'Paid' ? (
                        <span className="px-2.5 py-1 text-xs font-extrabold rounded-full bg-green-100 text-green-800">Nokad (Paid)</span>
                      ) : (
                        <div className="space-y-1">
                          <span className="px-2.5 py-1 text-xs font-extrabold rounded-full bg-red-100 text-red-800">Udhaar</span>
                          <div className="text-[10px] text-stone-500 font-bold">
                            <div>Jama: ₹{jamaPaisa.toFixed(0)}</div>
                            <div className="text-red-600">Baki: ₹{bakiPaisa.toFixed(0)}</div>
                          </div>
                        </div>
                      )}
                    </td>

                    <td className="p-3 font-black text-amber-800 text-base">₹{s.netBillAmount.toFixed(2)}</td>
                    <td className="p-3 text-center space-x-2 whitespace-nowrap">
                      
                      {s.paymentStatus === 'Pending' && (
                        <button 
                          onClick={() => handleApprovePayment(s._id, s.netBillAmount, jamaPaisa)} 
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-md text-xs font-black transition shadow-sm border border-emerald-700"
                        >
                          Received ₹
                        </button>
                      )}

                      <button onClick={() => handlePrint(s)} className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md text-xs font-bold transition shadow-sm border border-blue-200">Print 🖨️</button>
                      <button onClick={() => handleDelete(s._id)} className="bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1 rounded-md text-xs font-bold transition shadow-sm border border-red-100">Delete</button>
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