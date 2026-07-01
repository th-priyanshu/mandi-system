const mongoose = require('mongoose');

const PurchaseSchema = new mongoose.Schema({
    sellerName: { type: String, required: true },
    commodity: { type: String, required: true },
    quantityQuintals: { type: Number, required: true },
    bagCount: { type: Number, required: true },
    ratePerQuintal: { type: Number, required: true },
    mandiTax: { type: Number, default: 0 },
    laborCharges: { type: Number, default: 0 },
    freightCharges: { type: Number, default: 0 }, // Bhada option added
    totalAmount: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Purchase', PurchaseSchema);