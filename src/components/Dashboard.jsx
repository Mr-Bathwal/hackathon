import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import TrendingEvents from "./TrendingEvents";
import NewEvents from "./NewEvents";
import NearbyEvents from "./NearbyEvents";
// For Ethers v6:
import { JsonRpcProvider, Contract } from "ethers";
import eventFactoryAbi from "../abifiles/EventFactory.json"; // Path to your ABI file

const provider = new JsonRpcProvider(import.meta.env.VITE_RPC_URL || "https://api.avax.network/ext/bc/C/rpc");

// Replace with your event factory contract address
const EVENT_FACTORY_ADDRESS = "0xYourFactoryAddressHere";

// Get deployed event addresses from EventFactory contract
async function fetchFeaturedEventAddresses() {
  try {
    const eventFactory = new Contract(EVENT_FACTORY_ADDRESS, eventFactoryAbi, provider);
    // getAllDeployedEvents returns array of address
    const addresses = await eventFactory.getAllDeployedEvents();
    return Array.isArray(addresses) && addresses.length > 0
      ? addresses
      : [];
  } catch (err) {
    // fallback: none found
    return [];
  }
}

// Fetch individual event data
async function fetchEventData(eventAddress) {
  try {
    // Replace with your event ABI. For demo, using eventFactoryAbi as placeholder.
    // Use correct Event NFT ABI for actual metadata.
    const eventContract = new Contract(eventAddress, eventFactoryAbi, provider);

    let name = "Event";
    let type = "VIP";
    let image = "";
    let price = "";
    let status = "live";

    // Try on-chain calls (customize methods as per deployed contract ABI)
    if (eventContract.name) name = await eventContract.name();
    // If you have metadata function like getMetadata() that returns image uri:
    // if (eventContract.image) image = await eventContract.image();
    // You can hardcode sample images if not given.
    image = "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop";
    // Add more reads as ABI allows

    // Demo fallback if no on-chain data
    return {
      name,
      type,
      image,
      price: "5.2 AVAX",
      status,
    };
  } catch (err) {
    // fallback
    return {
      name: "Sample Event",
      type: "VIP",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop",
      price: "5.2 AVAX",
      status: "live",
    };
  }
}

export default function Dashboard({ trending, fresh }) {
  const [featuredNfts, setFeaturedNfts] = useState([
    {
      id: 1,
      name: "Crypto Music Fest VIP",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop",
      type: "VIP",
      price: "5.2 AVAX",
      status: "live",
    },
    {
      id: 2,
      name: "Digital Art Expo Premium",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
      type: "Normal",
      price: "2.1 AVAX",
      status: "hot",
    },
    {
      id: 3,
      name: "Web3 Conference Elite",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop",
      type: "VIP",
      price: "7.8 AVAX",
      status: "new",
    },
  ]);
  const [currentNft, setCurrentNft] = useState(0);
  const [slideAnim, setSlideAnim] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    async function loadFeatured() {
      const addresses = await fetchFeaturedEventAddresses();
      if (addresses.length === 0) return; // nothing deployed
      const eventDataList = await Promise.all(
        addresses.map((addr) => fetchEventData(addr))
      );
      // fallback if not returned
      setFeaturedNfts(eventDataList.length > 0 ? eventDataList : featuredNfts);
    }
    loadFeatured();
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSlideAnim(true);
      setTimeout(() => {
        setCurrentNft((prev) => (prev + 1) % featuredNfts.length);
        setSlideAnim(false);
      }, 400);
    }, 3000);
    return () => clearInterval(intervalRef.current);
  }, [featuredNfts.length]);

  const featured = featuredNfts[currentNft];

  return (
    <div className="dashboard">
      {/* Featured rotating NFT card */}
      <section className="featured-nft-section">
        <div className="featured-nft-wrapper">
          {featured && (
            <div className={`featured-nft-card ${slideAnim ? "anim-slide" : ""}`}>
              <img src={featured.image} alt={featured.name} className="featured-nft-img" />
              <div className="featured-nft-labels">
                <span className={`nft-status-label status-${featured.status}`}>
                  {featured.status === "live" && "🔴 LIVE"}
                  {featured.status === "hot" && "🔥 HOT"}
                  {featured.status === "new" && "✨ NEW"}
                </span>
                <span className={`nft-type-label type-${featured.type.toLowerCase()}`}>
                  {featured.type === "VIP" ? "👑 VIP" : "🎫 Standard"}
                </span>
              </div>
              <div className="featured-nft-info">
                <h3 className="nft-title">{featured.name}</h3>
                <div className="nft-floor-row">
                  <span className="nft-price-label">Floor</span>
                  <span className="nft-price-value">{featured.price}</span>
                </div>
              </div>
            </div>
          )}
          <div className="featured-nft-indicators">
            {featuredNfts.map((_, idx) => (
              <button
                key={idx}
                className={`indicator-dot ${idx === currentNft ? "active" : ""}`}
                onClick={() => setCurrentNft(idx)}
                aria-label={`Show ${featuredNfts[idx].name}`}
              />
            ))}
          </div>
        </div>
        <div className="floating-categories">
          <span className="float-tag music">🎵 Music</span>
          <span className="float-tag art">🎨 Art</span>
          <span className="float-tag sports">🏆 Sports</span>
          <span className="float-tag tech">💻 Tech</span>
        </div>
      </section>

      {/* Quick magiceden-style actions row */}
      {/* ...rest of your code remains unchanged... */}
    </div>
  );
}
