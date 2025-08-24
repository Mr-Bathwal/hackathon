// Curated sample collections and NFTs to give the app a Magic Eden-like feel
// These are purely illustrative and shown when on-chain data is sparse.

export const sampleCollections = [
  {
    id: 'edm-festival',
    title: 'EDM Festival 2025',
    subtitle: 'Bass Arena • Nightlife',
    banner: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200',
    tiles: [
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400',
      'https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?w=400',
      'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=400',
    ],
    stats: { floor: '0.23', listed: 38, volume: '124.6' },
  },
  {
    id: 'crypto-conference',
    title: 'CryptoConf Summit',
    subtitle: 'Keynotes • Builders',
    banner: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
    tiles: [
      'https://images.unsplash.com/photo-1522199794611-8e15ef1a6b83?w=400',
      'https://images.unsplash.com/photo-1529336953121-b0c20e3df5fc?w=400',
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400',
    ],
    stats: { floor: '0.12', listed: 21, volume: '78.1' },
  },
  {
    id: 'stadium-finals',
    title: 'Stadium Finals',
    subtitle: 'Sports • VIP Boxes',
    banner: 'https://images.unsplash.com/photo-1521417531039-25e1b0a2b09f?w=1200',
    tiles: [
      'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400',
      'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?w=400',
      'https://images.unsplash.com/photo-1471295253337-3ceaaedca402?w=400',
    ],
    stats: { floor: '0.45', listed: 12, volume: '256.9' },
  },
];

export const sampleNFTs = [
  {
    id: 'vip-001',
    name: 'VIP Box A1',
    tier: 'VIP',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800',
    price: '1.250',
    venue: 'Stadium Finals',
  },
  {
    id: 'vip-002',
    name: 'Front Row 12',
    tier: 'VIP',
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800',
    price: '0.980',
    venue: 'EDM Festival 2025',
  },
  {
    id: 'reg-101',
    name: 'General Seat 214',
    tier: 'Normal',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
    price: '0.120',
    venue: 'CryptoConf Summit',
  },
  {
    id: 'reg-102',
    name: 'Balcony 34',
    tier: 'Normal',
    image: 'https://images.unsplash.com/photo-1515169067865-5387ec356754?w=800',
    price: '0.095',
    venue: 'Club Live Nights',
  },
];

