const mongoose = require('mongoose');

const salesSchema = new mongoose.Schema({
    buyerName: { type: String, required: true },
    commodity: { type: String, required: true },
    quantityQuintals: { type: Number, required: true },
    bagCount: { type: Number, required: true },
    ratePerQuintal: { type: Number, required: true },
    freightCharges: { type: Number, default: 0 },
    netBillAmount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['Paid', 'Pending'], default: 'Pending' },
    
    // 🌟 ZAROORI FIELDS: Inke bina database partial amount ko save nahi karega
    amountPaid: { type: Number, default: 0 },
    amountDue: { type: Number, default: 0 },
    
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Sales', salesSchema);