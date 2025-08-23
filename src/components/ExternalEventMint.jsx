import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useHumanVerification } from "../hooks/useHumanVerification";
import HumanVerification from "./HumanVerification";
import { ethers } from "ethers";
import EventFactoryAbi from "../abifiles/EventFactory.json"; // Update path as needed

const EVENT_FACTORY_ADDRESS = "0xYourEventFactoryAddress"; // Replace with your contract

const ExternalEventMint = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const eventData = state?.eventData;
  const userLocation = state?.userLocation;

  const [selectedTier, setSelectedTier] = useState('general');
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    isVerificationOpen,
    requestVerification,
    handleVerified,
    handleClose
  } = useHumanVerification();

  if (!eventData) {
    return (
      <div className="section">
        <div className="error-state">
          <h2>❌ Event Not Found</h2>
          <p>No event data available for minting.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            🏠 Go Home
          </button>
        </div>
      </div>
    );
  }

  const tiers = {
    general: {
      name: "General Access",
      price: Math.round(eventData.price * 0.01) || 0.1,
      icon: "🎫",
      description: "Standard event access as NFT ticket"
    },
    premium: {
      name: "Premium NFT",
      price: Math.round(eventData.price * 0.015) || 0.15,
      icon: "⭐",
      description: "Enhanced NFT with additional metadata"
    },
    collector: {
      name: "Collector's Edition",
      price: Math.round(eventData.price * 0.02) || 0.2,
      icon: "💎",
      description: "Limited edition NFT with exclusive artwork"
    }
  };

  const handleMintNFT = async () => {
    try {
      const verified = await requestVerification(
        "🎟️ Verify NFT Minting",
        `Mint ${selectedTier} NFT ticket for ${eventData.name}`
      );

      if (verified) {
        setIsProcessing(true);

        if (window.ethereum) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();

          // Connect to EventFactory (or your NFT contract)
          const eventFactory = new ethers.Contract(EVENT_FACTORY_ADDRESS, EventFactoryAbi, signer);

          // Prepare mint params (customize based on your ABI)
          const tierData = tiers[selectedTier];
          const mintValue = ethers.utils.parseEther(`${tierData.price * quantity}`);

          // If contract expects structured eventData, serialize as needed
          // Example mint function: createEvent or mintTicket
          // Check your actual contract ABI function name and params
          const tx = await eventFactory.createEvent({
            // You may need to provide full struct for event
            name: eventData.name,
            symbol: eventData.symbol || "EVT",
            maxSupply: quantity,
            baseMintPrice: ethers.utils.parseEther(`${tierData.price}`),
            organizerPercentage: eventData.organizerPercentage || 10,
            royaltyFeePercentage: eventData.royaltyFeePercentage || 5,
            eventStartTime: Math.floor(new Date(eventData.date).getTime() / 1000),
            eventEndTime: Math.floor(new Date(eventData.date).getTime() / 1000) + 3600 * 3,
            maxMintsPerUser: 1,
            vipConfig: {
              totalVIPSeats: 0,
              vipSeatStart: 0,
              vipSeatEnd: 0,
              vipHoldingPeriod: 0,
              vipPriceMultiplier: 0,
              vipEnabled: false
            },
            waitlistEnabled: false,
            whitelistSaleDuration: 0,
            initialWhitelist: [],
            venue: eventData.venue || "",
            eventDescription: eventData.description || "",
            templateId: 0,
            seriesName: "",
          }, { value: mintValue });

          await tx.wait();

          alert(`🎉 Successfully minted ${selectedTier} NFT ticket for ${eventData.name}!`);
          navigate('/profile');
        } else {
          alert("MetaMask is not available. Please install or unlock your wallet.");
        }
      }
    } catch (err) {
      console.error('Minting failed:', err);
      alert("❌ Failed to mint NFT. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalPrice = tiers[selectedTier].price * quantity;

  return (
    <>
      {/* Your unchanged UI: display event info, tiers, etc */}
      <div className="section external-mint-section">
        {/* ...snip (UI code unchanged)... */}

        {/* Mint Button */}
        <div className="mint-actions">
          <button 
            className="btn btn-primary btn-large"
            onClick={handleMintNFT}
            disabled={isProcessing}
          >
            {isProcessing ? "🔄 Minting..." : `🎟️ Mint NFT Ticket (${totalPrice.toFixed(3)} ◎)`}
          </button>
        </div>
        {/* ...snip */}
      </div>

      <HumanVerification
        isOpen={isVerificationOpen}
        onVerified={handleVerified}
        onClose={handleClose}
      />
    </>
  );
};

export default ExternalEventMint;
