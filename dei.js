export default async function handler(req, res) {
  const weatherAPI = process.env.WEATHER_API_KEY;
  const iqairAPI = process.env.IQAIR_API_KEY;

  try {
    const weatherRes = await fetch(`https://api.weatherapi.com/v1/current.json?key=${weatherAPI}&q=Calgary`);
    const weather = await weatherRes.json();

    const aqiRes = await fetch(`https://api.iqair.com/v1/nearest_city?key=${iqairAPI}&lat=51.0447&lon=-114.0719`);
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
}