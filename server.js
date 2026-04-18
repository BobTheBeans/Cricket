import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const SITE_ID = 5845; // Sparsholt CC
const API_BASE = 'https://www.play-cricket.com/api/v2';
const API_TOKEN = process.env.PLAYCRICKET_API_TOKEN || '';

function currentSeason() {
  const now = new Date();
  const year = now.getFullYear();
  // UK cricket season runs April–September; treat Oct+ as next year's setup
  return now.getMonth() >= 9 ? year + 1 : year;
}

app.get('/api/matches', async (req, res) => {
  if (!API_TOKEN) {
    return res.status(503).json({ error: 'API token not configured', unconfigured: true });
  }
  try {
    const season = req.query.season || currentSeason();
    const { data } = await axios.get(`${API_BASE}/matches.json`, {
      params: { site_id: SITE_ID, season, api_token: API_TOKEN },
      timeout: 10000,
    });
    res.json(data);
  } catch (err) {
    console.error('Matches fetch error:', err.message);
    res.status(err.response?.status || 500).json({ error: 'Failed to fetch matches' });
  }
});

app.get('/api/match/:id', async (req, res) => {
  if (!API_TOKEN) {
    return res.status(503).json({ error: 'API token not configured', unconfigured: true });
  }
  try {
    const { data } = await axios.get(`${API_BASE}/match_detail.json`, {
      params: { match_id: req.params.id, api_token: API_TOKEN },
      timeout: 10000,
    });
    res.json(data);
  } catch (err) {
    console.error('Match detail fetch error:', err.message);
    res.status(err.response?.status || 500).json({ error: 'Failed to fetch match detail' });
  }
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, 'dist')));
  app.get('*', (_, res) => res.sendFile(join(__dirname, 'dist', 'index.html')));
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  if (!API_TOKEN) {
    console.warn('⚠  PLAYCRICKET_API_TOKEN not set — copy .env.example to .env and add your token');
  }
});
