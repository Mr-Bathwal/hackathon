import React, { useState, useEffect } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useChainId,
  useSwitchChain
} from "wagmi";
import { mainnet, avalanche, avalancheFuji } from "wagmi/chains";
import HumanVerification from "./HumanVerification";
import { useHumanVerification } from "../hooks/useHumanVerification";

// Backend URL for wallet auth (change to deployed backend if needed)
const BACKEND_URL = "http://localhost:5000";

// Available chains for user selection
const CHAIN_OPTIONS = [
  { id: mainnet.id, name: "Ethereum", icon: "⟠" },
  { id: avalanche.id, name: "Avalanche", icon: "🗻" },
  { id: avalancheFuji.id, name: "Fuji", icon: "🗻" },
];

const Navbar = () => {
  const { address, isConnected } = useAccount();
  const { connectors, connect, error, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showChainDropdown, setShowChainDropdown] = useState(false);

  const {
    isVerificationOpen,
    requestVerification,
    handleVerified,
    handleClose
  } = useHumanVerification();

  // Returns chain option details by ID
  const getChainOption = (id) =>
    CHAIN_OPTIONS.find((chain) => chain.id === id) || { name: "Unknown", icon: "⚡" };

  // Connect wallet with verification
  const handleConnect = async (connector) => {
    const verified = await requestVerification(
      "🔐 Verification",
      "Connect your wallet after completing verification"
    );
    if (verified) {
      await connect({ connector });
      setShowWalletModal(false);
    }
  };

  // Switch chain with verification
  const handleSwitchChain = async (chain) => {
    if (chain.id === chainId) return; // No-op if already on target chain
    const verified = await requestVerification(
      "🔄 Chain Switch Verification",
      "Switch blockchain network after verification"
    );
    if (verified) {
      await switchChain({ chainId: chain.id });
      setShowChainDropdown(false);
    }
  };

  // List available connectors once per wallet type (dedupe if needed)
  const availableConnectors = connectors.filter(
    (connector, i, arr) => i === arr.findIndex((c) => c.name === connector.name)
  );

  // Call backend when wallet connection status changes
  useEffect(() => {
    if (!BACKEND_URL) return;
    if (isConnected && address) {
      // Notify backend of logged-in wallet
      fetch(`${BACKEND_URL}/api/auth/wallet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address })
      }).catch(() => {});
    } else {
      // Notify backend of logout
      fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: "POST"
      }).catch(() => {});
    }
  }, [address, isConnected]);

  // Render
  return (
    <>
      <nav className="navbar-me bg-glass flex items-center justify-between px-4 py-2">
        {/* Brand / Search */}
        <div className="flex items-center space-x-4">
          <div className="navbar-brand-me flex items-center space-x-2">
            <img
              src="/logo-magiceden.svg"
              alt="NFTicket"
              className="h-8 w-8 rounded"
              style={{ background: "rgba(255,255,255,0.08)" }}
            />
            <span className="font-bold text-lg tracking-tight gradient-text-magic">
              NFTicket
            </span>
          </div>
          <div className="navbar-search-me ml-2">
            <input
              type="text"
              className="search-bar-me"
              placeholder="Search collections, creators, events…"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Network/Wallet */}
        <div className="flex items-center space-x-4">
          {isConnected ? (
            <>
              {/* Chain Selector */}
              <div className="chain-dropdown-me relative">
                <button
                  className="network-selector-me flex items-center space-x-2 glass-btn-me"
                  onClick={() => setShowChainDropdown(!showChainDropdown)}
                >
                  <span className="chain-icon-me">
                    {getChainOption(chainId).icon}
                  </span>
                  <span className="chain-name-me font-medium">
                    {getChainOption(chainId).name}
                  </span>
                  <svg width={12} height={12} className="caret-me" fill="none">
                    <path
                      d="M2 4.5L6 8.5L10 4.5"
                      stroke="#fff"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
                {showChainDropdown && (
                  <div className="dropdown-menu-me">
                    {CHAIN_OPTIONS.map((chain) => (
                      <div
                        key={chain.id}
                        className={`dropdown-item-me ${
                          chainId === chain.id ? "active" : ""
                        }`}
                        onClick={() => handleSwitchChain(chain)}
                      >
                        <span className="chain-icon-me">{chain.icon}</span>
                        <span>{chain.name}</span>
                        {chainId === chain.id && (
                          <span className="checkmark-me">✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Wallet Info / Disconnect */}
              <div className="wallet-info-me flex items-center ml-4 space-x-2 bg-wallet px-2 py-1 rounded-lg">
                <span className="wallet-addr-me font-mono tracking-tighter">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
                <button
                  className="disconnect-btn-me"
                  onClick={() => disconnect()}
                  title="Disconnect Wallet"
                >
                  <svg width={20} height={20} viewBox="0 0 24 24" fill="#f22">
                    <path d="M16 13v-2H7V9l-5 3 5 3v-2zM17 4h-2v16h2V4z" />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <button
              className="connect-wallet-btn-me gradient-btn-me px-6 py-2"
              onClick={() => setShowWalletModal(true)}
              disabled={isPending}
            >
              {isPending ? "Connecting…" : "Connect Wallet"}
            </button>
          )}
        </div>

        {/* Wallet Modal */}
        {showWalletModal && (
          <div
            className="wallet-modal-me-overlay"
            onClick={() => setShowWalletModal(false)}
          >
            <div
              className="wallet-modal-me"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="wallet-modal-me-header flex items-center justify-between px-2 py-2">
                <h3 className="font-semibold text-lg">Connect Wallet</h3>
                <button
                  className="close-btn-me"
                  onClick={() => setShowWalletModal(false)}
                >
                  &times;
                </button>
              </div>
              <div className="wallet-modal-me-options grid grid-cols-2 gap-4 px-2 py-2">
                {availableConnectors.map((connector) => {
                  // Connector info for UI
                  const walletInfo = connector.name
                    .toLowerCase()
                    .includes("metamask")
                    ? {
                        name: "MetaMask",
                        icon: "🦊",
                        available:
                          typeof window !== "undefined" &&
                          window.ethereum?.isMetaMask
                      }
                    : {
                        name: "Browser Wallet",
                        icon: "👛",
                        available:
                          typeof window !== "undefined" && window.ethereum
                      };
                  return (
                    <button
                      key={connector.id}
                      className={`wallet-modal-me-option glass-btn-me flex flex-col items-center justify-center px-3 py-2 ${
                        !walletInfo.available ? "disabled" : ""
                      }`}
                      disabled={!walletInfo.available || isPending}
                      onClick={() =>
                        walletInfo.available && handleConnect(connector)
                      }
                    >
                      <span style={{ fontSize: "2rem" }}>
                        {walletInfo.icon}
                      </span>
                      <span className="mt-1 text-sm">{walletInfo.name}</span>
                      <span className="status-me">
                        {walletInfo.available ? "Ready" : "Not Found"}
                      </span>
                    </button>
                  );
                })}
              </div>
              {error && (
                <div className="error-message-me px-2 py-2">
                  {error.message.includes("rejected")
                    ? "Connection rejected by user"
                    : "Connection failed. Please try again."}
                </div>
              )}
              <div className="wallet-modal-me-footer mt-3 px-3 py-2 text-center text-xs text-gray-500">
                <span>
                  New to crypto?{" "}
                  <a
                    href="https://metamask.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Install MetaMask
                  </a>
                </span>
              </div>
            </div>
          </div>
        )}
      </nav>
      <HumanVerification
        isOpen={isVerificationOpen}
        onVerified={handleVerified}
        onClose={handleClose}
      />
    </>
  );
};

export default Navbar;
