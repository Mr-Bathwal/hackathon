import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import EventFactoryAbi from "../abifiles/EventFactory.json";
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
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          await provider.send("eth_requestAccounts", []);
          const signer = provider.getSigner();
          const userAddress = await signer.getAddress();
          const eventContract = new ethers.Contract(
            EVENT_FACTORY_ADDRESS,
            EventFactoryAbi,
            provider
          );

          // Example: get all event contracts organized by user
          // You should adjust to the actual method in your ABI that 
          // fetches ticket/NFT ownership. The below is just one option
          // according to your ABI:
          const eventAddresses = await eventContract.getAllOrganizerEvents(userAddress);

          // Now fetch tickets for each event
          const nfts = [];
          for (let eventAddr of eventAddresses) {
            // You will likely need the ABI for individual event contracts deployed by EventFactory to get tickets per user
            // If tickets are ERC721, use ERC721Enumerable (tokenOfOwnerByIndex)
            // Or, if you have a custom method, call it here
            // Example placeholder:
            // const eventInstance = new ethers.Contract(eventAddr, EventAbi, provider);
            // const balance = await eventInstance.balanceOf(userAddress);
            // for (let i = 0; i < balance; i++) {
            //   const tokenId = await eventInstance.tokenOfOwnerByIndex(userAddress, i);
            //   const tokenURI = await eventInstance.tokenURI(tokenId);
            //   const resp = await fetch(tokenURI);
            //   const metadata = await resp.json();
            //   nfts.push({ ...metadata, id: tokenId.toString(), eventAddress: eventAddr });
            // }
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

  // Filter by tab if your tickets have tier/category info
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
          <div key={nft.id} className="nft-card">
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
