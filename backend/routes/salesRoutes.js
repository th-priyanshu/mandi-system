const express = require('express');
const router = express.Router();
const Sales = require('../models/Sales');
const Inventory = require('../models/Inventory');

// 🛒 1. BIKRI RECORD SAVE KARNA + STOCK ADJUSTMENT
router.post('/add', async (req, res) => {
    try {
        const { buyerName, commodity, quantityQuintals, bagCount, ratePerQuintal, freightCharges, paymentStatus } = req.body;
        
        const cropValue = Number(quantityQuintals) * Number(ratePerQuintal);
        const netBillAmount = cropValue + Number(freightCharges || 0);
        const formattedName = commodity.trim().toUpperCase();

        // Check karo ki Godown me utna stock hai bhi ya nahi
        const stockItem = await Inventory.findOne({ commodity: formattedName });
        if (!stockItem || stockItem.totalQuantity < Number(quantityQuintals)) {
            return res.status(400).json({ message: "Error: Godown me itna maal nahi hai bhai!" });
        }

        const newSale = new Sales({
            buyerName,
            commodity,
            quantityQuintals: Number(quantityQuintals),
            bagCount: Number(bagCount),
            ratePerQuintal: Number(ratePerQuintal),
            freightCharges: Number(freightCharges || 0),
            paymentStatus,
            netBillAmount,
            date: new Date()
        });
        await newSale.save();

        // Becha hai toh stock se minus karo
        await Inventory.findOneAndUpdate(
            { commodity: formattedName },
            { 
                $inc: { 
                    totalQuantity: -Number(quantityQuintals), 
                    totalBags: -Number(bagCount) 
                } 
            }
        );

        res.status(201).json(newSale);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 📊 2. KUL BIKRI UTHANA
router.get('/', async (req, res) => {
    try {
        const sales = await Sales.find().sort({ date: -1 });
        res.json(sales);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🗑️ 3. BIKRI RECORD DELETE KARNA + STOCK RESTORATION
router.delete('/:id', async (req, res) => {
    try {
        const saleId = req.params.id;
        const saleEntry = await Sales.findById(saleId);
        
        if (!saleEntry) {
            return res.status(404).json({ message: "Bikri entry nahi mili bhai!" });
        }

        const formattedName = saleEntry.commodity.trim().toUpperCase();

        // Delete hone par stock me wapas plus karo
        await Inventory.findOneAndUpdate(
            { commodity: formattedName },
            { 
                $inc: { 
                    totalQuantity: Number(saleEntry.quantityQuintals), 
                    totalBags: Number(saleEntry.bagCount) 
                } 
            }
        );

        await Sales.findByIdAndDelete(saleId);
        res.json({ message: "Bikri Entry Deleted & Stock Restored Successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 💳 4. UDHAARI PARTIAL YA FULL PAYMENT RECORD KARNA
router.patch('/approve-payment/:id', async (req, res) => {
    try {
        const saleId = req.params.id;
        const { moneyReceived } = req.body; 

        const saleEntry = await Sales.findById(saleId);
        if (!saleEntry) {
            return res.status(404).json({ message: "Bikri entry nahi mili bhai!" });
        }

        const totalBill = Number(saleEntry.netBillAmount || 0);
        
        // Purane jama me naya mila paisa jodo
        const currentPaid = Number(saleEntry.amountPaid || 0) + Number(moneyReceived);
        const newDue = totalBill - currentPaid;
        const newStatus = newDue <= 0 ? 'Paid' : 'Pending';

        const updatedSale = await Sales.findByIdAndUpdate(
            saleId,
            { 
                $set: { 
                    amountPaid: currentPaid,
                    amountDue: newDue < 0 ? 0 : newDue,
                    paymentStatus: newStatus
                } 
            },
            { new: true, runValidators: false } // runValidators false rakhenge taaki strict locks na aayein
        );

        return res.status(200).json({ message: "Hisaab update ho gaya!", sale: updatedSale });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
module.exports = router;