import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BrowserProvider, Contract, formatEther } from "ethers";
import eventFactoryAbi from "../abifiles/EventFactory.json";
import erc721Abi from "../abifiles/ERC721.json";

const EVENT_FACTORY_ADDRESS = import.meta.env.VITE_EVENT_FACTORY_ADDRESS;

const SEAT_CATEGORIES = [
  { value: "VIP", label: "VIP", emoji: "👑", color: "#ffe066" },
  { value: "Normal", label: "Normal", emoji: "🎟️", color: "#ececec" },
];

const CreatedEvents = () => {
  const [events, setEvents] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [eventFactory, setEventFactory] = useState(null);

  useEffect(() => {
    async function init() {
      if (!window.ethereum) {
        alert("Please install MetaMask");
        return;
      }
      // ethers v6 provider/signer
      const prov = new BrowserProvider(window.ethereum);
      const signer = await prov.getSigner();
      const acct = await signer.getAddress();
      const factory = new Contract(EVENT_FACTORY_ADDRESS, eventFactoryAbi, signer);

      setAccount(acct);
      setProvider(prov);
      setEventFactory(factory);
    }
    init();
  }, []);

  useEffect(() => {
    if (account && eventFactory && provider) {
      loadEvents();
    }
    // eslint-disable-next-line
  }, [account, eventFactory, provider]);

  async function loadEvents() {
    setLoading(true);
    try {
      // Contract call arguments may differ
      // Prefer getAllOrganizerEvents (ABI must be correct)
      let eventAddresses = [];
      try {
        eventAddresses = await eventFactory.getAllOrganizerEvents(account);
      } catch {
        // fallback or error
        eventAddresses = [];
      }

      const loadedEvents = [];
      for (const eventAddr of eventAddresses) {
        const eventContract = new Contract(eventAddr, erc721Abi, provider);

        // maxSupply/totalSupply
        let maxSupply = 0n;
        try {
          maxSupply = await eventContract.totalSupply();
        } catch { /* ignore */ }

        // event metrics
        let metrics = {};
        try {
          metrics = await eventFactory.eventMetrics?.(eventAddr) || {};
        } catch { /* ignore */ }

        // fetch IPFS/URL metadata from first token
        let metadata = null;
        try {
          if (Number(maxSupply) > 0 && eventContract.tokenByIndex && eventContract.tokenURI) {
            const tokenId = await eventContract.tokenByIndex(0);
            const tokenURI = await eventContract.tokenURI(tokenId);
            if (tokenURI) {
              const response = await fetch(tokenURI);
              if (response.ok) {
                metadata = await response.json();
              }
            }
          }
        } catch {
          metadata = null;
        }

        // Compose seat summary
        let seatData = {};
        if (metadata?.seats && Array.isArray(metadata.seats)) {
          seatData = metadata.seats.reduce((acc, seat) => {
            acc[seat.category] = (acc[seat.category] || 0) + 1;
            return acc;
          }, {});
        }

        // Dates
        const eventStartTime = metadata?.eventStartTime ? new Date(Number(metadata.eventStartTime) * 1000) : null;
        const eventEndTime = metadata?.eventEndTime ? new Date(Number(metadata.eventEndTime) * 1000) : null;

        // Status
        const now = new Date();
        let status = "draft";
        if (eventStartTime && eventEndTime) {
          if (now < eventStartTime) status = "upcoming";
          else if (now >= eventStartTime && now <= eventEndTime) status = "live";
          else status = "ended";
        }

        loadedEvents.push({
          id: eventAddr,
          name: metadata?.name || `Event ${eventAddr.slice(0, 6)}`,
          status,
          date: eventStartTime ? eventStartTime.toISOString() : new Date().toISOString(),
          venue: metadata?.venue || "Unknown Venue",
          category: metadata?.category || "General",
          symbol: metadata?.symbol || "SYM",
          image: metadata?.image,
          mintPrice: metadata?.mintPrice ? formatEther(BigInt(metadata.mintPrice)) : "0.1",
          maxSupply: Number(maxSupply),
          orgPercent: metadata?.organizerPercentage || 0,
          royaltyFee: metadata?.royaltyFeePercentage || 0,
          seatData,
          ticketsSold: metrics?.totalTicketsSold ? Number(metrics.totalTicketsSold) : 0,
          revenue: metrics?.totalRevenue ? parseFloat(formatEther(BigInt(metrics.totalRevenue))) : 0,
          attendees: 0,
          earlyBird: metadata?.earlyBird || { active: false, discount: 0 },
        });
      }
      setEvents(loadedEvents);
    } catch (error) {
      console.error("Loading events failed", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  const getStatusCssClass = (status) => {
    switch (status) {
      case "live":
        return "status-live";
      case "upcoming":
        return "status-upcoming";
      case "ended":
        return "status-ended";
      case "draft":
      default:
        return "status-draft";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredEvents =
    activeFilter === "all" ? events : events.filter((e) => e.status === activeFilter);

  return (
    <div className="content">
      <div className="created-events-header">
        <div className="header-content">
          <div className="header-icon">🎭</div>
          <h1>Created Events</h1>
          <p className="header-subtitle">Your on-chain event marketplace</p>
          <div className="header-chips">
            {[
              { key: "all", label: "All Events", count: events.length },
              {
                key: "live",
                label: "Live Now",
                count: events.filter((e) => e.status === "live").length,
              },
              {
                key: "upcoming",
                label: "Upcoming",
                count: events.filter((e) => e.status === "upcoming").length,
              },
              {
                key: "ended",
                label: "Ended",
                count: events.filter((e) => e.status === "ended").length,
              },
              {
                key: "draft",
                label: "Draft",
                count: events.filter((e) => e.status === "draft").length,
              },
            ].map((filter) => (
              <button
                key={filter.key}
                className={`filter-chip ${activeFilter === filter.key ? "active" : ""}`}
                onClick={() => setActiveFilter(filter.key)}
                type="button"
              >
                {filter.label}
                <span className="filter-count">{filter.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="content">
          <div className="created-events-loading">
            <div className="loading-spinner">🎪</div>
            <p>Loading your events...</p>
          </div>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="empty-state">
          <h2>
            No events found
            {activeFilter !== "all" ? ` for '${activeFilter}'` : ""}
          </h2>
          <Link to="/create-event" className="btn btn-primary">
            Create New Event
          </Link>
        </div>
      ) : (
        <div className="created-events-grid">
          {filteredEvents.map((event) => (
            <div key={event.id} className="created-event-card magiceden-card">
              <div className="event-card-image">
                <img
                  src={
                    event.image ||
                    "https://images.unsplash.com/photo-1516450360452-931a6e72e7c7?w=400&h=300"
                  }
                  alt={event.name}
                />
                <div className={`event-status-badge ${getStatusCssClass(event.status)}`}>
                  {event.status.toUpperCase()}
                </div>
              </div>
              <div className="event-card-content">
                <div className="event-card-header">
                  <h3 className="event-card-title">
                    {event.name}
                    <span className="verified-badge">🔹</span>
                  </h3>
                  <span className="symbol">{event.symbol || "SYM"}</span>
                </div>

                <div className="event-meta">
                  <span>📅 {formatDate(event.date)}</span>
                  <span>🏟️ {event.venue}</span>
                  <span>🏷️ {event.category}</span>
                </div>

                <div className="mint-info">
                  <span>Mint Price: {event.mintPrice} ◎</span>
                  <span>Max Supply: {event.maxSupply}</span>
                </div>

                <div className="royalty-info">
                  <span>Organizer %: {event.orgPercent}%</span>
                  <span>Royalty Fee: {event.royaltyFee}%</span>
                </div>

                <div className="seat-overview">
                  {SEAT_CATEGORIES.map(({ label, emoji, value, color }) => (
                    <span
                      key={value}
                      style={{
                        backgroundColor: color,
                        padding: "5px 10px",
                        marginRight: 5,
                        borderRadius: 5,
                      }}
                    >
                      {emoji} {label}: {event.seatData[value] ?? 0}
                    </span>
                  ))}
                </div>

                <div className="stats">
                  <span>Sold: {event.ticketsSold}</span>
                  <span>Revenue: {event.revenue.toFixed(2)} ◎</span>
                  <span>Attendees: {event.attendees}</span>
                </div>

                {event.earlyBird?.active && (
                  <div className="early-bird-discount">🐦 Early Bird: {event.earlyBird.discount}%</div>
                )}

                <div className="actions">
                  {event.status === "draft" ? (
                    <>
                      <Link to={`/create-event?edit=${event.id}`} className="btn btn-primary">
                        Edit Draft
                      </Link>
                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          if (window.confirm("Are you sure you want to delete this draft?")) {
                            // Optional: Add deletion logic here
                          }
                        }}
                        type="button"
                      >
                        Delete Draft
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to={`/event/${event.id}`} className="btn btn-primary">
                        View Event
                      </Link>
                      <Link to={`/event/${event.id}/analytics`} className="btn btn-secondary">
                        View Analytics
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CreatedEvents;
