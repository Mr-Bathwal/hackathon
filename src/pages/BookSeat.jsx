import React, { useState } from "react";
import { getContract } from "../utils/web3";

export default function BookSeat({ eventId, priceWei }) {
  const [seatNumber, setSeatNumber] = useState("");
  const [txStatus, setTxStatus] = useState("");

  const handleBook = async () => {
    setTxStatus("");
    // validate numeric input
    const num = parseInt(seatNumber, 10);
    if (isNaN(num) || num < 1 || num > 100) {
      return setTxStatus("❌ Enter a valid seat number (1–100).");
    }

    try {
      const contract = getContract();
      // call bookSeat(eventId, seatNumber)
      const tx = await contract.bookSeat(eventId, num, {
        value: priceWei
      });
      await tx.wait();
      setTxStatus("✅ Booking successful for seat " + num);
    } catch (err) {
      setTxStatus("❌ Booking failed: " + err.message);
    }
  };

  return (
    <div className="book-seat">
      <h3>Book a Seat</h3>
      <input
        type="number"
        min="1"
        max="100"
        value={seatNumber}
        onChange={e => setSeatNumber(e.target.value)}
        placeholder="Seat number (1–100)"
      />
      <button onClick={handleBook}>Book</button>
      {txStatus && <p className="tx-status">{txStatus}</p>}
    </div>
  );
}
