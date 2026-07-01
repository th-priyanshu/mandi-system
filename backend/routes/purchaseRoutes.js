const express = require('express');
const router = express.Router();
const Purchase = require('../models/Purchase');
const Inventory = require('../models/Inventory');

// 🛒 1. NAYI KHAREEDI SAVE KARNA + STOCK SHUDDH DYNAMIC UPDATE
router.post('/add', async (req, res) => {
    try {
        const { sellerName, commodity, quantityQuintals, bagCount, ratePerQuintal, freightCharges, paymentStatus } = req.body;
        
        const cropValue = Number(quantityQuintals) * Number(ratePerQuintal);
        const totalAmount = cropValue + Number(freightCharges || 0);

        const newPurchase = new Purchase({
            sellerName,
            commodity,
            quantityQuintals: Number(quantityQuintals),
            bagCount: Number(bagCount),
            ratePerQuintal: Number(ratePerQuintal),
            freightCharges: Number(freightCharges || 0),
            paymentStatus,
            totalAmount,
            date: new Date()
        });
        await newPurchase.save();

        // 🌟 EXACT NAME COUPLING: Strict Capitalization use karenge taaki duplicate dynamic cards na banein
        const formattedName = commodity.trim().toUpperCase();

        await Inventory.findOneAndUpdate(
            { commodity: formattedName },
            { 
                $inc: { 
                    totalQuantity: Number(quantityQuintals), 
                    totalBags: Number(bagCount) 
                } 
            },
            { upsert: true, new: true }
        );

        res.status(201).json(newPurchase);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 📊 2. KUL KHAREEDI UTHANA
router.get('/', async (req, res) => {
    try {
        const purchases = await Purchase.find().sort({ date: -1 });
        res.json(purchases);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🗑️ 3. KHAREEDI RECORD DELETE KARNA + EXACT STOCK SUBTRACTION
router.delete('/:id', async (req, res) => {
    try {
        const purchaseId = req.params.id;
        const purchaseEntry = await Purchase.findById(purchaseId);
        
        if (!purchaseEntry) {
            return res.status(404).json({ message: "Khareedi entry nahi mili bhai!" });
        }

        const formattedName = purchaseEntry.commodity.trim().toUpperCase();

        // Delete hone par stock se exact minus karo
        await Inventory.findOneAndUpdate(
            { commodity: formattedName },
            { 
                $inc: { 
                    totalQuantity: -Number(purchaseEntry.quantityQuintals), 
                    totalBags: -Number(purchaseEntry.bagCount) 
                } 
            }
        );

        await Purchase.findByIdAndDelete(purchaseId);
        res.json({ message: "Purchase Entry Deleted Successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;