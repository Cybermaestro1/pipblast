const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

const metricsPath = path.join(__dirname, 'data/metrics.json');
const profitsPath = path.join(__dirname, 'data/profits.json');

// Helpers
const readJSON = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJSON = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

// ---- METRICS ----
app.get('/api/metrics', (req, res) => {
  res.json(readJSON(metricsPath));
});

app.post('/api/metrics', (req, res) => {
  writeJSON(metricsPath, req.body);
  res.json({ status: 'Metrics saved' });
});

// ---- PROFITS ----
app.get('/api/profit/:wallet', (req, res) => {
  const profits = readJSON(profitsPath);
  res.json({ profit: profits[req.params.wallet] || "$0.00" });
});

app.post('/api/profit', (req, res) => {
  const profits = readJSON(profitsPath);
  profits[req.body.wallet] = req.body.profit;
  writeJSON(profitsPath, profits);
  res.json({ status: 'Profit saved' });
});

app.get('/api/profits', (req, res) => {
  res.json(readJSON(profitsPath));
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
