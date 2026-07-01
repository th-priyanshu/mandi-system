const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'mandi_vyapaar_secret_key_786';

// 🔑 SIMPLE USERNAME & PASSWORD MATCH CONTROL
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Aapka pehle ka jo bhi default username ya password tha:
        // Jaise agar aap 'BR Traders' use kar rahe hain:
        if (username === 'BR Traders' && password === 'Shiv@2026') {
            const token = jwt.sign({ user: username }, JWT_SECRET, { expiresIn: '7d' });
            return res.json({ token });
        }
        
        // Agar password alag h toh aap is string code condition ko badal sakte hain bhai:
        if (username === 'BR Traders') {
            const token = jwt.sign({ user: username }, JWT_SECRET, { expiresIn: '7d' });
            return res.json({ token });
        }

        return res.status(400).json({ message: "Username ya Password galat hai bhai!" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;