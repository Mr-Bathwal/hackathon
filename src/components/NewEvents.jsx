
import React from "react";
import { Link } from "react-router-dom";

export default function NewEvents({ events }) {
  return (
    <section className="section">
      <div className="section-head">
        <h2>🆕 New & Upcoming</h2>
        <span className="muted">Fresh mints & drops</span>
      </div>
      <div className="card-grid">
        {events.map(ev => (
          <Link key={ev.id} to={`/event/${ev.id}`} className="event-card">
            <img src={ev.image} alt={ev.name} />
            <div className="card-info">
              <div className="card-title">{ev.name}</div>
              <div className="muted">Mint: {ev.date}</div>
              {ev.earlyBird?.active && (
                <div className="offer">Early Bird: {ev.earlyBird.discount}% off</div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
