export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

export const findNearbyEvents = (events, userLocation, maxDistance = 50) => {
  if (!userLocation || !events) return [];

  return events
    .map(event => {
      // You would need to geocode the venue address to get coordinates
      // For now, using mock coordinates
      const eventCoords = getEventCoordinates(event.venue);
      if (!eventCoords) return null;

      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        eventCoords.latitude,
        eventCoords.longitude
      );

      return {
        ...event,
        distance,
      };
    })
    .filter(event => event && event.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance);
};

// Mock function - in a real app, you'd use a geocoding service
const getEventCoordinates = (venue) => {
  // Mock coordinates for demo purposes
  const mockCoordinates = {
    'Central Park, New York': { latitude: 40.785091, longitude: -73.968285 },
    'Madison Square Garden': { latitude: 40.750504, longitude: -73.993439 },
    'Hollywood Bowl': { latitude: 34.112222, longitude: -118.338889 },
    'Red Rocks Amphitheatre': { latitude: 39.665556, longitude: -105.205556 },
  };
  
  return mockCoordinates[venue] || null;
};

export const formatDistance = (distance) => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m away`;
  }
  return `${distance.toFixed(1)}km away`;
};
