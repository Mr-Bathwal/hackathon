import React, { useState, useEffect } from "react";

// Tier detail styles
const TYPE_DETAILS = {
  VIP: { color: "#6366f1", emoji: "👑" },
  Normal: { color: "#10b981", emoji: "🎫" }
};

function calculateGridDimensions(totalSeats) {
  const rows = Math.floor(Math.sqrt(totalSeats));
  const cols = Math.ceil(totalSeats / rows);
  return [rows, cols];
}

/**
 * seatMap item: {
 *   seatNumber: number,
 *   tier: "VIP" | "Normal",
 *   taken: boolean,
 *   price: number
 * }
 * Props:
 * - seatMap: array of seat objects as above
 * - selectedTier: filter seats by this tier or null for both
 * - maxSelect: max seats allowed
 * - onSelectionChange: emits selected seatNumbers array
 */
export default function SeatSelector({ seatMap = [], selectedTier = null, maxSelect = 6, onSelectionChange }) {
  const [selected, setSelected] = useState([]);
  const totalSeats = seatMap.length;
  const [rows, cols] = calculateGridDimensions(totalSeats);

  const toggleSeat = seatNumber => {
    const seat = seatMap.find(s => s.seatNumber === seatNumber);
    if (!seat || seat.taken) return;

    if (selectedTier && seat.tier !== selectedTier) return;

    if (selected.includes(seatNumber)) {
      setSelected(selected.filter(s => s !== seatNumber));
    } else {
      if (selected.length >= maxSelect) {
        alert(`Maximum ${maxSelect} seats can be selected.`);
        return;
      }
      setSelected([...selected, seatNumber]);
    }
  };

  useEffect(() => {
    onSelectionChange?.(selected);
  }, [selected, onSelectionChange]);

  if (!seatMap.length) return <p>No seats available from backend.</p>;

  // create grid layout with seat buttons keyed by seatNumber
  // seat numbers assumed 1…N contiguous or near contiguous

  return (
    <div>
      <div
        className="seat-grid"
        style={{
          display: "grid",
          gridTemplateRows: `repeat(${rows}, 40px)`,
          gridTemplateColumns: `repeat(${cols}, 40px)`,
          gap: "6px",
          justifyContent: "center"
        }}
      >
        {seatMap.map(({ seatNumber, tier, taken }) => {
          const isSelected = selected.includes(seatNumber);
          const disabled = taken || (selectedTier && tier !== selectedTier);
          const bgColor = taken ? "#333" : isSelected ? "#10b981" : TYPE_DETAILS[tier]?.color || "#555";

          return (
            <button
              key={seatNumber}
              disabled={disabled}
              onClick={() => toggleSeat(seatNumber)}
              title={`Seat ${seatNumber} - ${tier} - ${taken ? 'Taken' : 'Available'}`}
              style={{
                width: 40,
                height: 40,
                backgroundColor: bgColor,
                color: "#fff",
                fontSize: 16,
                borderRadius: 6,
                border: isSelected ? "2px solid #059669" : "1px solid #444",
                cursor: disabled ? "not-allowed" : "pointer"
              }}
            >
              {isSelected ? "✓" : TYPE_DETAILS[tier]?.emoji}
              <span style={{ position: "absolute", bottom: 2, right: 4, fontSize: 10, pointerEvents: "none" }}>
                {seatNumber}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 12, fontSize: 14, textAlign: "center" }}>
        {selected.length ? `Selected Seats: ${selected.join(", ")}` : "No seats selected."}
      </div>
    </div>
  );
}
