// src/utils/mock.js

import { indianMockEvents } from './nearbyEvents';

export const ALL = [
  {
    id: "e1",
    name: "Crypto Music Fest 2025",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop",
    floor: 0.8,
    volume: 120.5,
    earlyBird: { active: true, discount: 15 },
    description:
      "The biggest crypto music festival featuring top DJs and artists from around the world. Experience the future of entertainment with exclusive NFT tickets."
  },
  {
    id: "e2",
    name: "Digital Art Expo",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
    floor: 0.3,
    volume: 75.2,
    earlyBird: { active: false },
    description:
      "Explore the intersection of technology and creativity at this groundbreaking digital art exhibition."
  },
  {
    id: "e3",
    name: "Web3 Conference",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop",
    floor: 1.2,
    volume: 210.8,
    earlyBird: { active: true, discount: 10 },
    description:
      "Join industry leaders discussing the future of blockchain, DeFi, and decentralized technologies."
  }
];

// Combine with Indian mock events:
export const mockEvents = [
  ...ALL,
  ...indianMockEvents.map((event, i) => {
    // assign a simple seatNumber = index+1
    return {
      id: event.id,
      name: event.name,
      image: event.image,
      floor: (event.price / 80).toFixed(2),
      volume: Math.floor(Math.random() * 1000),
      earlyBird: event.earlyBird,
      description: `${event.description} Located at ${event.venue}, ${event.address}.`,
      date: event.date,
      venue: event.venue,
      address: event.address,
      category: event.category,
      attendees: event.attendees,
      seatNumber: i + 1,           // numeric seatNumber
      tier: i % 2 === 0 ? "VIP" : "Normal",
      price: (event.price / 80).toFixed(2),
      perks: event.category === "Music"
        ? ["General Access"]
        : ["General Access"]
    };
  })
];

// lookup by id
export const mockEventById = id => mockEvents.find(e => e.id === id);
