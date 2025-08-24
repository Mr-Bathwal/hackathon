import React, { useState, useEffect } from "react";
import EventFactoryAbi from "../abifiles/EventFactory.json";
import EventTicketAbi from "../abifiles/ERC721.json"; // You MUST change this to your deployed event ABI if different
import { BrowserProvider, Contract } from "ethers";
const EVENT_FACTORY_ADDRESS = "0x93A8868Fe54DfF533c89C1434D83ce58ee340567"; // Use the right address

export default function HeldNFTs({ onSell }) {
  const [tab, setTab] = useState("VIP");
  const [allNFTs, setAllNFTs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNFTTickets() {
      setLoading(true);
      try {
        if (window.ethereum) {
          const provider = new BrowserProvider(window.ethereum);
          await provider.send("eth_requestAccounts", []);
          const signer = await provider.getSigner();
          const userAddress = await signer.getAddress();

          const eventContract = new Contract(
            EVENT_FACTORY_ADDRESS,
            EventFactoryAbi,
            provider
          );

          // ethers v6: call returns array unless ABI has output names
          const eventAddresses = await eventContract.getAllOrganizerEvents(userAddress);

          const nfts = [];
          for (let eventAddr of eventAddresses) {
            // Instantiate event instance with ERC721 ABI. Use your actual deployed event ABI if you have custom metadata
            const eventInstance = new Contract(
              eventAddr,
              EventTicketAbi,
              provider
            );
            const balance = await eventInstance.balanceOf(userAddress);
            // BigInt handling in ethers v6:
            const balanceNum = typeof balance === "bigint" ? Number(balance) : balance;
            for (let i = 0; i < balanceNum; i++) {
              const tokenId = await eventInstance.tokenOfOwnerByIndex(userAddress, i);
              const tokenIdNum = typeof tokenId === "bigint" ? tokenId.toString() : tokenId;
              const tokenURI = await eventInstance.tokenURI(tokenId);
              let metadata = {};
              try {
                // IPFS/HTTPS aware fetch
                const url = tokenURI.startsWith("ipfs://")
                  ? `https://ipfs.io/ipfs/${tokenURI.replace("ipfs://", "")}`
                  : tokenURI;
                const resp = await fetch(url);
                metadata = await resp.json();
              } catch (err) {
                metadata = { image: "", name: "Unknown NFT", seatLabel: "?", tier: "Fans" };
              }
              // Example mapping; make sure your metadata includes tier info!
              nfts.push({
                ...metadata,
                id: tokenIdNum,
                eventAddress: eventAddr,
                tier: metadata.tier || "Fans", // fallback tier
                seatLabel: metadata.seatLabel || "-",
              });
            }
          }
          setAllNFTs(nfts);
        }
      } catch (err) {
        setAllNFTs([]);
      }
      setLoading(false);
    }
    fetchNFTTickets();
  }, []);

  // Filter by tab/category (VIP, Rockers, Fans)
  const filtered = allNFTs.filter(n => n.tier === tab);

  return (
    <section className="section">
      <div className="section-head">
        <h2>🎟 Your NFTs</h2>
        <div className="tabs">
          {["VIP", "Rockers", "Fans"].map(t => (
            <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>
      </div>
      <div className="card-grid">
        {loading && <div className="muted">Loading NFTs from blockchain...</div>}
        {!loading && filtered.length === 0 && <div className="muted">No NFTs in this category yet.</div>}
        {filtered.map(nft => (
          <div key={nft.id + nft.eventAddress} className="nft-card">
            <img src={nft.image} alt={nft.name} />
            <div className="card-info">
              <div className="card-title">{nft.name}</div>
              <div className="muted">Seat: {nft.seatLabel}</div>
              <button className="btn" onClick={() => onSell(nft)}>Sell / Auction</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
