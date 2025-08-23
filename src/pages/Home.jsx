import React, { useState, useEffect } from "react";
import Dashboard from "../components/Dashboard";
import { useAccount } from "wagmi";
import { useNavigate } from "react-router-dom";

// Featured carousel NFTs
const FEATURED_NFTS = [
  {
    id: "featured1",
    name: "Crypto Music Fest 2025",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop",
    price: 0.8,
    collection: "Music Events",
    verified: true
  },
  {
    id: "featured2", 
    name: "Digital Art Expo Premium",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
    price: 1.2,
    collection: "Art Exhibitions",
    verified: true
  },
  {
    id: "featured3",
    name: "Web3 Conference VIP",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop",
    price: 2.5,
    collection: "Tech Conferences", 
    verified: true
  }
];

const TRENDING = [
  {
    id: "e1",
    name: "Crypto Music Fest 2025",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop",
    floor: 0.8,
    volume: 120.5,
    items: 1000,
    verified: true
  },
  {
    id: "e2", 
    name: "Digital Art Expo",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
    floor: 0.3,
    volume: 75.2,
    items: 500,
    verified: true
  },
  {
    id: "e3",
    name: "Web3 Conference",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop",
    floor: 1.2,
    volume: 210.8,
    items: 750,
    verified: true
  }
];

const FRESH = [
  {
    id: "e4",
    name: "Rock Night Live",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop",
    date: "2025-09-10",
    status: "upcoming",
    verified: false
  },
  {
    id: "e5",
    name: "Indie Jam Session", 
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&h=400&fit=crop",
    date: "2025-09-15",
    status: "minting",
    verified: true
  },
  {
    id: "e6",
    name: "Electronic Dreams",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop",
    date: "2025-09-20",
    status: "upcoming",
    verified: true
  }
];

export default function Home() {
  const { address } = useAccount();
  const navigate = useNavigate();
  const [currentFeatured, setCurrentFeatured] = useState(0);

  // Carousel rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeatured(prev => (prev + 1) % FEATURED_NFTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleExplore = () => {
    navigate("/auction");
  };

  const handleViewCollection = (eventId) => {
    navigate(`/event/${eventId}`);
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <span className="badge-icon">⚡</span>
              The ultimate NFT marketplace
            </div>
            
            <h1 className="hero-title">
              Discover, collect, and sell
              <span className="gradient-text"> extraordinary</span> event NFTs
            </h1>
            
            <p className="hero-description">
              Join the largest marketplace for event-based NFTs. Get exclusive access to concerts, 
              conferences, sports events, and more with verifiable digital ownership.
            </p>

            <div className="hero-stats">
              <div className="hero-stat">
                <div className="stat-number">240k+</div>
                <div className="stat-label">NFTs</div>
              </div>
              <div className="hero-stat">
                <div className="stat-number">100k+</div>
                <div className="stat-label">Artists</div>
              </div>
              <div className="hero-stat">
                <div className="stat-number">24k+</div>
                <div className="stat-label">Collections</div>
              </div>
            </div>

            <div className="hero-actions">
              <button className="btn-hero primary" onClick={handleExplore}>
                Explore
              </button>
              <button className="btn-hero secondary" onClick={() => navigate("/create-event")}>
                Create
              </button>
            </div>
          </div>

          <div className="hero-nft">
            <div className="featured-nft-container">
              {FEATURED_NFTS.map((nft, index) => (
                <div 
                  key={nft.id}
                  className={`featured-nft ${index === currentFeatured ? 'active' : ''}`}
                  onClick={() => handleViewCollection("e1")}
                >
                  <div className="nft-image">
                    <img src={nft.image} alt={nft.name} />
                    {nft.verified && <div className="verified-badge">✓</div>}
                  </div>
                  <div className="nft-details">
                    <div className="nft-collection">{nft.collection}</div>
                    <div className="nft-name">{nft.name}</div>
                    <div className="nft-price">{nft.price} SOL</div>
                  </div>
                </div>
              ))}
              
              <div className="carousel-dots">
                {FEATURED_NFTS.map((_, index) => (
                  <button
                    key={index}
                    className={`carousel-dot ${index === currentFeatured ? 'active' : ''}`}
                    onClick={() => setCurrentFeatured(index)}
                  />
                ))}
              </div>
            </div>

            <div className="floating-elements">
              <div className="float-card music">🎵</div>
              <div className="float-card art">🎨</div>
              <div className="float-card tech">💻</div>
            </div>
          </div>
        </div>
      </div>

      {/* Trending Collections */}
      <div className="section trending-collections">
        <div className="section-header">
          <h2>🔥 Trending Collections</h2>
          <p>Top event collections by volume</p>
        </div>

        <div className="collections-grid">
          {TRENDING.map(collection => (
            <div 
              key={collection.id} 
              className="collection-card"
              onClick={() => handleViewCollection(collection.id)}
            >
              <div className="collection-image">
                <img src={collection.image} alt={collection.name} />
                {collection.verified && <div className="verified-badge">✓</div>}
              </div>
              
              <div className="collection-info">
                <h3 className="collection-name">{collection.name}</h3>
                
                <div className="collection-stats">
                  <div className="stat">
                    <span className="stat-label">Floor</span>
                    <span className="stat-value">{collection.floor} SOL</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Volume</span>
                    <span className="stat-value">{collection.volume}K</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Items</span>
                    <span className="stat-value">{collection.items}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New & Notable */}
      <div className="section new-notable">
        <div className="section-header">
          <h2>✨ New & Notable</h2>
          <p>Fresh drops and upcoming events</p>
        </div>

        <div className="notable-grid">
          {FRESH.map(item => (
            <div 
              key={item.id} 
              className="notable-card"
              onClick={() => handleViewCollection(item.id)}
            >
              <div className="notable-image">
                <img src={item.image} alt={item.name} />
                {item.verified && <div className="verified-badge">✓</div>}
                <div className={`status-badge ${item.status}`}>
                  {item.status === 'upcoming' ? 'Coming Soon' : 'Minting Now'}
                </div>
              </div>
              
              <div className="notable-info">
                <h3 className="notable-name">{item.name}</h3>
                <div className="notable-date">
                  {new Date(item.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="section categories">
        <div className="section-header">
          <h2>Browse by Category</h2>
          <p>Find events that match your interests</p>
        </div>

        <div className="categories-grid">
          {[
            { name: "Music", icon: "🎵", count: "12.4K" },
            { name: "Art", icon: "🎨", count: "8.2K" },
            { name: "Sports", icon: "⚽", count: "6.8K" },
            { name: "Technology", icon: "💻", count: "5.1K" },
            { name: "Gaming", icon: "🎮", count: "4.3K" },
            { name: "Conference", icon: "🎤", count: "3.9K" }
          ].map(category => (
            <div key={category.name} className="category-card">
              <div className="category-icon">{category.icon}</div>
              <div className="category-info">
                <h3 className="category-name">{category.name}</h3>
                <div className="category-count">{category.count} items</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className="section newsletter">
        <div className="newsletter-content">
          <div className="newsletter-text">
            <h2>Never miss a drop</h2>
            <p>Subscribe to our newsletter and be the first to know about new collections, events, and exclusive drops.</p>
          </div>
          
          <div className="newsletter-form">
            <input 
              type="email" 
              placeholder="Enter your email"
              className="newsletter-input"
            />
            <button className="newsletter-btn">Subscribe</button>
          </div>
        </div>
      </div>
    </div>
  );
}