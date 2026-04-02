import { useState, useEffect, useCallback } from 'react';

interface GeolocationData {
  latitude: number;
  longitude: number;
  city: string | null;
  locality: string | null;
  loading: boolean;
  error: string | null;
  permissionDenied: boolean;
}

// Reverse geocode using free Nominatim API (OpenStreetMap)
async function reverseGeocode(lat: number, lon: number): Promise<{ city: string | null; locality: string | null }> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
      { headers: { 'User-Agent': 'IncomeShield/1.0' } }
    );
    const data = await res.json();
    const addr = data.address || {};
    const city = addr.city || addr.town || addr.village || addr.county || addr.state_district || null;
    const locality = addr.suburb || addr.neighbourhood || addr.road || null;
    return { city, locality };
  } catch {
    return { city: null, locality: null };
  }
}

export function useGeolocation() {
  const [data, setData] = useState<GeolocationData>({
    latitude: 0,
    longitude: 0,
    city: null,
    locality: null,
    loading: true,
    error: null,
    permissionDenied: false,
  });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setData(prev => ({ ...prev, loading: false, error: 'Geolocation not supported' }));
      return;
    }

    setData(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const { city, locality } = await reverseGeocode(latitude, longitude);
        setData({
          latitude,
          longitude,
          city,
          locality,
          loading: false,
          error: null,
          permissionDenied: false,
        });
      },
      (err) => {
        setData(prev => ({
          ...prev,
          loading: false,
          error: err.message,
          permissionDenied: err.code === err.PERMISSION_DENIED,
        }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return { ...data, refetch: requestLocation };
}
