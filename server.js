const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// In-memory storage
let globalMetrics = {
  targetApy: "40%",
  activeApy: "28%",
  dailyPerf: "+0.8%"
};

let userProfits = {};

// Serve frontend files
app.use(express.static(path.join(__dirname, '/')));

// ---- METRICS ----
app.get('/api/metrics', (req, res) => {
  res.json(globalMetrics);
});

app.post('/api/metrics', (req, res) => {
  globalMetrics = req.body;
  res.json({ status: 'Metrics updated' });
});

// ---- PROFITS ----
app.get('/api/profit/:wallet', (req, res) => {
  const wallet = req.params.wallet;
  res.json({ profit: userProfits[wallet] || "$0.00" });
});

app.post('/api/profit', (req, res) => {
  const { wallet, profit } = req.body;
  userProfits[wallet] = profit;
  res.json({ status: 'Profit saved' });
});

//  THIS WAS MISSING
app.get('/api/profits', (req, res) => {
  res.json(userProfits);
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
