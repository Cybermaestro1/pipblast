const express = require('express');
const path = require('path');
const fs = require('fs');
require('dotenv').config(); // load .env variables for Supabase
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

// --- Supabase client ---
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// --- JSON file paths (existing logic) ---
const metricsPath = path.join(__dirname, 'data/metrics.json');
const profitsPath = path.join(__dirname, 'data/profits.json');

// Helpers
const readJSON = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJSON = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

// ---- METRICS ----

// JSON file routes (keep existing)
app.get('/api/metrics', (req, res) => {
  res.json(readJSON(metricsPath));
});

app.post('/api/metrics', (req, res) => {
  writeJSON(metricsPath, req.body);
  res.json({ status: 'Metrics saved' });
});

// Supabase routes (optional, works alongside JSON)
app.get('/api/metrics-supabase', async (req, res) => {
  const { data, error } = await supabase
    .from('metrics')
    .select('*')
    .eq('id', 1)
    .single();

  if (error) return res.status(500).json(error);

  res.json({
    targetApy: data.target_apy,
    activeApy: data.active_apy,
    dailyPerf: data.daily_perf
  });
});

app.post('/api/metrics-supabase', async (req, res) => {
  const { targetApy, activeApy, dailyPerf } = req.body;

  const { error } = await supabase
    .from('metrics')
    .update({
      target_apy: targetApy,
      active_apy: activeApy,
      daily_perf: dailyPerf
    })
    .eq('id', 1);

  if (error) return res.status(500).json(error);

  res.json({ status: 'Metrics updated in Supabase' });
});

// ---- PROFITS ----

// JSON file routes (keep existing)
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

// Supabase profits routes (optional)
app.get('/api/profit-supabase/:wallet', async (req, res) => {
  const { data, error } = await supabase
    .from('profits')
    .select('*')
    .eq('wallet', req.params.wallet)
    .single();

  if (error) return res.json({ profit: "$0.00" });

  res.json({ profit: data.profit });
});

app.post('/api/profit-supabase', async (req, res) => {
  const { wallet, profit } = req.body;

  const { error } = await supabase
    .from('profits')
    .upsert({ wallet, profit }, { onConflict: 'wallet' });

  if (error) return res.status(500).json(error);

  res.json({ status: 'Profit updated in Supabase' });
});

app.get('/api/profits-supabase', async (req, res) => {
  const { data, error } = await supabase.from('profits').select('*');
  if (error) return res.status(500).json(error);
  res.json(data);
});

// ---- START SERVER ----
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

