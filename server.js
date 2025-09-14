const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); 
const TURNSTILE_SECRET = '0x4AAAAAAB1JB__l-hQ8aWnypIjMDBPdMHM';
const verifyTurnstile = async (token) => {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${TURNSTILE_SECRET}&response=${token}`
    });
    const data = await res.json();
    return data.success;
};
app.post('/api/spam', async (req, res) => {
    const { url, message, repeat, delay, token } = req.body;

    if (!await verifyTurnstile(token)) return res.status(403).json({ error: 'Turnstile verification failed' });

    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: Array(repeat).fill(message).join('\n') })
        });
        res.json({ success: true });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});
app.delete('/api/delete', async (req, res) => {
    const { url, token } = req.body;

    if (!await verifyTurnstile(token)) return res.status(403).json({ error: 'Turnstile verification failed' });

    try {
        const response = await fetch(url, { method: 'DELETE' });
        if (!response.ok) return res.status(500).json({ error: response.statusText });
        res.json({ success: true });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});
app.listen(3000, () => console.log('Server running on port 3000'));
