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

    // --- AIR QUALITY ---
    let pm25 = null;
    const aqiRes = await fetch(`https://api.airvisual.com/v2/nearest_city?key=${iqairAPI}&lat=51.0447&lon=-114.0719`);
    const aqi = await aqiRes.json();

    if (aqi.status === "success" && aqi.data?.current?.pollution?.pm25 !== undefined) {
      pm25 = aqi.data.current.pollution.pm25;
    }

    // --- DEI CALCULATION ---
    let dryEyeIndex = (
      (0.04 * wind) +
      (pm25 !== null ? 0.15 * pm25 : 0) +
      (0.2 * (100 - humidity) / 100 * 10)
    );

    dryEyeIndex = Math.min(10, dryEyeIndex);

    res.json({
      humidity,
      wind,
      pm25: pm25 !== null ? pm25 : "unavailable",
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

