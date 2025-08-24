// mock.ts

// ----- Types -----
export interface MockEvent {
  address: string;
  venue: string;
  description: string;
  startTime: Date; // If using API/backend, consider using number (timestamp)
  endTime: Date;
  price: string;
  totalSeats: number;
  soldSeats: number;
  organizer: string;
}

export interface MockTicket {
  eventAddress: string;
  tokenId: number;
  venue: string;
  seatNumber: number;
  isVIP: boolean;
  isUsed: boolean;
  pricePaid: string;
}

export interface MockListing {
  eventAddress: string;
  tokenId: number;
  venue: string;
  seatNumber: number;
  isVIP: boolean;
  price: string;
  seller: string;
  saleType: number;
}

export interface MockAuction {
  eventAddress: string;
  tokenId: number;
  venue: string;
  seatNumber: number;
  isVIP: boolean;
  currentBid: string;
  reservePrice: string;
  endTime: Date;
  bidders: number;
}

// ----- Mock Data -----
export const mockEvents: MockEvent[] = [
  {
    address: '0x1234567890123456789012345678901234567890',
    venue: 'Madison Square Garden',
    description: 'The biggest concert of the year featuring top artists',
    startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 4 hours later
    price: '0.5',
    totalSeats: 1000,
    soldSeats: 750,
    organizer: '0x1111111111111111111111111111111111111111',
  },
  {
    address: '0x2345678901234567890123456789012345678901',
    venue: 'Hollywood Bowl',
    description: 'Classical music under the stars',
    startTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
    endTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours later
    price: '0.3',
    totalSeats: 500,
    soldSeats: 200,
    organizer: '0x2222222222222222222222222222222222222222',
  },
];

export const mockUserTickets: MockTicket[] = [
  {
    eventAddress: '0x1234567890123456789012345678901234567890',
    tokenId: 1,
    venue: 'Madison Square Garden',
    seatNumber: 42,
    isVIP: true,
    isUsed: false,
    pricePaid: '0.8',
  },
  {
    eventAddress: '0x2345678901234567890123456789012345678901',
    tokenId: 5,
    venue: 'Hollywood Bowl',
    seatNumber: 15,
    isVIP: false,
    isUsed: true,
    pricePaid: '0.3',
  },
];

export const mockMarketplaceListings: MockListing[] = [
  {
    eventAddress: '0x1234567890123456789012345678901234567890',
    tokenId: 10,
    venue: 'Madison Square Garden',
    seatNumber: 100,
    isVIP: false,
    price: '0.6',
    seller: '0x3333333333333333333333333333333333333333',
    saleType: 0,
  },
  {
    eventAddress: '0x2345678901234567890123456789012345678901',
    tokenId: 20,
    venue: 'Hollywood Bowl',
    seatNumber: 50,
    isVIP: true,
    price: '0.9',
    seller: '0x4444444444444444444444444444444444444444',
    saleType: 1,
  },
];

export const mockAuctions: MockAuction[] = [
  {
    eventAddress: '0x1234567890123456789012345678901234567890',
    tokenId: 25,
    venue: 'Madison Square Garden',
    seatNumber: 75,
    isVIP: true,
    currentBid: '1.2',
    reservePrice: '1.0',
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    bidders: 5,
  },
];

// Utility function to generate a random Ethereum-like address
export const generateMockEventAddress = (): string => {
  // 40 hex digits
  return '0x' + Math.random().toString(16).substring(2, 42).padEnd(40, '0');
};

// Utility for mock ticket NFT metadata (for Pinata or UI)
export const generateMockTicketMetadata = (
  eventName: string,
  seatNumber: number,
  isVIP: boolean
) => {
  return {
    name: `${eventName} - Seat ${seatNumber}`,
    description: `${isVIP ? 'VIP' : 'Regular'} ticket for ${eventName}`,
    image: `https://via.placeholder.com/400x200/667eea/white?text=${encodeURIComponent(eventName)}`,
    attributes: [
      { trait_type: 'Event', value: eventName },
      { trait_type: 'Seat Number', value: seatNumber },
      { trait_type: 'Type', value: isVIP ? 'VIP' : 'Regular' },
      { trait_type: 'Rarity', value: isVIP ? 'Rare' : 'Common' },
    ],
  };
};
