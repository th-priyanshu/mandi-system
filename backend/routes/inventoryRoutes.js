const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');

// 📦 LIVE GODOWN STOCK ROUTE (Bina token ke direct stock loading)
router.get('/stock', async (req, res) => {
    try {
        const stock = await Inventory.find();
        res.json(stock);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;