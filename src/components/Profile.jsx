import React, { useState } from "react";
import { useAccount } from "wagmi";
import { useNavigate } from "react-router-dom";

// Mock NFT data with VIP and Normal types
const MOCK_HELD_NFTS = [
  {
    id: "n1",
    name: "VIP Experience #142",
    event: "Crypto Music Fest 2025",
    seat: "R1C12",
    type: "VIP",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop",
    rarity: "Legendary",
    attributes: [
      { type: "Access Level", value: "VIP" },
      { type: "Section", value: "Front Row" },
      { type: "Perks", value: "Meet & Greet" },
      { type: "Date", value: "Dec 2025" }
    ],
    mintDate: "2025-01-15",
    lastSale: 2.5,
    floor: 2.0,
    listed: false
  },
  {
    id: "n2", 
    name: "Standard Pass #308",
    event: "Digital Art Expo",
    seat: "R7C15",
    type: "Normal",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop",
    rarity: "Common",
    attributes: [
      { type: "Access Level", value: "General" },
      { type: "Section", value: "Main Floor" },
      { type: "Perks", value: "Standard Access" },
      { type: "Date", value: "Nov 2025" }
    ],
    mintDate: "2025-01-20",
    lastSale: 1.2,
    floor: 1.0,
    listed: true,
    listingPrice: 1.5
  },
  {
    id: "n3",
    name: "VIP Platinum #075",
    event: "Web3 Conference",
    seat: "R2C8",
    type: "VIP",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=200&fit=crop",
    rarity: "Rare",
    attributes: [
      { type: "Access Level", value: "VIP Platinum" },
      { type: "Section", value: "Premium" },
      { type: "Perks", value: "Full Access" },
      { type: "Date", value: "Jan 2026" }
    ],
    mintDate: "2025-01-10",
    lastSale: 3.2,
    floor: 2.8,
    listed: false
  }
];

// Mock activity data
const MOCK_ACTIVITY = [
  {
    id: "a1",
    type: "mint",
    item: "VIP Experience #142",
    price: 2.0,
    from: null,
    to: "You",
    timestamp: "2025-01-15T10:30:00Z",
    txHash: "0x1234...5678"
  },
  {
    id: "a2", 
    type: "list",
    item: "Standard Pass #308",
    price: 1.5,
    from: "You",
    to: null,
    timestamp: "2025-01-22T14:20:00Z",
    txHash: "0xabcd...efgh"
  },
  {
    id: "a3",
    type: "sale",
    item: "Rock Concert #421",
    price: 1.8,
    from: "You",
    to: "0x9876...4321",
    timestamp: "2025-01-18T16:45:00Z", 
    txHash: "0xijkl...mnop"
  }
];

// Mock offers data
const MOCK_OFFERS = [
  {
    id: "o1",
    item: "VIP Experience #142",
    from: "0xabc1...def2",
    price: 2.2,
    expiry: "2025-01-30T23:59:59Z",
    timestamp: "2025-01-25T10:00:00Z"
  },
  {
    id: "o2",
    item: "VIP Platinum #075", 
    from: "0x1234...5678",
    price: 3.0,
    expiry: "2025-02-01T23:59:59Z",
    timestamp: "2025-01-26T15:30:00Z"
  }
];

export default function Profile() {
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [activeTab, setActiveTab] = useState("collected");
  const [typeFilter, setTypeFilter] = useState("all");
  const [activityFilter, setActivityFilter] = useState("all");

  if (!isConnected) {
    return (
      <div className="profile-page">
        <div className="connect-prompt">
          <div className="prompt-content">
            <div className="prompt-icon">👛</div>
            <h2>Connect Your Wallet</h2>
            <p>Connect your wallet to view your NFT collection and activity</p>
            <button 
              className="btn-primary"
              onClick={() => navigate("/")}
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

  const handleSell = (nft) => {
    navigate("/auction", { state: { nft, mode: "sell" } });
  };

  const handleTransfer = (nft) => {
    // Implement transfer logic
    alert(`Transfer functionality for ${nft.name} - Coming soon!`);
  };

  const getFilteredNFTs = () => {
    if (typeFilter === "all") return MOCK_HELD_NFTS;
    return MOCK_HELD_NFTS.filter(nft => nft.type.toLowerCase() === typeFilter);
  };

  const getFilteredActivity = () => {
    if (activityFilter === "all") return MOCK_ACTIVITY;
    return MOCK_ACTIVITY.filter(activity => activity.type === activityFilter);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'mint': return '🎨';
      case 'list': return '🏷️';
      case 'sale': return '💰';
      case 'transfer': return '📤';
      case 'bid': return '🔨';
      default: return '📝';
    }
  };

  const getActivityLabel = (type) => {
    switch (type) {
      case 'mint': return 'Minted';
      case 'list': return 'Listed';
      case 'sale': return 'Sold';
      case 'transfer': return 'Transferred';
      case 'bid': return 'Bid Placed';
      default: return 'Activity';
    }
  };

  const getRarityClass = (rarity) => {
    return rarity?.toLowerCase() || 'common';
  };

  const getTypeIcon = (type) => {
    return type === "VIP" ? "👑" : "🎫";
  };

  return (
    <div className="profile-page">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-banner"></div>
        <div className="profile-info">
          <div className="profile-avatar">
            <div className="avatar-placeholder">{shortAddress.slice(0, 2).toUpperCase()}</div>
          </div>
          <div className="profile-details">
            <div className="profile-name">
              <h1>{username || `User ${shortAddress}`}</h1>
              <div className="profile-address">{shortAddress}</div>
            </div>
            <div className="profile-stats">
              <div className="stat">
                <div className="stat-number">{MOCK_HELD_NFTS.length}</div>
                <div className="stat-label">Items</div>
              </div>
              <div className="stat">
                <div className="stat-number">{MOCK_HELD_NFTS.filter(nft => nft.type === "VIP").length}</div>
                <div className="stat-label">VIP</div>
              </div>
              <div className="stat">
                <div className="stat-number">{MOCK_HELD_NFTS.filter(nft => nft.listed).length}</div>
                <div className="stat-label">Listed</div>
              </div>
              <div className="stat">
                <div className="stat-number">{MOCK_ACTIVITY.filter(a => a.type === 'sale').length}</div>
                <div className="stat-label">Sold</div>
              </div>
            </div>
          </div>
          <div className="profile-actions">
            <button className="btn-secondary">Share Profile</button>
            <button className="btn-primary">Edit Profile</button>
          </div>
        </div>
      </div>

      {/* Username Section */}
      <div className="username-section">
        <div className="username-form">
          <label>Display Name</label>
          <div className="input-group">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your display name"
              className="username-input"
            />
            <button className="btn-save">Save</button>
          </div>
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="profile-tabs">
        <button 
          className={`tab ${activeTab === "collected" ? "active" : ""}`}
          onClick={() => setActiveTab("collected")}
        >
          <span className="tab-icon">🎨</span>
          <span className="tab-label">Collected ({MOCK_HELD_NFTS.length})</span>
        </button>
        <button 
          className={`tab ${activeTab === "activity" ? "active" : ""}`}
          onClick={() => setActiveTab("activity")}
        >
          <span className="tab-icon">📈</span>
          <span className="tab-label">Activity</span>
        </button>
        <button 
          className={`tab ${activeTab === "offers" ? "active" : ""}`}
          onClick={() => setActiveTab("offers")}
        >
          <span className="tab-icon">💌</span>
          <span className="tab-label">Offers ({MOCK_OFFERS.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Collected Tab */}
        {activeTab === "collected" && (
          <div className="collected-section">
            <div className="collection-filters">
              <div className="filter-group">
                <label>Filter by Type</label>
                <div className="filter-buttons">
                  <button 
                    className={`filter-btn ${typeFilter === "all" ? "active" : ""}`}
                    onClick={() => setTypeFilter("all")}
                  >
                    All ({MOCK_HELD_NFTS.length})
                  </button>
                  <button 
                    className={`filter-btn ${typeFilter === "vip" ? "active" : ""}`}
                    onClick={() => setTypeFilter("vip")}
                  >
                    👑 VIP ({MOCK_HELD_NFTS.filter(nft => nft.type === "VIP").length})
                  </button>
                  <button 
                    className={`filter-btn ${typeFilter === "normal" ? "active" : ""}`}
                    onClick={() => setTypeFilter("normal")}
                  >
                    🎫 Normal ({MOCK_HELD_NFTS.filter(nft => nft.type === "Normal").length})
                  </button>
                </div>
              </div>
            </div>

            {getFilteredNFTs().length === 0 ? (
              <div className="empty-collection">
                <div className="empty-icon">🎟️</div>
                <h3>No Items Found</h3>
                <p>You don't have any items matching the current filter.</p>
                <button 
                  className="btn-primary"
                  onClick={() => navigate("/auction")}
                >
                  Browse Marketplace
                </button>
              </div>
            ) : (
              <div className="nft-grid">
                {getFilteredNFTs().map(nft => (
                  <div key={nft.id} className="nft-card">
                    <div className="nft-image">
                      <img src={nft.image} alt={nft.name} />
                      <div className={`nft-rarity ${getRarityClass(nft.rarity)}`}>
                        {nft.rarity}
                      </div>
                      <div className={`nft-type ${nft.type.toLowerCase()}`}>
                        {getTypeIcon(nft.type)} {nft.type}
                      </div>
                      {nft.listed && (
                        <div className="listing-badge">
                          🏷️ Listed at {nft.listingPrice} AVAX
                        </div>
                      )}
                    </div>
                    
                    <div className="nft-content">
                      <div className="nft-header">
                        <h3 className="nft-name">{nft.name}</h3>
                        <div className="nft-event">{nft.event}</div>
                      </div>
                      
                      <div className="nft-metadata">
                        <div className="metadata-item">
                          <span className="label">Seat:</span>
                          <span className="value">{nft.seat}</span>
                        </div>
                        <div className="metadata-item">
                          <span className="label">Minted:</span>
                          <span className="value">{formatDate(nft.mintDate)}</span>
                        </div>
                        <div className="metadata-item">
                          <span className="label">Last Sale:</span>
                          <span className="value">{nft.lastSale} AVAX</span>
                        </div>
                        <div className="metadata-item">
                          <span className="label">Floor:</span>
                          <span className="value">{nft.floor} AVAX</span>
                        </div>
                      </div>
                      
                      <div className="nft-attributes">
                        {nft.attributes.slice(0, 4).map((attr, idx) => (
                          <div key={idx} className="attribute">
                            <div className="attribute-type">{attr.type}</div>
                            <div className="attribute-value">{attr.value}</div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="nft-actions">
                        <button 
                          className="btn-sell"
                          onClick={() => handleSell(nft)}
                        >
                          {nft.listed ? "Update Listing" : "Sell"}
                        </button>
                        <button 
                          className="btn-transfer"
                          onClick={() => handleTransfer(nft)}
                        >
                          Transfer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === "activity" && (
          <div className="activity-section">
            <div className="activity-header">
              <h3>Recent Activity</h3>
              <select 
                className="activity-filter"
                value={activityFilter}
                onChange={(e) => setActivityFilter(e.target.value)}
              >
                <option value="all">All Activity</option>
                <option value="mint">Mints</option>
                <option value="list">Listings</option>
                <option value="sale">Sales</option>
                <option value="transfer">Transfers</option>
              </select>
            </div>
            
            <div className="activity-list">
              {getFilteredActivity().map(activity => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="activity-details">
                    <div className="activity-main">
                      <span className="activity-action">{getActivityLabel(activity.type)}</span>
                      <span className="activity-item-name">{activity.item}</span>
                      {activity.price && (
                        <span className="activity-price">{activity.price} AVAX</span>
                      )}
                    </div>
                    <div className="activity-meta">
                      <span>{formatDate(activity.timestamp)}</span>
                      {activity.from && activity.from !== "You" && (
                        <span>from {activity.from.slice(0, 6)}...{activity.from.slice(-4)}</span>
                      )}
                      {activity.to && activity.to !== "You" && (
                        <span>to {activity.to.slice(0, 6)}...{activity.to.slice(-4)}</span>
                      )}
                      <a 
                        href={`https://snowtrace.io/tx/${activity.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="activity-hash"
                      >
                        {activity.txHash.slice(0, 6)}...{activity.txHash.slice(-4)}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Offers Tab */}
        {activeTab === "offers" && (
          <div className="offers-section">
            {MOCK_OFFERS.length === 0 ? (
              <div className="empty-offers">
                <div className="empty-icon">💌</div>
                <h3>No Offers Yet</h3>
                <p>You don't have any offers on your items. List them on the marketplace to start receiving offers!</p>
                <button 
                  className="btn-primary"
                  onClick={() => navigate("/auction")}
                >
                  Go to Marketplace
                </button>
              </div>
            ) : (
              <div className="offers-list">
                {MOCK_OFFERS.map(offer => (
                  <div key={offer.id} className="offer-item">
                    <div className="offer-details">
                      <h4>{offer.item}</h4>
                      <div className="offer-info">
                        <span className="offer-price">{offer.price} AVAX</span>
                        <span className="offer-from">from {offer.from.slice(0, 6)}...{offer.from.slice(-4)}</span>
                        <span className="offer-expiry">expires {formatDate(offer.expiry)}</span>
                      </div>
                      <div className="offer-timestamp">
                        Received {formatDate(offer.timestamp)}
                      </div>
                    </div>
                    <div className="offer-actions">
                      <button className="btn-primary">Accept</button>
                      <button className="btn-secondary">Counter</button>
                      <button className="btn-decline">Decline</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}