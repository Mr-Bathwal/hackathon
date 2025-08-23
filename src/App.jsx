import React from "react";
import { createConfig, WagmiProvider, http } from "wagmi";
import { mainnet, avalanche, avalancheFuji } from "wagmi/chains";
import { injected, metaMask } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Components
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Profile from "./components/Profile";
import CreateEvent from "./components/CreateEvent";
import CreatedEvents from './components/CreatedEvents';
import AuctionChamber from "./components/AuctionChamber";
import ExternalEventMint from "./components/ExternalEventMint";
import NearbyEventDetails from "./components/NearbyEventDetails";
import EventMarketplaceDetails from "./components/EventMarketplaceDetails";

// Pages
import Home from "./pages/Home";
import EventDetails from "./pages/EventDetails";
import BuyNFT from "./pages/BuyNFT";

// Wagmi Config
const config = createConfig({
  chains: [mainnet, avalanche, avalancheFuji],
  connectors: [
    metaMask({
      dappMetadata: {
        name: "NFT Ticketing",
      },
    }),
    injected({
      target: () => ({
        id: "browser",
        name: "Browser Wallet",
        provider: window.ethereum,
      }),
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [avalanche.id]: http(),
    [avalancheFuji.id]: http(),
  },
});

// React Query Client Config
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: false,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Navbar />
          <div className="layout">
            <Sidebar />
            <div className="content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/create-event" element={<CreateEvent />} />
                <Route path="/created-events" element={<CreatedEvents />} />
                <Route path="/auction" element={<AuctionChamber />} />
                <Route path="/event/:id" element={<EventDetails />} />
                <Route path="/buy/:id" element={<BuyNFT />} />
                <Route path="/mint-external-event" element={<ExternalEventMint />} />
                <Route path="/nearby-event/:id" element={<NearbyEventDetails />} />
                <Route path="/event-marketplace/:eventName" element={<EventMarketplaceDetails />} />
              </Routes>
            </div>
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
