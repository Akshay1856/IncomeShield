import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface WeatherMonitor {
  value: string;
  rawValue: number;
  status: 'safe' | 'warning' | 'danger';
  threshold: string;
  feelsLike?: number;
  heatIndex?: number;
  pm25?: number;
  pm10?: number;
}

export interface WeatherData {
  city: string;
  timestamp: string;
  monitors: {
    rainfall: WeatherMonitor;
    temperature: WeatherMonitor;
    aqi: WeatherMonitor;
  };
  conditions: {
    description: string;
    icon: string;
    humidity: number;
    windSpeed: number;
  };
  triggersActive: boolean;
}

export function useWeatherData(city: string) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async () => {
    if (!city) return;
    try {
      setError(null);
      const { data: result, error: fnError } = await supabase.functions.invoke('get-weather', {
        body: { city },
      });

      if (fnError) throw fnError;
      if (result?.error) throw new Error(result.error);

      setData(result as WeatherData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch weather';
      console.error('Weather fetch error:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [city]);

  useEffect(() => {
    fetchWeather();
    // Refresh every 5 minutes
    const interval = setInterval(fetchWeather, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  return { data, loading, error, refetch: fetchWeather };
}
