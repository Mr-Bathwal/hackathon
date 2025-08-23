import React from "react";

// Props:
// gridRows, gridCols: numbers defining grid size
// seatData: object mapping seatId -> { category, price, perks }
// updateSeat: function(seatId, updatedFields) to update seat data
// seatCategories: array of { value, label, emoji, color } for category options
// seatPerksList: array of possible perk strings
export default function SeatSelectionGrid({
  gridRows,
  gridCols,
  seatData,
  updateSeat,
  seatCategories,
  seatPerksList,
}) {
  // Generate seat IDs row-col wise
  const seats = [];
  for (let r = 1; r <= gridRows; r++) {
    for (let c = 1; c <= gridCols; c++) {
      const seatId = `R${r}C${c}`;
      seats.push(seatId);
    }
  }

  // Handle category change dropdown
  const handleCategoryChange = (seatId, e) => {
    updateSeat(seatId, { category: e.target.value });
  };

  // Handle price change input
  const handlePriceChange = (seatId, e) => {
    const val = e.target.value;
    if (!isNaN(val) && val >= 0) {
      updateSeat(seatId, { price: val });
    }
  };

  // Toggle perk checkbox
  const handlePerkToggle = (seatId, perk) => {
    const perks = seatData[seatId]?.perks || [];
    let newPerks;
    if (perks.includes(perk)) {
      newPerks = perks.filter(p => p !== perk);
    } else {
      newPerks = [...perks, perk];
    }
    updateSeat(seatId, { perks: newPerks });
  };

  // Get category info for styling and emoji
  const getCategoryInfo = (cat) => seatCategories.find(sc => sc.value === cat) || seatCategories[2];

  return (
    <div style={{ overflowX: "auto", maxWidth: "100%" }}>
      <table style={{ borderCollapse: "collapse", marginTop: 16, width: "100%", minWidth: 400 }}>
        <tbody>
          {[...Array(gridRows).keys()].map(r => (
            <tr key={`row-${r + 1}`}>
              {[...Array(gridCols).keys()].map(c => {
                const seatId = `R${r + 1}C${c + 1}`;
                const seat = seatData[seatId] || {};
                const category = seat.category || "Fans";
                const price = seat.price || 1;
                const perks = seat.perks || [];
                const catInfo = getCategoryInfo(category);

                return (
                  <td
                    key={seatId}
                    style={{
                      border: "1px solid #444",
                      padding: 4,
                      textAlign: "center",
                      backgroundColor: catInfo.color,
                      verticalAlign: "top",
                      width: 80,
                      userSelect: "none"
                    }}
                    title={`Seat ${seatId}`}
                  >
                    <div style={{ fontSize: 20 }}>{catInfo.emoji}</div>
                    <div>
                      <select
                        value={category}
                        onChange={e => handleCategoryChange(seatId, e)}
                        style={{ width: "100%" }}
                        aria-label={`Category for seat ${seatId}`}
                      >
                        {seatCategories.map(sc => (
                          <option key={sc.value} value={sc.value}>
                            {sc.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div style={{ marginTop: 4 }}>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={price}
                        onChange={e => handlePriceChange(seatId, e)}
                        style={{ width: "100%" }}
                        aria-label={`Price for seat ${seatId}`}
                      />
                      <small>ETH</small>
                    </div>
                    <div style={{ textAlign: "left", marginTop: 4 }}>
                      {seatPerksList.map(perk => (
                        <label key={`${seatId}-${perk}`} style={{ display: "block", fontSize: 12 }}>
                          <input
                            type="checkbox"
                            checked={perks.includes(perk)}
                            onChange={() => handlePerkToggle(seatId, perk)}
                          />{" "}
                          {perk}
                        </label>
                      ))}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
