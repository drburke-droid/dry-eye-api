const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();

app.get('/api/dei', async (req, res) => {
  const tempestToken = process.env.TEMPEST_TOKEN;
  const stationId = process.env.TEMPEST_STATION_ID;

  if (!tempestToken || !stationId) {
    return res.status(500).json({ error: 'Missing Tempest token or station ID' });
  }

  try {
    const url = `https://swd.weatherflow.com/swd/rest/observations/station/${stationId}?token=${tempestToken}`;
    const tempestRes = await fetch(url);
    const data = await tempestRes.json();

    const obs = data?.obs?.[0];
    if (!obs) {
      return res.status(500).json({ error: 'No observation data available from Tempest' });
    }

    // Extract relevant fields
    const humidity = obs.humidity;
    const windKph = obs.wind_avg * 3.6; // m/s → kph

    // Dry Eye Index calculation
    const dryEyeIndex = Math.min(10,
      (0.04 * windKph) + (0.2 * (100 - humidity) / 100 * 10)
    );

    res.json({
      humidity,
      wind: parseFloat(windKph.toFixed(1)),
      dryEyeIndex: parseFloat(dryEyeIndex.toFixed(1))
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch Tempest data', details: err.message });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Dry Eye Index API (Tempest) is running...');
});

