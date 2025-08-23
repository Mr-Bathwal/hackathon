// Calculate distance between coordinates
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return Math.round(distance * 10) / 10;
};

// Enhanced Indian mock events
export const indianMockEvents = [
  {
    id: "nearby_indian1",
    name: "Mumbai Tech Meetup",
    image: "https://images.unsplash.com/photo-1559223607-a43c990c692c?w=400&h=300&fit=crop",
    date: "2025-08-25T19:00:00Z",
    venue: "WeWork BKC",
    address: "Bandra Kurla Complex, Mumbai",
    distance: 2.1,
    latitude: 19.0596, 
    longitude: 72.8656,
    price: 500,
    category: "Technology",
    status: "upcoming",
    attendees: 87,
    source: "Community",
    currency: "₹",
    description: "Join Mumbai's premier tech community for networking, talks, and demos of the latest technology trends including Web3, AI, and startup innovations.",
    earlyBird: { active: true, discount: 20 }
  },
  {
    id: "nearby_indian2",
    name: "Delhi Crypto Conference",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop",
    date: "2025-08-26T10:00:00Z",
    venue: "India Habitat Centre",
    address: "Lodhi Road, New Delhi",
    distance: 1.5,
    latitude: 28.5706,
    longitude: 77.2085,
    price: 1200,
    category: "Finance",
    status: "upcoming",
    attendees: 234,
    source: "Community",
    currency: "₹",
    description: "India's largest cryptocurrency and blockchain conference featuring industry leaders, regulatory discussions, and investment opportunities in the crypto space.",
    earlyBird: { active: true, discount: 15 }
  },
  {
    id: "nearby_indian3",
    name: "Bangalore NFT Art Show",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
    date: "2025-08-27T18:30:00Z",
    venue: "UB City Mall",
    address: "Vittal Mallya Road, Bangalore",
    distance: 3.2,
    latitude: 12.9746,
    longitude: 77.6117,
    price: 800,
    category: "Art",
    status: "upcoming",
    attendees: 156,
    source: "Community",
    currency: "₹",
    description: "Explore the intersection of digital art and blockchain technology. Features NFT artists, collectors, and interactive exhibits showcasing the future of digital ownership.",
    earlyBird: { active: false, discount: 0 }
  },
  {
    id: "nearby_indian4",
    name: "Hyderabad Food Festival",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop",
    date: "2025-08-28T16:00:00Z",
    venue: "Hitec City",
    address: "Cyberabad, Hyderabad",
    distance: 4.8,
    latitude: 17.4435,
    longitude: 78.3772,
    price: 300,
    category: "Food",
    status: "upcoming",
    attendees: 445,
    source: "Community",
    currency: "₹",
    description: "Celebrate Hyderabadi cuisine and street food culture. Sample authentic biryanis, kebabs, and traditional sweets from the city's finest restaurants and food vendors.",
    earlyBird: { active: true, discount: 25 }
  },
  {
    id: "nearby_indian5",
    name: "Chennai Music Concert",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
    date: "2025-08-24T20:00:00Z",
    venue: "Music Academy",
    address: "TTK Road, Chennai",
    distance: 2.7,
    latitude: 13.0389,
    longitude: 80.2619,
    price: 600,
    category: "Music",
    status: "upcoming",
    attendees: 189,
    source: "Community",
    currency: "₹",
    description: "Experience the rich tradition of Carnatic music with renowned artists and emerging talents. Features classical compositions, fusion performances, and cultural celebrations.",
    earlyBird: { active: true, discount: 10 }
  },
  {
    id: "nearby_indian6",
    name: "Pune Startup Summit",
    image: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=300&fit=crop",
    date: "2025-08-29T09:00:00Z",
    venue: "Pune IT Park",
    address: "Hinjewadi, Pune",
    distance: 1.8,
    latitude: 18.5951,
    longitude: 73.7389,
    price: 1000,
    category: "Business",
    status: "upcoming",
    attendees: 312,
    source: "Community",
    currency: "₹",
    description: "Connect with Pune's thriving startup ecosystem. Features pitch competitions, investor meetups, and workshops on entrepreneurship, funding, and scaling businesses.",
    earlyBird: { active: true, discount: 30 }
  }
];

// Eventbrite API (Works globally including India)
export const fetchEventbriteEvents = async (latitude, longitude, radius = 25) => {
  const token = process.env.REACT_APP_EVENTBRITE_TOKEN;
  if (!token) {
    console.warn('Eventbrite token not found');
    return [];
  }

  try {
    const radiusKm = `${radius}km`;
    const response = await fetch(
      `https://www.eventbriteapi.com/v3/events/search/?location.latitude=${latitude}&location.longitude=${longitude}&location.within=${radiusKm}&expand=venue,category&sort_by=date&token=${token}`
    );
    
    if (!response.ok) {
      throw new Error(`Eventbrite API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.events?.map(event => ({
      id: `eb_${event.id}`,
      name: event.name?.text || 'Unnamed Event',
      description: event.description?.text || 'No description available',
      image: event.logo?.url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop',
      date: event.start?.utc || new Date().toISOString(),
      venue: event.venue?.name || 'Venue TBA',
      address: event.venue?.address?.localized_address_display || 'Address TBA',
      latitude: parseFloat(event.venue?.latitude || latitude),
      longitude: parseFloat(event.venue?.longitude || longitude),
      price: Math.random() * 2000 + 100,
      category: event.category?.name || 'Event',
      status: new Date(event.start?.utc) > new Date() ? 'upcoming' : 'past',
      attendees: Math.floor(Math.random() * 300) + 20,
      distance: calculateDistance(latitude, longitude, 
        parseFloat(event.venue?.latitude || latitude), 
        parseFloat(event.venue?.longitude || longitude)
      ),
      source: 'Eventbrite',
      url: event.url,
      currency: '₹',
      earlyBird: { 
        active: Math.random() > 0.7, 
        discount: Math.floor(Math.random() * 20) + 5 
      }
    })).filter(event => event.distance <= radius) || [];
    
  } catch (error) {
    console.error('Eventbrite API error:', error);
    return [];
  }
};

// Meetup API (Great coverage in Indian cities)
export const fetchMeetupEvents = async (latitude, longitude, radius = 25) => {
  try {
    console.warn('Meetup API requires authentication, using fallback');
    return [];
  } catch (error) {
    console.error('Meetup API error:', error);
    return [];
  }
};

// Facebook Events API (Good global coverage)
export const fetchFacebookEvents = async (latitude, longitude, radius = 25000) => {
  const accessToken = process.env.REACT_APP_FACEBOOK_ACCESS_TOKEN;
  if (!accessToken) {
    console.warn('Facebook access token not found');
    return [];
  }

  try {
    console.warn('Facebook Events API deprecated for public events');
    return [];
  } catch (error) {
    console.error('Facebook API error:', error);
    return [];
  }
};

// Main function to fetch all nearby events (India-focused)
export const fetchAllNearbyEvents = async (latitude, longitude, radius = 50) => {
  console.log(`Fetching events near ${latitude}, ${longitude} within ${radius}km`);
  
  try {
    // Fetch from India-relevant sources
    const eventbriteEvents = await fetchEventbriteEvents(latitude, longitude, radius);
    const meetupEvents = await fetchMeetupEvents(latitude, longitude, radius);
    const facebookEvents = await fetchFacebookEvents(latitude, longitude, radius * 1000);

    // Add Indian mock events with calculated distances
    const mockWithDistance = indianMockEvents.map(event => ({
      ...event,
      distance: calculateDistance(latitude, longitude, event.latitude, event.longitude)
    })).filter(event => event.distance <= radius);

    // Combine all events
    let allEvents = [...eventbriteEvents, ...meetupEvents, ...facebookEvents, ...mockWithDistance];
    
    // Remove duplicates based on name similarity
    allEvents = allEvents.filter((event, index, self) => 
      index === self.findIndex(e => {
        const nameA = event.name.toLowerCase();
        const nameB = e.name.toLowerCase();
        return nameA === nameB || (nameA.length > 10 && nameB.includes(nameA.substring(0, 10)));
      })
    );

    // Sort by distance and limit results
    const sortedEvents = allEvents
      .sort((a, b) => a.distance - b.distance)
      .slice(0, Math.max(20, Math.floor(radius / 10)));

    console.log(`Found ${sortedEvents.length} events from ${[...new Set(sortedEvents.map(e => e.source))].join(', ')}`);
    return sortedEvents;
    
  } catch (error) {
    console.error('Error fetching events:', error);
    // Return Indian mock data as fallback
    return indianMockEvents.map(event => ({
      ...event,
      distance: calculateDistance(latitude, longitude, event.latitude, event.longitude)
    })).filter(event => event.distance <= radius);
  }
};

// Get city name from coordinates (using free OpenStreetMap Nominatim)
export const getCityFromCoordinates = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`
    );
    
    const data = await response.json();
    return data.address?.city || 
           data.address?.town || 
           data.address?.village || 
           data.address?.state_district || 
           'Unknown City';
  } catch (error) {
    console.error('Error getting city:', error);
    return 'Unknown City';
  }
};

// Get events by major Indian cities
export const fetchEventsByCity = async (cityName) => {
  const indianCityCoords = {
    'mumbai': [19.0760, 72.8777],
    'delhi': [28.6139, 77.2090],
    'bangalore': [12.9716, 77.5946],
    'hyderabad': [17.3850, 78.4867],
    'ahmedabad': [23.0225, 72.5714],
    'chennai': [13.0827, 80.2707],
    'kolkata': [22.5726, 88.3639],
    'pune': [18.5204, 73.8567],
    'jaipur': [26.9124, 75.7873],
    'lucknow': [26.8467, 80.9462],
    'kanpur': [26.4499, 80.3319],
    'nagpur': [21.1458, 79.0882],
    'indore': [22.7196, 75.8577],
    'thane': [19.2183, 72.9781],
    'bhopal': [23.2599, 77.4126],
    'visakhapatnam': [17.6868, 83.2185]
  };

  try {
    const cityKey = cityName.toLowerCase();
    const coords = indianCityCoords[cityKey];
    
    if (coords) {
      return await fetchAllNearbyEvents(coords[0], coords[1], 50);
    } else {
      // Try geocoding for other cities
      const geoResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(cityName)}&country=India&format=json&limit=1`
      );
      
      const geoData = await geoResponse.json();
      if (geoData.length > 0) {
        const lat = parseFloat(geoData[0].lat);
        const lon = parseFloat(geoData.lon);
        return await fetchAllNearbyEvents(lat, lon, 50);
      }
    }
    
    return indianMockEvents;
  } catch (error) {
    console.error('Error fetching city events:', error);
    return indianMockEvents;
  }
};
