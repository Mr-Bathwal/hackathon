import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { Link } from 'react-router-dom';

export default function Navbar({ onToggleSidebar }) {
  const { address, isConnected } = useAccount();

  return (
    <>
      <nav className="navbar">
        <div className="nav-content">
          <div className="left-group">
            <button className="hamburger" onClick={onToggleSidebar} aria-label="Toggle Menu">☰</button>
            <Link to="/" className="logo">
              <div className="logo-icon">🎫</div>
              <h2>TicketVerse</h2>
            </Link>
          </div>
          
          <div className="nav-center">
            <div className="search-container">
              <span className="search-icon">🔍</span>
              <input type="text" className="search-input" placeholder="Search events, tickets..." />
            </div>
          </div>

          <div className="nav-actions">
            {isConnected && (
              <div className="account-pill">
                <div className="account-avatar"></div>
                <span className="account-address">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              </div>
            )}
            <ConnectButton 
              showBalance={false}
              chainStatus="icon"
            />
          </div>
        </div>
      </nav>

<style jsx="true">{`
        .navbar {
          background: rgba(32, 38, 57, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          position: sticky;
          top: 0;
          z-index: 1000;
          padding: 12px 0;
        }

        .nav-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
        }
        .left-group { display: flex; align-items: center; gap: 12px; }
        .hamburger { display: none; background: transparent; color: #fff; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; padding: 6px 10px; cursor: pointer; }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: #ffffff;
          font-weight: 600;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .logo h2 {
          margin: 0;
          font-size: 20px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .nav-center {
          flex: 1;
          max-width: 500px;
          margin: 0 40px;
        }

        .search-container {
          position: relative;
          width: 100%;
        }

        .search-input {
          width: 100%;
          padding: 12px 16px 12px 44px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #ffffff;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: rgba(102, 126, 234, 0.5);
          background: rgba(255, 255, 255, 0.08);
        }

        .search-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.5);
          font-size: 16px;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .account-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          color: #ffffff;
          font-size: 14px;
          font-weight: 500;
        }

        .account-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea, #764ba2);
        }

        @media (max-width: 768px) {
          .hamburger { display: inline-flex; }
          .nav-center { display: none; }
          .nav-content { padding: 0 16px; }
        }
      `}</style>
    </>
  );
}
