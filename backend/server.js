const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();

app.use(cors());
app.use(express.json());

// 🌟 CLOUD DATABASE CONFIGURATION: 
// Agar environment variable milega toh cloud par chalega, nahi toh local backup par fallback karega.
const dbConnectionString = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mandi_trade_db';

mongoose.connect(dbConnectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("📡 MongoDB Connected Successfully to Cloud Database!"))
  .catch(err => console.log("Database connection error: ", err));

// 📡 Live Government API Connector (Aapka purana perfect code)
app.get('/api/live-mandi-rates', async (req, res) => {
    try {
        const apiKey = '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b'; 
        const govPortalUrl = `https://api.data.gov.in/resource/9ef84243-d58e-4c1a-825d-e8fc0ab7ef7e?api-key=${apiKey}&format=json&limit=50&filters[state]=Uttar%20Pradesh&filters[market]=Mainpuri`;
        
        const response = await axios.get(govPortalUrl).catch(() => null);
        const marketRecords = response && response.data && response.data.records ? response.data.records : [];
        
        if (marketRecords.length > 0) {
            const compiledMandiRates = marketRecords.map(r => {
                const currentQuintalRate = Number(r.modal_price || 0);
                return {
                    commodity: r.commodity.toUpperCase(),
                    quintalPrice: currentQuintalRate,
                    localPrice40Kg: Math.round((currentQuintalRate / 100) * 40), 
                    localPrice50Kg: Math.round((currentQuintalRate / 100) * 50),
                    market: 'Mainpuri Mandi'
                };
            });
            return res.json(compiledMandiRates);
        }
        res.json([]);
    } catch (err) {
        res.json([]); 
    }
});

// Business Sub-Modules Link
const purchaseRoutes = require('./routes/purchaseRoutes');
const salesRoutes = require('./routes/salesRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/api/purchases', purchaseRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/auth', authRoutes);

// 🌟 DYNAMIC PRODUCTION PORT SETUP
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Mandi Server running on production port ${PORT}`);
});