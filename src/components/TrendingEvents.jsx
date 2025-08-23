import React from "react";
import { Link } from "react-router-dom";

export default function TrendingEvents({ events }) {
  return (
    <section className="section">
      <div className="section-head">
        <h2>🔥 Trending</h2>
        <span className="muted">Most volume in last 24h</span>
      </div>
      <div className="card-grid">
        {events.map(ev => (
          <Link key={ev.id} to={`/event/${ev.id}`} className="event-card">
            <img src={ev.image} alt={ev.name} />
            <div className="card-info">
              <div className="card-title">{ev.name}</div>
              <div className="row">
                <span className="badge">Floor {ev.floor} ◎</span>
                <span className="muted">Vol {ev.volume} ◎</span>
              </div>
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
