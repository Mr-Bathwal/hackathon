import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useHumanVerification } from "../hooks/useHumanVerification";
import HumanVerification from "./HumanVerification";
import { indianMockEvents } from "../utils/nearbyEvents";

const NearbyEventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const {
    isVerificationOpen,
    requestVerification,
    handleVerified,
    handleClose
  } = useHumanVerification();

  // Find event in nearby events data
  const event = indianMockEvents.find(e => e.id === id);

  if (!event) {
    return (
      <div className="section">
        <div className="error-state">
          <h2>❌ Event Not Found</h2>
          <p>The nearby event you're looking for doesn't exist.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            🏠 Go Home
          </button>
        </div>
      </div>
    );
  }

  const handlePurchaseTicket = async (tierName = "General", price = 0.5) => {
    try {
      const verified = await requestVerification(
        "🎟️ Secure Purchase Verification",
        `Complete verification to buy ${tierName} ticket for ${event.name}`
      );
      
      if (verified) {
        alert(`🎉 Successfully purchased ${tierName} NFT ticket for ${event.name}!`);
        navigate('/profile');
      }
    } catch (err) {
      console.error("Purchase failed:", err);
      alert("❌ Purchase failed. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <div className="section">
        <div className="details">
          <img className="details-img" src={event.image} alt={event.name}/>
          <div className="details-body">
            <div className="breadcrumb">
              <button onClick={() => navigate('/')} className="btn btn-ghost btn-small">
                ← Back to Events
              </button>
            </div>
            
            <h2>{event.name}</h2>
            <div className="muted">
              {event.currency}{event.price} • {event.attendees} attending • {event.distance}km away
            </div>
            <p className="desc">{event.description}</p>
            
            <div className="event-details-meta">
              <div className="meta-row">
                <span className="meta-icon">📍</span>
                <span><strong>Venue:</strong> {event.venue}</span>
              </div>
              <div className="meta-row">
                <span className="meta-icon">🏠</span>
                <span><strong>Address:</strong> {event.address}</span>
              </div>
              <div className="meta-row">
                <span className="meta-icon">📅</span>
                <span><strong>Date:</strong> {formatDate(event.date)}</span>
              </div>
              <div className="meta-row">
                <span className="meta-icon">🏷️</span>
                <span><strong>Category:</strong> {event.category}</span>
              </div>
            </div>

            <div className="perks">
              <div className="perk">🎟️ NFT Ticket included</div>
              <div className="perk">📱 Digital proof of attendance</div>
              <div className="perk">🎁 Collectible memorabilia</div>
            </div>
            
            {event.earlyBird?.active && (
              <div className="early-bird-notice">
                🐦 Early Bird Active: {event.earlyBird.discount}% OFF before event!
              </div>
            )}
            
            <div className="ticket-tiers">
              <h4>🎫 Available Tickets</h4>
              <div className="tier-options">
                <div className="tier-option">
                  <div className="tier-info">
                    <span className="tier-name">🎵 General Admission</span>
                    <span className="tier-price">{((event.price || 500) / 80).toFixed(3)} ◎</span>
                  </div>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => handlePurchaseTicket("General", (event.price || 500) / 80)}
                  >
                    Buy General Ticket
                  </button>
                </div>
                
                <div className="tier-option">
                  <div className="tier-info">
                    <span className="tier-name">⭐ Premium Access</span>
                    <span className="tier-price">{(((event.price || 500) * 1.5) / 80).toFixed(3)} ◎</span>
                  </div>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => handlePurchaseTicket("Premium", ((event.price || 500) * 1.5) / 80)}
                  >
                    Buy Premium Ticket
                  </button>
                </div>
              </div>
            </div>

            <div className="security-badge">
              <span className="shield-icon">🛡️</span>
              <span>Secured with human verification</span>
            </div>
          </div>
        </div>
      </div>

      <HumanVerification
        isOpen={isVerificationOpen}
        onVerified={handleVerified}
        onClose={handleClose}
      />
    </>
  );
};

export default NearbyEventDetails;
