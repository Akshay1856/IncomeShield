import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENWEATHER_API_KEY = Deno.env.get('OPENWEATHER_API_KEY');
    if (!OPENWEATHER_API_KEY) {
      throw new Error('OPENWEATHER_API_KEY is not configured');
    }

    const { city } = await req.json();
    if (!city || typeof city !== 'string') {
      return new Response(JSON.stringify({ error: 'City is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch current weather + air pollution in parallel
    const [weatherRes, geoRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)},IN&units=metric&appid=${OPENWEATHER_API_KEY}`),
      fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)},IN&limit=1&appid=${OPENWEATHER_API_KEY}`),
    ]);

    const weatherData = await weatherRes.json();
    if (!weatherRes.ok) {
      throw new Error(`Weather API error [${weatherRes.status}]: ${JSON.stringify(weatherData)}`);
    }

    const geoData = await geoRes.json();
    let aqiData = null;

    if (geoData.length > 0) {
      const { lat, lon } = geoData[0];
      const aqiRes = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`);
      if (aqiRes.ok) {
        aqiData = await aqiRes.json();
      } else {
        await aqiRes.text(); // consume body
      }
    }

    // Extract relevant data
    const rainfall1h = weatherData.rain?.['1h'] || 0; // mm in last hour
    const rainfall3h = weatherData.rain?.['3h'] || 0;
    const temp = weatherData.main?.temp || 0;
    const feelsLike = weatherData.main?.feels_like || 0;
    const humidity = weatherData.main?.humidity || 0;
    const windSpeed = weatherData.wind?.speed || 0;
    const description = weatherData.weather?.[0]?.description || '';
    const icon = weatherData.weather?.[0]?.icon || '';

    // AQI: OpenWeather returns 1-5 scale, we convert to approximate AQI index
    const aqiScale = aqiData?.list?.[0]?.main?.aqi || 1; // 1=Good, 5=Very Poor
    const pm25 = aqiData?.list?.[0]?.components?.pm2_5 || 0;
    const pm10 = aqiData?.list?.[0]?.components?.pm10 || 0;
    // Approximate AQI from PM2.5 (simplified Indian AQI calculation)
    const approximateAQI = Math.round(pm25 * 4.2 + pm10 * 0.5);

    // Calculate heat index (simplified)
    const heatIndex = feelsLike > temp ? feelsLike : temp;

    // Determine trigger statuses
    const rainfallStatus = rainfall1h >= 40 ? 'danger' : rainfall1h >= 15 ? 'warning' : 'safe';
    const tempStatus = heatIndex >= 45 ? 'danger' : heatIndex >= 38 ? 'warning' : 'safe';
    const aqiStatus = approximateAQI >= 300 ? 'danger' : approximateAQI >= 150 ? 'warning' : 'safe';

    const response = {
      city: weatherData.name || city,
      timestamp: new Date().toISOString(),
      monitors: {
        rainfall: {
          value: rainfall1h > 0 ? `${rainfall1h} mm/hr` : rainfall3h > 0 ? `${Math.round(rainfall3h / 3)} mm/hr` : '0 mm/hr',
          rawValue: rainfall1h || rainfall3h / 3,
          status: rainfallStatus,
          threshold: '40mm',
        },
        temperature: {
          value: `${Math.round(temp)}°C`,
          rawValue: temp,
          feelsLike: Math.round(feelsLike),
          heatIndex: Math.round(heatIndex),
          status: tempStatus,
          threshold: '45°C',
        },
        aqi: {
          value: String(approximateAQI),
          rawValue: approximateAQI,
          pm25: Math.round(pm25),
          pm10: Math.round(pm10),
          status: aqiStatus,
          threshold: '300',
        },
      },
      conditions: {
        description,
        icon: `https://openweathermap.org/img/wn/${icon}@2x.png`,
        humidity,
        windSpeed: Math.round(windSpeed * 3.6), // m/s to km/h
      },
      triggersActive: [rainfallStatus, tempStatus, aqiStatus].some(s => s === 'danger'),
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Weather function error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
