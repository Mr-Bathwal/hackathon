import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import HumanVerification from "./HumanVerification";
import eventFactoryAbi from '../abifiles/EventFactory.json';

const categories = [
  "Music", "Art", "Sports", "Gaming", "Conference", "Festival", "Technology", "Finance"
];

const getFactoryContract = (signer) => {
  const factoryAddress = process.env.REACT_APP_EVENT_FACTORY_ADDRESS || '0xYourFactoryAddress';
  return new ethers.Contract(factoryAddress, eventFactoryAbi, signer);
};

export default function CreateEvent() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    symbol: "",
    date: "",
    eventDurationDays: 3,
    category: "Music",
    venue: "",
    maxSupply: 1000,
    vipFrom: 1,
    vipTo: 400,
    baseMintPrice: 0.1,
    vipMintPrice: 0.2,
    organizerPercentage: 10,
    royaltyFeePercentage: 5,
    maxMintsPerUser: 5,
    waitlistEnabled: true,
    eventDescription: ""
  });
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [loadingTx, setLoadingTx] = useState(false);
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    async function setupWallet() {
      if (!window.ethereum) {
        alert("Please install MetaMask");
        return;
      }
      const prov = new ethers.providers.Web3Provider(window.ethereum);
      const signerInst = prov.getSigner();
      setProvider(prov);
      setSigner(signerInst);
    }
    setupWallet();
  }, []);
  useEffect(() => {
    // Reset VIP from/to when maxSupply changes
    const total = parseInt(form.maxSupply, 10) || 1000;
    const vipDefault = Math.floor(total * 0.4);
    setForm(f => ({
      ...f,
      vipFrom: 1,
      vipTo: vipDefault > 0 ? vipDefault : 1
    }));
  }, [form.maxSupply]);

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };
  const onVerifySuccess = () => {
    setIsVerified(true);
    setVerificationOpen(false);
  };
  const handleSubmit = async e => {
    e.preventDefault();

    if (!signer) {
      alert("Please connect your wallet");
      return;
    }
    if (!isVerified) {
      alert("Please complete human verification before creation");
      setVerificationOpen(true);
      return;
    }
    if (!form.name.trim() || !form.venue.trim() || !form.date) {
      alert("Name, Venue, and Date required");
      return;
    }
    const totalSeats = parseInt(form.maxSupply, 10);
    const vipFrom = parseInt(form.vipFrom, 10);
    const vipTo = parseInt(form.vipTo, 10);
    if (vipFrom < 1 || vipTo < vipFrom || vipTo > totalSeats) {
      alert("VIP seat numbers must be within valid range.");
      return;
    }

    const eventStart = Math.floor(new Date(form.date).getTime() / 1000);
    const eventEnd = eventStart + (parseInt(form.eventDurationDays, 10) * 24 * 3600);
    const vipCount = vipTo - vipFrom + 1;

    const createParams = {
      name: form.name,
      symbol: form.symbol ? form.symbol : form.name.substring(0,4).toUpperCase(),
      maxSupply: totalSeats,
      baseMintPrice: ethers.utils.parseEther(form.baseMintPrice.toString()),
      organizerPercentage: parseInt(form.organizerPercentage),
      royaltyFeePercentage: parseInt(form.royaltyFeePercentage),
      eventStartTime: eventStart,
      eventEndTime: eventEnd,
      maxMintsPerUser: parseInt(form.maxMintsPerUser),
      vipConfig: {
        totalVIPSeats: vipCount,
        vipSeatStart: vipFrom,
        vipSeatEnd: vipTo,
        vipHoldingPeriod: 30 * 24 * 3600,
        vipPriceMultiplier: parseFloat(form.vipMintPrice/form.baseMintPrice),
        vipEnabled: vipCount > 0
      },
      waitlistEnabled: form.waitlistEnabled,
      whitelistSaleDuration: 0, // Whitelist Disabled
      initialWhitelist: [],
      venue: form.venue,
      eventDescription: form.eventDescription
    };

    try {
      setLoadingTx(true);
      const factory = getFactoryContract(signer);
      const fee = await factory.eventCreationFee();
      const tx = await factory.createEvent(createParams, { value: fee });
      await tx.wait();

      alert(`Event "${form.name}" created successfully.`);
      navigate("/created-events", {
        state: {
          ...form,
          vipSeats: vipCount,
          vipFrom,
          vipTo,
          vipMintPrice: form.vipMintPrice
        }
      });
    } catch (err) {
      console.error(err);
      alert("Creation failed. See console.");
    } finally {
      setLoadingTx(false);
    }
  };

  return (
    <div style={{
      background: "#181818",
      minHeight: "100vh",
      padding: "2rem",
      color: "#eee",
      fontFamily: "Segoe UI, Arial, sans-serif"
    }}>
      <h1 style={{ color: "#fff", textAlign: "left", marginBottom: "2rem", fontWeight: "bold" }}>Create New Event</h1>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.5rem",
          maxWidth: "820px",
          background: "#222",
          borderRadius: "12px",
          padding: "2rem",
          margin: "auto"
        }}
      >
        <div>
          <label>Name*:<br />
            <input type="text" name="name" value={form.name} onChange={handleInputChange} required />
          </label>
        </div>
        <div>
          <label>Symbol:<br />
            <input type="text" name="symbol" value={form.symbol} onChange={handleInputChange} maxLength={8}/>
          </label>
        </div>
        <div>
          <label>Date*:<br />
            <input type="datetime-local" name="date" value={form.date} onChange={handleInputChange} required />
          </label>
        </div>
        <div>
          <label>Event Duration (days):<br />
            <input type="number" name="eventDurationDays" value={form.eventDurationDays} min={1} max={30} onChange={handleInputChange} />
          </label>
        </div>
        <div>
          <label>Category:<br />
            <select name="category" value={form.category} onChange={handleInputChange}
              style={{ width: "100%", minHeight: "34px" }}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </div>
        <div>
          <label>Venue*:<br />
            <input type="text" name="venue" value={form.venue} onChange={handleInputChange} required />
          </label>
        </div>
        <div>
          <label>Total Seats*:<br />
            <input type="number" name="maxSupply" value={form.maxSupply} onChange={handleInputChange} min={1}/>
          </label>
        </div>
        <div>
          <label>VIP Seats: From #<br />
            <input type="number" name="vipFrom" value={form.vipFrom} min={1} max={form.maxSupply} onChange={handleInputChange} style={{width: "80px", marginRight:"6px"}}/>
            to #<input type="number" name="vipTo" value={form.vipTo} min={form.vipFrom} max={form.maxSupply} onChange={handleInputChange} style={{width: "80px"}}/>
          </label>
        </div>
        <div>
          <label>Base Mint Price (ETH):<br />
            <input type="number" name="baseMintPrice" value={form.baseMintPrice} min={0.01} step={0.01} onChange={handleInputChange}/>
          </label>
        </div>
        <div>
          <label>VIP Mint Price (ETH):<br />
            <input type="number" name="vipMintPrice" value={form.vipMintPrice} min={form.baseMintPrice} step={0.01} onChange={handleInputChange}/>
          </label>
        </div>
        <div>
          <label>Organizer Revenue %:<br />
            <input type="number" name="organizerPercentage" value={form.organizerPercentage} min={0} max={100} onChange={handleInputChange}/>
          </label>
        </div>
        <div>
          <label>Royalty Fee %:<br />
            <input type="number" name="royaltyFeePercentage" value={form.royaltyFeePercentage} min={0} max={100} onChange={handleInputChange}/>
          </label>
        </div>
        <div>
          <label>Max Mints Per User:<br />
            <input type="number" name="maxMintsPerUser" value={form.maxMintsPerUser} min={1} max={100} onChange={handleInputChange}/>
          </label>
        </div>
        <div style={{alignSelf:"center"}}>
          <label>
            <input type="checkbox" name="waitlistEnabled" checked={form.waitlistEnabled} onChange={handleInputChange} />
            Enable Waitlist
          </label>
        </div>
        <div style={{ gridColumn: "1 / 3" }}>
          <label>Description:<br />
            <textarea name="eventDescription" value={form.eventDescription} onChange={handleInputChange} rows={3} style={{width:"100%"}}/>
          </label>
        </div>
        <div style={{ gridColumn: "1 / 3", textAlign: "center", paddingTop:"16px" }}>
          <button type="submit" disabled={loadingTx}
            style={{
              background: "#6935d3",
              color: "#fff",
              fontWeight: "bold",
              padding: "12px 28px",
              border: "none",
              borderRadius: "6px",
              fontSize: "1.1rem",
              cursor: "pointer"
            }}
          >
            {loadingTx ? "Creating Event..." : "Create Event"}
          </button>
        </div>
      </form>

      {verificationOpen ? (
        <HumanVerification
          onSuccess={onVerifySuccess}
          onCancel={() => setVerificationOpen(false)}
        />
      ) : null}
    </div>
  );
}
