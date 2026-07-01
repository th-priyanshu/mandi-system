const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// 🔒 SECRET KEY: Ab Render ke locker se aayegi, agar wahan nahi mili toh local backup chalega
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_backup';

// 🔑 ADMIN CREDENTIALS FROM ENVIRONMENT VARIABLES
const ADMIN_USER = process.env.ADMIN_USERNAME;
const ADMIN_PASS = process.env.ADMIN_PASSWORD;

if (!ADMIN_USER || !ADMIN_PASS) {
    console.error("🚨 Security Alert: ADMIN_USERNAME or ADMIN_PASSWORD is missing in Render Environment Variables!");
}

// 🔑 SECURE LOGIN ROUTE
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Dono check ek sath lagenge aur variables se compare honge
        if (username === ADMIN_USER && password === ADMIN_PASS) {
            // Token generation
            const token = jwt.sign({ user: username }, JWT_SECRET, { expiresIn: '7d' });
            return res.json({ token });
        }
        
        return res.status(400).json({ message: "Username ya Password galat hai bhai!" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;