const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();

app.get('/api/dei', async (req, res) => {
  const weatherAPI = process.env.WEATHER_API_KEY;
  const iqairAPI = process.env.IQAIR_API_KEY;

  if (!weatherAPI || !iqairAPI) {
    return res.status(500).json({ error: 'Missing API keys' });
  }

  try {
    // --- WEATHER DATA ---
    const weatherRes = await fetch(`https://api.weatherapi.com/v1/current.json?key=${weatherAPI}&q=Calgary`);
    const weather = await weatherRes.json();
    const humidity = weather.current.humidity;
    const wind = weather.current.wind_kph;

    // --- AIR QUALITY (PM2.5) ---
    const aqiRes = await fetch(`https://api.airvisual.com/v2/nearest_city?key=${iqairAPI}&lat=51.0447&lon=-114.0719`);
    const aqi = await aqiRes.json();
    const pm25 = aqi.data.current.pollution.pm25;

    // --- DRY EYE INDEX CALC ---
    // Higher wind and PM2.5 → ↑ index, Higher humidity → ↓ index
    const dryEyeIndex = Math.min(10,
      (0.04 * wind) + (0.15 * pm25) + (0.2 * (100 - humidity) / 100 * 10)
    );

    res.json({
      humidity,
      wind,
      pm25,
      dryEyeIndex: parseFloat(dryEyeIndex.toFixed(1))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch data', details: err.message });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Dry Eye Index API is running...');
});
