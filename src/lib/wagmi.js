import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { avalancheFuji } from 'wagmi/chains';
import { http } from 'wagmi';

// Avalanche Fuji testnet configuration
export const config = getDefaultConfig({
  appName: 'TicketVerse',
  projectId: '165b4e8850ea73b9832013ffe306116c', // <-- Your project ID here
  chains: [avalancheFuji],
  transports: {
    [avalancheFuji.id]: http('https://avax-fuji.g.alchemy.com/v2/F5gsff5z--PUD-jYszM8ErWKLSmCnmhh'),
  },
  ssr: true, // Enable this if you're using SSR
});

export { avalancheFuji } from 'wagmi/chains';
