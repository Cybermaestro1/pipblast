const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// In-memory storage (or you can use JSON files)
let globalMetrics = { targetApy: "40%", activeApy: "28%", dailyPerf: "+0.8%" };
let userProfits = {};

// Serve frontend files
app.use(express.static(path.join(__dirname, '/')));

// API routes
app.get('/api/metrics', (req, res) => res.json(globalMetrics));
app.post('/api/metrics', (req, res) => {
    globalMetrics = req.body;
    res.json({ status: 'Metrics updated' });
});

app.get('/api/profit/:wallet', (req, res) => {
    const wallet = req.params.wallet;
    res.json({ profit: userProfits[wallet] || "$0.00" });
});

app.post('/api/profit', (req, res) => {
    const { wallet, profit } = req.body;
    userProfits[wallet] = profit;
    res.json({ status: 'Profit saved' });
});

// Start server
app.listen(port, () => console.log(`Server running on port ${port}`));
