const express = require('express');
const router = express.Router();

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'DRMP-Platform/1.0 (disaster-response-management)';

async function nominatimFetch(path, params) {
  const url = new URL(path, NOMINATIM_BASE);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Nominatim ${res.status}`);
  return res.json();
}

router.get('/search', async (req, res) => {
  try {
    const { q, limit = 5 } = req.query;
    if (!q || q.length < 2) return res.json([]);
    const data = await nominatimFetch('/search', {
      q, format: 'json', limit, addressdetails: 1,
    });
    res.json(data);
  } catch (err) {
    res.status(502).json({ message: 'Geocoding service unavailable' });
  }
});

router.get('/reverse', async (req, res) => {
  try {
    const { lat, lon, zoom = 18 } = req.query;
    if (!lat || !lon) return res.status(400).json({ message: 'lat and lon required' });
    const data = await nominatimFetch('/reverse', {
      lat, lon, format: 'json', zoom, addressdetails: 1,
    });
    res.json(data);
  } catch (err) {
    res.status(502).json({ message: 'Geocoding service unavailable' });
  }
});

module.exports = router;
