import { useState, useEffect } from 'react';

export const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [permission, setPermission] = useState('prompt'); // 'granted', 'denied', 'prompt'

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setLoading(true);
    setError(null);

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes cache
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
        setPermission('granted');
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setPermission('denied');
        setLoading(false);
      },
      options
    );
  };

  const checkPermission = async () => {
    if ('permissions' in navigator) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        setPermission(result.state);
        
        result.addEventListener('change', () => {
          setPermission(result.state);
        });
      } catch (err) {
        console.log('Permission API not supported');
      }
    }
  };

  useEffect(() => {
    checkPermission();
  }, []);

  const resetLocation = () => {
    setLocation(null);
    setError(null);
    setPermission('prompt');
  };

  return {
    location,
    error,
    loading,
    permission,
    getCurrentLocation,
    resetLocation
  };
};
