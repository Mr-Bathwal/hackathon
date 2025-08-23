// src/utils/ethereum.js
import { ethers } from 'ethers';
import EventFactoryABI from '../abifiles/EventFactory.json';
import TicketMarketplaceABI from '../abifiles/TicketMarketplace.json';

// Contract addresses
export const EVENT_FACTORY_ADDRESS = '0x93A8868Fe54DfF5c33F89c1434D83C58ee63f567';
export const MARKETPLACE_ADDRESS    = '0xD15fB217FB2c9396CF3bb94DcB21E99eB340629F';

// Alchemy provider (Avalanche Fuji)
export const provider = new ethers.providers.JsonRpcProvider(
  'https://avax-fuji.g.alchemy.com/v2/F5gsff5z--PUD-jYszM8ErWKLSmCnmhh'
);

// Contracts (read-only)
export const eventFactory = new ethers.Contract(
  EVENT_FACTORY_ADDRESS,
  EventFactoryABI,
  provider
);

export const ticketMarketplace = new ethers.Contract(
  MARKETPLACE_ADDRESS,
  TicketMarketplaceABI,
  provider
);
