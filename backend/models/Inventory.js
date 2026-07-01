const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
    commodity: { type: String, required: true, unique: true },
    totalQuantity: { type: Number, default: 0 },
    totalBags: { type: Number, default: 0 }
});

module.exports = mongoose.model('Inventory', InventorySchema);