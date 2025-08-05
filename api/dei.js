// api/dei.js
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const weatherAPI = process.env.WEATHER_API_KEY;
  const iqairAPI = process.env.IQAIR_API_KEY;

  if (!weatherAPI || !iqairAPI) {
    return res.status(500).json({
      error: 'Missing or misconfigured API keys',
      details: 'Ensure WEATHER_API_KEY and IQAIR_API_KEY are set in your Vercel Environment Variables'
    });
  }

  try {
    // Fetch Calgary weather (humidity & wind)
    const weatherRes = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${weatherAPI}&q=Calgary`
    );
    if (!weatherRes.ok) {
      throw new Error(`WeatherAPI failed (status ${weatherRes.status})`);
    }
    const weather = await weatherRes.json();

    // Fetch nearest AQI for Calgary via IQAir
    const aqiRes = await fetch(
      `https://api.airvisual.com/v2/nearest_city?key=${iqairAPI}&lat=51.0447&lon=-114.0719`
    );
    if (!aqiRes.ok) {
      throw new Error(`IQAir failed (status ${aqiRes.status})`);
    }
    const aqi = await aqiRes.json();

    const responseData = {
      humidity: weather.current.humidity,
      wind: weather.current.wind_kph,
      pm25: aqi.data.current.pollution.pm25
    };

    res.status(200).json(responseData);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch data', details: err.message });
  }
};

