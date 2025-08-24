// Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAccount } from 'wagmi';

export default function Sidebar({ open = false }) {
  const location = useLocation();
  const { isConnected } = useAccount();

  const menuItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/marketplace', label: 'Marketplace', icon: '🛍️' },
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/create-event', label: 'Create Event', icon: '➕' },
    { path: '/auction-chamber', label: 'Auction Chamber', icon: '⚡' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  // Sidebar is always rendered for correct layout, but can render menu empty if not connected
  return (
    <div className={`sidebar${open ? ' open' : ''}`}>
      <div className="sidebar-logo">
        <div className="logo-icon">TV</div>
        <span style={{ color: '#ffffff', fontWeight: '600' }}>TicketVerse</span>
      </div>
      <nav>
        <ul className="sidebar-nav">
          {isConnected
            ? menuItems.map((item) => (
              <li key={item.path} className="nav-item">
                <Link
                  to={item.path}
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))
            : null}
        </ul>
      </nav>
    </div>
  );
}
