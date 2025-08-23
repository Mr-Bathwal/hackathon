// Event storage utilities
export const eventStorage = {
  // Get all created events
  getEvents: () => {
    const events = localStorage.getItem('nfticket_created_events');
    return events ? JSON.parse(events) : [];
  },

  // Save a new event
  saveEvent: (eventData) => {
    const events = eventStorage.getEvents();
    const newEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...eventData,
      createdAt: new Date().toISOString(),
      status: 'draft', // draft, upcoming, live, ended
      ticketsSold: 0,
      totalTickets: eventData.tiers?.reduce((sum, tier) => sum + (tier.quantity || 0), 0) || 0,
      revenue: 0,
      attendees: 0
    };
    
    events.unshift(newEvent); // Add to beginning
    localStorage.setItem('nfticket_created_events', JSON.stringify(events));
    return newEvent;
  },

  // Update an existing event
  updateEvent: (eventId, updates) => {
    const events = eventStorage.getEvents();
    const index = events.findIndex(e => e.id === eventId);
    if (index !== -1) {
      events[index] = { ...events[index], ...updates };
      localStorage.setItem('nfticket_created_events', JSON.stringify(events));
    }
    return events[index];
  },

  // Delete an event
  deleteEvent: (eventId) => {
    const events = eventStorage.getEvents();
    const filteredEvents = events.filter(e => e.id !== eventId);
    localStorage.setItem('nfticket_created_events', JSON.stringify(filteredEvents));
  },

  // Get event by ID
  getEventById: (eventId) => {
    const events = eventStorage.getEvents();
    return events.find(e => e.id === eventId);
  }
};

// Sample event creator for testing
export const createSampleEvent = () => {
  const sampleEvent = {
    name: "My First NFT Event",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    venue: "Virtual Metaverse Hall",
    address: "Online Event",
    category: "Technology",
    description: "An amazing NFT event created with NFTicket",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=300&fit=crop",
    earlyBird: { active: true, discount: 15 },
    tiers: [
      { name: "General", price: 0.05, quantity: 100, sold: 0 },
      { name: "VIP", price: 0.15, quantity: 50, sold: 0 }
    ]
  };
  return eventStorage.saveEvent(sampleEvent);
};
