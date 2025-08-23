import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import SeatSelector from "../components/SeatSelector";
import { useHumanVerification } from "../hooks/useHumanVerification";
import HumanVerification from "../components/HumanVerification";

// Mock event data with individual NFTs
const EVENT_NFTS = {
  "e1": {
    name: "Crypto Music Fest 2025",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop",
    description: "The biggest crypto music festival featuring top DJs and artists from around the world.",
    venue: "Madison Square Garden",
    date: "2025-12-15T19:00:00Z",
    category: "Music",
    floor: 0.8,
    volume: 120.5,
    nfts: [
      {
        id: "nft1",
        name: "VIP Section A - Row 1",
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
        seat: "A1-5",
        tier: "VIP",
        price: 2.5,
        perks: ["VIP Lounge", "Meet & Greet", "Signed Merch"],
        available: true
      },
      {
        id: "nft2", 
        name: "VIP Section A - Row 2",
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&blend=6366f1&sat=-100&blend-mode=multiply",
        seat: "A2-3",
        tier: "VIP", 
        price: 2.2,
        perks: ["VIP Lounge", "Premium Bar"],
        available: true
      },
      {
        id: "nft3",
        name: "General Section B - Row 5",
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&blend=10b981&sat=-100&blend-mode=multiply",
        seat: "B5-10",
        tier: "Normal",
        price: 0.8,
        perks: ["General Access"],
        available: true
      },
      {
        id: "nft4",
        name: "General Section C - Row 8", 
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&blend=10b981&sat=-100&blend-mode=multiply",
        seat: "C8-12",
        tier: "Normal",
        price: 0.6,
        perks: ["General Access"],
        available: false
      }
    ]
  },
  "e2": {
    name: "Digital Art Expo",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
    description: "Explore the intersection of technology and creativity at this groundbreaking digital art exhibition.",
    venue: "Modern Art Museum",
    date: "2025-11-20T14:00:00Z",
    category: "Art",
    floor: 0.3,
    volume: 75.2,
    nfts: [
      {
        id: "nft5",
        name: "Premium Gallery Access",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
        seat: "Gallery-VIP",
        tier: "VIP",
        price: 1.5,
        perks: ["Curator Tour", "Artist Meet"],
        available: true
      },
      {
        id: "nft6",
        name: "Standard Gallery Pass",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&blend=10b981&sat=-100&blend-mode=multiply",
        seat: "Gallery-General",
        tier: "Normal",
        price: 0.3,
        perks: ["General Access"],
        available: true
      }
    ]
  },
  "e3": {
    name: "Web3 Conference",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop",
    description: "Join industry leaders discussing the future of blockchain, DeFi, and decentralized technologies.",
    venue: "Convention Center",
    date: "2025-10-10T09:00:00Z", 
    category: "Technology",
    floor: 1.2,
    volume: 210.8,
    nfts: [
      {
        id: "nft7",
        name: "VIP Conference Pass",
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=400&fit=crop",
        seat: "VIP-Front",
        tier: "VIP",
        price: 3.0,
        perks: ["Networking Dinner", "Speaker Access"],
        available: true
      },
      {
        id: "nft8",
        name: "Standard Conference Pass",  
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=400&fit=crop&blend=10b981&sat=-100&blend-mode=multiply",
        seat: "General-Floor",
        tier: "Normal",
        price: 1.2,
        perks: ["Conference Access"],
        available: true
      }
    ]
  }
};

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedNft, setSelectedNft] = useState(null);
  const [showSeatModal, setShowSeatModal] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [purchaseStep, setPurchaseStep] = useState("select"); // select, seats, confirm
  
  const {
    isVerificationOpen,
    requestVerification,
    handleVerified,
    handleClose
  } = useHumanVerification();

  const event = EVENT_NFTS[id];

  if (!event) {
    return (
      <div className="error-container">
        <div className="error-content">
          <h2>Event Not Found</h2>
          <p>The event you're looking for doesn't exist.</p>
          <Link to="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Mock seat map data
  const generateSeatMap = () => {
    const seats = [];
    const rows = 8;
    const cols = 10;
    
    for (let r = 1; r <= rows; r++) {
      for (let c = 1; c <= cols; c++) {
        const seatId = `R${r}C${c}`;
        const isVIP = r <= 2; // First 2 rows are VIP
        const isUnavailable = Math.random() < 0.15; // 15% of seats unavailable
        
        seats.push({
          id: seatId,
          label: seatId,
          row: r,
          col: c,
          type: isVIP ? "VIP" : "Normal",
          price: isVIP ? 2.5 : 0.8,
          taken: isUnavailable,
          perks: isVIP ? ["VIP Lounge", "Premium Bar"] : ["General Access"]
        });
      }
    }
    return seats;
  };

  const handleNftSelect = async (nft) => {
    if (!nft.available) {
      alert("This NFT is no longer available.");
      return;
    }

    setSelectedNft(nft);
    setPurchaseStep("seats");
    setShowSeatModal(true);
  };

  const handlePurchase = async () => {
    try {
      const verified = await requestVerification(
        "🎟️ Secure Purchase Verification",
        `Complete verification to purchase ${selectedNft.name}`
      );
      
      if (verified) {
        alert(`🎉 Successfully purchased ${selectedNft.name}!`);
        navigate("/profile");
      }
    } catch (err) {
      console.error("Purchase failed:", err);
      alert("❌ Purchase failed. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  return (
    <>
      <div className="event-details-container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/" className="breadcrumb-link">Home</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{event.name}</span>
        </div>

        {/* Event Header */}
        <div className="event-header">
          <div className="event-hero">
            <img src={event.image} alt={event.name} className="event-hero-image" />
            <div className="event-hero-overlay">
              <div className="event-stats">
                <div className="stat">
                  <span className="stat-label">Floor Price</span>
                  <span className="stat-value">{event.floor} SOL</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Volume</span>
                  <span className="stat-value">{event.volume} SOL</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Items</span>
                  <span className="stat-value">{event.nfts.length}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="event-info">
            <h1 className="event-title">{event.name}</h1>
            <p className="event-description">{event.description}</p>
            
            <div className="event-meta">
              <div className="meta-item">
                <span className="meta-icon">📍</span>
                <span className="meta-text">{event.venue}</span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">📅</span>
                <span className="meta-text">{formatDate(event.date)}</span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">🏷️</span>
                <span className="meta-text">{event.category}</span>
              </div>
            </div>
          </div>
        </div>

        {/* NFT Grid */}
        <div className="nft-section">
          <div className="section-header">
            <h2>Available NFT Tickets</h2>
            <div className="view-options">
              <button className="view-btn active">Grid</button>
              <button className="view-btn">List</button>
            </div>
          </div>

          <div className="nft-filters">
            <button className="filter-btn active">All</button>
            <button className="filter-btn">VIP</button>
            <button className="filter-btn">Normal</button>
            <button className="filter-btn">Available</button>
          </div>

          <div className="event-nft-grid">
            {event.nfts.map(nft => (
              <div 
                key={nft.id} 
                className={`event-nft-card ${!nft.available ? 'sold-out' : ''}`}
                onClick={() => handleNftSelect(nft)}
              >
                <div className="nft-image">
                  <img src={nft.image} alt={nft.name} />
                  {!nft.available && <div className="sold-overlay">SOLD OUT</div>}
                  <div className={`tier-badge ${nft.tier.toLowerCase()}`}>
                    {nft.tier === "VIP" ? "👑" : "🎫"} {nft.tier}
                  </div>
                </div>
                
                <div className="nft-info">
                  <h3 className="nft-name">{nft.name}</h3>
                  <p className="nft-seat">Seat: {nft.seat}</p>
                  
                  <div className="nft-perks">
                    {nft.perks.slice(0, 2).map(perk => (
                      <span key={perk} className="perk-tag">{perk}</span>
                    ))}
                    {nft.perks.length > 2 && (
                      <span className="perk-tag">+{nft.perks.length - 2} more</span>
                    )}
                  </div>

                  <div className="nft-price-section">
                    <div className="price">
                      <span className="price-label">Price</span>
                      <span className="price-value">{nft.price} SOL</span>
                    </div>
                    <button 
                      className={`buy-btn ${!nft.available ? 'disabled' : ''}`}
                      disabled={!nft.available}
                    >
                      {nft.available ? 'Buy Now' : 'Sold Out'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Seat Selection Modal */}
      {showSeatModal && selectedNft && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>
                {purchaseStep === "seats" ? "Select Your Seats" : "Confirm Purchase"}
              </h2>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowSeatModal(false);
                  setSelectedNft(null);
                  setSelectedSeats([]);
                  setPurchaseStep("select");
                }}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {purchaseStep === "seats" && (
                <div className="seat-selection">
                  <div className="selected-nft-info">
                    <img src={selectedNft.image} alt={selectedNft.name} />
                    <div className="nft-details">
                      <h3>{selectedNft.name}</h3>
                      <div className={`tier-badge ${selectedNft.tier.toLowerCase()}`}>
                        {selectedNft.tier}
                      </div>
                      <div className="base-price">Base Price: {selectedNft.price} SOL</div>
                    </div>
                  </div>

                  <div className="seat-selector-container">
                    <div className="venue-layout">
                      <div className="stage">🎵 STAGE</div>
                      <SeatSelector
                        seatMap={generateSeatMap()}
                        onSelectionChange={setSelectedSeats}
                        maxSelect={selectedNft.tier === "VIP" ? 2 : 4}
                      />
                    </div>
                  </div>

                  <div className="selection-summary">
                    <div className="summary-info">
                      <div className="selected-count">
                        Selected: {selectedSeats.length} seat(s)
                      </div>
                      <div className="total-price">
                        Total: {totalPrice.toFixed(2)} SOL
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {purchaseStep === "confirm" && (
                <div className="purchase-confirmation">
                  <div className="confirmation-item">
                    <img src={selectedNft.image} alt={selectedNft.name} />
                    <div className="item-info">
                      <h3>{selectedNft.name}</h3>
                      <div className="confirmation-details">
                        <div>Tier: {selectedNft.tier}</div>
                        <div>Seats: {selectedSeats.map(s => s.label).join(", ")}</div>
                        <div>Perks: {selectedNft.perks.join(", ")}</div>
                      </div>
                    </div>
                    <div className="item-price">
                      {totalPrice.toFixed(2)} SOL
                    </div>
                  </div>

                  <div className="purchase-breakdown">
                    <div className="breakdown-row">
                      <span>Subtotal</span>
                      <span>{totalPrice.toFixed(2)} SOL</span>
                    </div>
                    <div className="breakdown-row">
                      <span>Platform Fee (2.5%)</span>
                      <span>{(totalPrice * 0.025).toFixed(3)} SOL</span>
                    </div>
                    <div className="breakdown-row total">
                      <span>Total</span>
                      <span>{(totalPrice * 1.025).toFixed(3)} SOL</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              {purchaseStep === "seats" && (
                <>
                  <button 
                    className="btn-secondary"
                    onClick={() => {
                      setShowSeatModal(false);
                      setSelectedNft(null);
                      setSelectedSeats([]);
                      setPurchaseStep("select");
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn-primary"
                    disabled={selectedSeats.length === 0}
                    onClick={() => setPurchaseStep("confirm")}
                  >
                    Continue ({selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''})
                  </button>
                </>
              )}

              {purchaseStep === "confirm" && (
                <>
                  <button 
                    className="btn-secondary"
                    onClick={() => setPurchaseStep("seats")}
                  >
                    Back
                  </button>
                  <button 
                    className="btn-primary"
                    onClick={handlePurchase}
                  >
                    Purchase {(totalPrice * 1.025).toFixed(3)} SOL
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <HumanVerification
        isOpen={isVerificationOpen}
        onVerified={handleVerified}
        onClose={handleClose}
      />
    </>
  );
}