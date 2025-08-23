// src/components/EventMarketplaceDetails.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
 // Use v5 or v6 as per your setup
import SeatSelector from "./SeatSelector";
import EventFactoryAbi from "../abifiles/EventFactory.json";
import TicketAbi from "../abifiles/TicketMarketplace.json"; // or your EventTicket ABI

import { JsonRpcProvider } from "ethers";

const provider = new JsonRpcProvider("https://api.avax.network/ext/bc/C/rpc");



// CHANGE THIS to your EventFactory contract address
const EVENT_FACTORY_ADDRESS = "0xYourEventFactoryAddress";

export default function EventMarketplaceDetails() {
  const { id } = useParams(); // id = event contract address
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState("all");
  const [activeTicket, setActiveTicket] = useState(null);
  const [showSelector, setShowSelector] = useState(false);

  // Read all ticket/seats from blockchain
  useEffect(() => {
    async function fetchTickets() {
      try {
        // Get contract instance for the event
        const ticketContract = new ethers.Contract(id, TicketAbi, provider);

        // Example: If contract has getAvailableSeats() or similar
        // Otherwise, adapt to your seat/ticket read method
        let seats = [];
        // Multi-seat contracts might have getTickets(), getSeats(), etc
        if (ticketContract.getAvailableSeats) {
          const seatArr = await ticketContract.getAvailableSeats();
          seats = seatArr.map(seat => ({
            seatNumber: seat.number,
            tier: seat.tier, // May need mapping to "VIP"/"Normal"
            price: ethers.utils.formatEther(seat.price),
          }));
        } else {
          // Fallback/hardcoded sample
          seats = [
            { seatNumber: 12, tier: "VIP", price: 0.5 },
            { seatNumber: 101, tier: "Normal", price: 0.1 },
            // ...
          ];
        }

        setTickets(seats);
      } catch (e) {
        alert("Failed to load tickets from blockchain");
        setTickets([]);
      }
    }
    fetchTickets();
  }, [id]);

  const filtered = tickets.filter(t => filter === "all" ? true : t.tier.toLowerCase() === filter);

  const handleBuy = ticket => {
    setActiveTicket(ticket);
    setShowSelector(true);
  };

  // Booking function to interact with blockchain when user selects & confirms seat
  async function handleBooking(seatNumber, price) {
    try {
      // Use ethers.js + MetaMask (window.ethereum) for signing txs
      if (window.ethereum) {
        const signer = (new ethers.providers.Web3Provider(window.ethereum)).getSigner();
        const ticketContract = new ethers.Contract(id, TicketAbi, signer);

        // Example function: buyTicket(seatNumber) payable
        // You may need to send {value: price} to contract if it's payable
        const tx = await ticketContract.buyTicket(seatNumber, {
          value: ethers.utils.parseEther(price.toString())
        });
        await tx.wait();
        alert("Booked successfully!");
      } else {
        alert("MetaMask not found. Please install or unlock your wallet.");
      }
    } catch (e) {
      alert("Booking failed: " + (e.message || ""));
    }
  }

  return (
    <div className="event-marketplace-container">
      <button onClick={() => navigate(-1)}>← Back</button>
      <h1>Available Tickets</h1>

      {/* Tier Filters */}
      <div className="filters">
        {["all","vip","normal"].map(t => (
          <button
            key={t}
            className={filter===t?"active":""}
            onClick={()=>setFilter(t)}
          >
            {t==="all"?"All":t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Ticket Grid */}
      <div className="nft-grid">
        {filtered.map(ticket => (
          <div key={ticket.seatNumber} className="nft-card">
            <div className={`tier-badge ${ticket.tier.toLowerCase()}`}>{ticket.tier}</div>
            <div className="seat-label">Seat {ticket.seatNumber}</div>
            <div className="price">{ticket.price} AVAX</div>
            <button onClick={() => handleBuy(ticket)}>Buy Now</button>
          </div>
        ))}
        {filtered.length===0 && <p>No tickets available.</p>}
      </div>

      {/* Seat Selector Modal */}
      {showSelector && activeTicket && (
        <div className="modal-overlay" onClick={()=>setShowSelector(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <button className="close" onClick={()=>setShowSelector(false)}>×</button>
            <h2>Select Your Seat</h2>
            <p>Tier: {activeTicket.tier}</p>
            <SeatSelector
              seatMap={[{
                id: activeTicket.seatNumber,
                label: `${activeTicket.seatNumber}`,
                type: activeTicket.tier,
                row: 1,
                col: activeTicket.seatNumber,
                taken: false,
                price: activeTicket.price
              }]}
              selectedTier={activeTicket.tier}
              onSelectionChange={async (seats) => {
                // seats = [seatNumber] array
                await handleBooking(seats[0], activeTicket.price);
                setShowSelector(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
