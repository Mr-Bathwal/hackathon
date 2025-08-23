import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import eventFactoryAbi from "../abifiles/EventFactory.json";
import marketplaceAbi from "../abifiles/TicketMarketplace.json";
import erc721Abi from "../abifiles/ERC721.json";

const EVENT_FACTORY_ADDRESS = import.meta.env.VITE_EVENT_FACTORY_ADDRESS;
const MARKETPLACE_ADDRESS = import.meta.env.VITE_TICKET_MARKETPLACE_ADDRESS;

export default function AuctionChamber() {
  const navigate = useNavigate();

  // Blockchain connection and state
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState("");
  const [marketplace, setMarketplace] = useState(null);
  const [eventFactory, setEventFactory] = useState(null);

  // Data states
  const [heldNfts, setHeldNfts] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [displayAuctions, setDisplayAuctions] = useState([]);

  // UI states
  const [mode, setMode] = useState("browse");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const [selectedNft, setSelectedNft] = useState(null);
  const [listingType, setListingType] = useState("fixed");
  const [listPrice, setListPrice] = useState("");
  const [auctionDuration, setAuctionDuration] = useState("7");
  const [showSellModal, setShowSellModal] = useState(false);

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Connect to wallet and initialize contracts
  async function connectWallet() {
    if (!window.ethereum) {
      alert("MetaMask not found. Please install MetaMask.");
      return;
    }
    try {
      const prov = new ethers.providers.Web3Provider(window.ethereum);
      await prov.send("eth_requestAccounts", []);
      const signer = prov.getSigner();
      const acct = await signer.getAddress();

      const marketplaceContract = new ethers.Contract(
        MARKETPLACE_ADDRESS,
        marketplaceAbi,
        signer
      );
      const eventFactoryContract = new ethers.Contract(
        EVENT_FACTORY_ADDRESS,
        eventFactoryAbi,
        signer
      );

      setProvider(prov);
      setSigner(signer);
      setAccount(acct);
      setMarketplace(marketplaceContract);
      setEventFactory(eventFactoryContract);
      setErrorMsg("");
    } catch (e) {
      console.error("Wallet connection error:", e);
      setErrorMsg("Failed to connect wallet.");
      alert("Failed to connect wallet");
    }
  }

  // Format timestamp to local date string
  function formatTime(timestamp) {
    if (!timestamp) return "--";
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  }

  // Format Wei to Ether string
  function formatEtherPrice(priceInWei) {
    if (!priceInWei) return "0 ETH";
    return ethers.utils.formatEther(priceInWei) + " ETH";
  }

  // Load organizer's NFT events and their auction info
  async function loadUserAssets() {
    if (!eventFactory || !marketplace || !account) return;

    setLoading(true);
    setErrorMsg("");
    try {
      const eventAddresses = await eventFactory.getOrganizerEvents(account);
      let allNfts = [];

      for (const eventAddress of eventAddresses) {
        const eventContract = new ethers.Contract(eventAddress, erc721Abi, signer);
        let supply;
        try {
          supply = await eventContract.totalSupply();
        } catch {
          supply = 0;
        }

        for (let i = 0; i < supply; i++) {
          const tokenId = i;
          let metadata = {};
          try {
            const tokenUri = await eventContract.tokenURI(tokenId);
            metadata = await fetch(tokenUri)
              .then((res) => res.json())
              .catch(() => ({}));
          } catch {
            metadata = {};
          }

          let auctionInfo = {};
          try {
            auctionInfo = await marketplace.getAuctionInfo(eventAddress, tokenId);
          } catch {
            auctionInfo = {};
          }

          allNfts.push({
            id: `${eventAddress}_${tokenId}`,
            eventAddress,
            tokenId,
            event: metadata.name || "Unknown Event",
            seat: metadata.seat || `Seat ${tokenId}`,
            image: metadata.image || "",
            perks: metadata.perks || [],
            listed: auctionInfo.status && auctionInfo.status !== 0,
            currentBid: auctionInfo.highestBid
              ? Number(ethers.utils.formatEther(auctionInfo.highestBid))
              : 0,
            tier: metadata.tier || "Normal",
            auctionInfo,
            lastSold: 0,
            recommended: 0,
          });
        }
      }

      setHeldNfts(allNfts);
      const listedNFTs = allNfts.filter((nft) => nft.listed);
      setAuctions(listedNFTs);
      setDisplayAuctions(listedNFTs);
    } catch (err) {
      console.error("Error fetching user assets:", err);
      setErrorMsg("Error loading your NFTs and auctions.");
    } finally {
      setLoading(false);
    }
  }

  // Effect: Initialize connection on mount
  useEffect(() => {
    connectWallet();

    // Listen for account or chain changes to refresh
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", () => {
        window.location.reload();
      });
      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }
    // Cleanup listeners on unmount
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", () => {});
        window.ethereum.removeListener("chainChanged", () => {});
      }
    };
  }, []);

  // Load user assets when contracts & account ready
  useEffect(() => {
    if (eventFactory && marketplace && account) {
      loadUserAssets();
    }
  }, [eventFactory, marketplace, account]);

  // Filter auctions based on filter criteria
  useEffect(() => {
    if (!auctions) return;
    switch (activeFilter) {
      case "ending":
        setDisplayAuctions(
          auctions.filter(
            (a) =>
              a.auctionInfo.endTime &&
              a.auctionInfo.endTime * 1000 - Date.now() < 3600000
          )
        );
        break;
      case "popular":
        setDisplayAuctions([...auctions].sort((a, b) => b.currentBid - a.currentBid));
        break;
      case "vip":
        setDisplayAuctions(auctions.filter((a) => a.tier === "VIP"));
        break;
      case "normal":
        setDisplayAuctions(auctions.filter((a) => a.tier === "Normal"));
        break;
      default:
        setDisplayAuctions(auctions);
    }
  }, [activeFilter, auctions]);

  // Place bid on selected auction
  async function placeBid() {
    setErrorMsg("");
    if (!bidAmount || isNaN(bidAmount)) {
      setErrorMsg("Invalid bid amount.");
      return;
    }
    const minBid = Number(selectedAuction.currentBid) + 0.05;
    if (+bidAmount < minBid) {
      setErrorMsg(`Bid must be at least ${minBid.toFixed(2)} ETH.`);
      return;
    }
    setLoading(true);
    try {
      const tx = await marketplace.placeBid(
        selectedAuction.auctionInfo.tokenContract,
        selectedAuction.auctionInfo.tokenId,
        { value: ethers.utils.parseEther(bidAmount) }
      );
      await tx.wait();
      alert("Bid placed successfully!");
      setSelectedAuction(null);
      setBidAmount("");
      await loadUserAssets();
    } catch (error) {
      console.error(error);
      setErrorMsg("Failed to place bid.");
    } finally {
      setLoading(false);
    }
  }

  // List NFT for fixed price sale or auction
  async function listNFT() {
    setErrorMsg("");
    if (!listPrice || isNaN(listPrice)) {
      setErrorMsg("Invalid price input.");
      return;
    }
    setLoading(true);
    try {
      if (listingType === "fixed") {
        const tx = await marketplace.listItemFixedPrice(
          selectedNft.eventAddress,
          selectedNft.tokenId,
          ethers.utils.parseEther(listPrice)
        );
        await tx.wait();
        alert("NFT listed for fixed price.");
      } else {
        const durationSec = Number(auctionDuration) * 24 * 3600; // days to seconds
        const tx = await marketplace.createAuction(
          selectedNft.eventAddress,
          selectedNft.tokenId,
          ethers.utils.parseEther(listPrice),
          0, // reservePrice
          durationSec,
          ethers.utils.parseEther("0.01") // minBidIncrement
        );
        await tx.wait();
        alert("Auction started.");
      }
      setShowSellModal(false);
      setSelectedNft(null);
      setListPrice("");
      setAuctionDuration("7");
      setListingType("fixed");
      await loadUserAssets();
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to list NFT.");
    } finally {
      setLoading(false);
    }
  }

  // Navigate to detailed event marketplace page
  function handleViewDetails(auction) {
    const slug = auction.event.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    navigate(`/event-marketplace/${slug}`, {
      state: { event: auction.event, auctions: auctions.filter((a) => a.event === auction.event) },
    });
  }

  return (
    <div className="marketplace-container" style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Your Auction Chamber</h1>

      {errorMsg && <div style={{ color: "red", marginBottom: "1em" }}>{errorMsg}</div>}

      {loading && <p style={{ color: "blue" }}>Loading, please wait...</p>}

      <div style={{ marginBottom: "1em" }}>
        <button onClick={() => setActiveFilter("all")} disabled={activeFilter === "all"}>
          All
        </button>
        <button onClick={() => setActiveFilter("ending")} disabled={activeFilter === "ending"}>
          Ending Soon
        </button>
        <button onClick={() => setActiveFilter("popular")} disabled={activeFilter === "popular"}>
          Popular
        </button>
        <button onClick={() => setActiveFilter("vip")} disabled={activeFilter === "vip"}>
          VIP
        </button>
        <button onClick={() => setActiveFilter("normal")} disabled={activeFilter === "normal"}>
          Normal
        </button>
      </div>

      {displayAuctions.length === 0 && <p>No auctions found for selected filter.</p>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {displayAuctions.map((auction) => (
          <li
            key={auction.id}
            onClick={() => handleViewDetails(auction)}
            style={{
              border: "1px solid #ddd",
              padding: "1em",
              marginBottom: "1em",
              borderRadius: "5px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <img
              src={auction.image}
              alt={auction.event}
              style={{ width: 100, height: 100, marginRight: "1em", borderRadius: "8px", objectFit: "cover" }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/default-nft.png";
              }}
            />
            <div style={{ flex: 1 }}>
              <h3>{auction.event}</h3>
              <p>Seat: {auction.seat}</p>
              <p>Tier: {auction.tier}</p>
              <p>Current Bid: {auction.currentBid.toFixed(3)} ETH</p>
              <p>Auction Ends: {formatTime(auction.auctionInfo.endTime)}</p>
            </div>
          </li>
        ))}
      </ul>

      {/* Bid Modal */}
      {selectedAuction && (
        <div className="modal" style={modalStyle}>
          <h2>Place a Bid for {selectedAuction.event} (Token #{selectedAuction.tokenId})</h2>
          <input
            type="number"
            step="0.01"
            min={Number(selectedAuction.currentBid) + 0.05}
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            disabled={loading}
            style={inputStyle}
          />
          <div style={{ margin: "0.5em 0", color: "red" }}>{errorMsg}</div>
          <button onClick={placeBid} disabled={loading} style={buttonStyle}>
            {loading ? "Placing Bid..." : "Place Bid"}
          </button>
          <button
            onClick={() => {
              setSelectedAuction(null);
              setBidAmount("");
              setErrorMsg("");
            }}
            disabled={loading}
            style={{ ...buttonStyle, marginLeft: "1em", backgroundColor: "#ccc", color: "#333" }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Sell Modal */}
      {showSellModal && selectedNft && (
        <div className="modal" style={modalStyle}>
          <h2>List NFT for Sale or Auction</h2>
          <p>
            NFT: {selectedNft.event} - Token #{selectedNft.tokenId}
          </p>
          <label>
            Price (ETH):
            <input
              type="number"
              step="0.01"
              value={listPrice}
              onChange={(e) => setListPrice(e.target.value)}
              disabled={loading}
              style={inputStyle}
            />
          </label>
          <div>
            <label>
              <input
                type="radio"
                value="fixed"
                checked={listingType === "fixed"}
                onChange={() => setListingType("fixed")}
                disabled={loading}
              />
              Fixed Price
            </label>
            <label style={{ marginLeft: "1em" }}>
              <input
                type="radio"
                value="auction"
                checked={listingType === "auction"}
                onChange={() => setListingType("auction")}
                disabled={loading}
              />
              Auction
            </label>
          </div>
          {listingType === "auction" && (
            <label>
              Duration (days):
              <input
                type="number"
                min={1}
                max={30}
                value={auctionDuration}
                onChange={(e) => setAuctionDuration(e.target.value)}
                disabled={loading}
                style={inputStyle}
              />
            </label>
          )}
          <div style={{ margin: "0.5em 0", color: "red" }}>{errorMsg}</div>
          <button onClick={listNFT} disabled={loading} style={buttonStyle}>
            {loading ? "Processing..." : "List NFT"}
          </button>
          <button
            onClick={() => {
              setShowSellModal(false);
              setSelectedNft(null);
              setListPrice("");
              setAuctionDuration("7");
              setListingType("fixed");
              setErrorMsg("");
            }}
            disabled={loading}
            style={{ ...buttonStyle, marginLeft: "1em", backgroundColor: "#ccc", color: "#333" }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Held NFTs List - Optional UI to open sell modal */}
      <hr />
      <h2>Your Held NFTs</h2>
      {loading && !heldNfts.length ? (
        <p>Loading your NFTs...</p>
      ) : heldNfts.length === 0 ? (
        <p>You don't hold any NFTs from your events.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {heldNfts.map((nft) => (
            <li
              key={nft.id}
              onClick={() => {
                setSelectedNft(nft);
                setShowSellModal(true);
              }}
              style={{
                border: "1px solid #ddd",
                padding: "0.75em",
                marginBottom: "0.75em",
                borderRadius: "5px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <img
                src={nft.image}
                alt={nft.event}
                style={{
                  width: 60,
                  height: 60,
                  marginRight: "1em",
                  borderRadius: "8px",
                  objectFit: "cover",
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/default-nft.png";
                }}
              />
              <div style={{ flex: 1 }}>
                <b>{nft.event}</b> (Token #{nft.tokenId})
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Basic inline styles for modal and buttons
const modalStyle = {
  backgroundColor: "#fff",
  padding: "1em 2em",
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
  borderRadius: "8px",
  zIndex: 1000,
  width: "90%",
  maxWidth: "400px",
};

const inputStyle = {
  width: "100%",
  padding: "0.5em",
  margin: "0.3em 0 1em 0",
  borderRadius: "4px",
  border: "1px solid #ccc",
  fontSize: "1em",
};

const buttonStyle = {
  padding: "0.6em 1.2em",
  borderRadius: "4px",
  border: "none",
  backgroundColor: "#007bff",
  color: "#fff",
  cursor: "pointer",
  fontSize: "1em",
};
