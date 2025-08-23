import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const { pathname } = useLocation();
 
  const isActive = (path) => pathname === path;

  const menuItems = [
    {
      section: "Marketplace",
      items: [
        { to: "/", label: "Explore", icon: "🔍" },
        { to: "/auction", label: "Auctions", icon: "⚡" },
        { to: "/profile", label: "My Items", icon: "👤" }
      ]
    },
    {
      section: "Create",
      items: [
        { to: "/create-event", label: "Create Collection", icon: "✨" },
        { to: "/created-events", label: "My Collections", icon: "📊" }
      ]
    }
  ];

  const categories = [
    { name: "All Categories", icon: "📋", active: true },
    { name: "Music", icon: "🎵", count: "12.4K" },
    { name: "Art", icon: "🎨", count: "8.2K" },
    { name: "Sports", icon: "⚽", count: "6.8K" },
    { name: "Technology", icon: "💻", count: "5.1K" },
    { name: "Gaming", icon: "🎮", count: "4.3K" },
    { name: "Conference", icon: "🎤", count: "3.9K" }
  ];

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <Link to="/" className="logo-link">
          <div className="logo-icon">🎫</div>
          <span className="logo-text">NFTicket</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {menuItems.map(section => (
          <div key={section.section} className="nav-section">
            <div className="nav-section-title">{section.section}</div>
            <div className="nav-items">
              {section.items.map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`nav-item ${isActive(item.to) ? "active" : ""}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Categories */}
      <div className="sidebar-categories">
        <div className="categories-header">
          <h3>Categories</h3>
        </div>
        <div className="categories-list">
          {categories.map(category => (
            <button
              key={category.name}
              className={`category-item ${category.active ? "active" : ""}`}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
              {category.count && (
                <span className="category-count">{category.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="sidebar-stats">
        <div className="stats-header">
          <h3>Platform Stats</h3>
        </div>
        <div className="stats-list">
          <div className="stat-item">
            <div className="stat-value">240K+</div>
            <div className="stat-label">Total NFTs</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">24K+</div>
            <div className="stat-label">Collections</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">100K+</div>
            <div className="stat-label">Artists</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="footer-links">
          <a href="#" className="footer-link">Help Center</a>
          <a href="#" className="footer-link">Terms</a>
          <a href="#" className="footer-link">Privacy</a>
        </div>
        <div className="footer-social">
          <a href="#" className="social-link">🐦</a>
          <a href="#" className="social-link">💬</a>
          <a href="#" className="social-link">📘</a>
        </div>
      </div>
    </aside>
  );
}