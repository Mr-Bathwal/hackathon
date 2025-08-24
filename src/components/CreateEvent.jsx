import React, { useState } from "react";
import { useAccount } from "wagmi";
import { BrowserProvider, Contract, parseEther } from "ethers";
import { toast } from "sonner";
import { CONTRACT_ADDRESSES, EVENT_FACTORY_ABI } from "../lib/contracts";
import { uploadMetadataToPinata } from "../utils/pinata";

const INITIAL_STATE = {
  name: "",
  symbol: "",
  venue: "",
  description: "",
  maxSupply: "",
  baseMintPrice: "",
  vipMintPrice: "",
  organizerPercentage: "7000",
  royaltyFeePercentage: "500",
  eventStartTime: "",
  eventEndTime: "",
  maxMintsPerUser: "5",
  waitlistEnabled: false,
  whitelistSaleDuration: "86400",
  vipEnabled: false,
  totalVIPSeats: "",
  vipSeatStart: "",
  vipSeatEnd: "",
  vipHoldingPeriod: "7200"
};

export default function CreateEvent() {
  const { isConnected } = useAccount();
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");

  function handleInputChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  async function addFundsPreview() {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const marketplace = new Contract(
        CONTRACT_ADDRESSES.TICKET_MARKETPLACE,
        (await import('../lib/contracts')).TICKET_MARKETPLACE_ABI,
        signer
      );
      const valueWei = parseEther(String(depositAmount || '0'));
      await marketplace.depositForEvent('0x0000000000000000000000000000000000000000', { value: valueWei });
    } catch (e) {
      // This is a placeholder helper. On real deposit user should do it from Event Details page after creation
    }
  }

  async function handleCreateEvent(e) {
    e.preventDefault();
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }
    if (!formData.name || !formData.symbol || !formData.venue) {
      toast.error("Please fill the required fields");
      return;
    }
    if (formData.vipEnabled) {
      const start = parseInt(formData.vipSeatStart || '0');
      const end = parseInt(formData.vipSeatEnd || '0');
      if (start <= 0 || end <= 0 || end < start) {
        toast.error("VIP seat range is invalid");
        return;
      }
    }

    setLoading(true);
    try {
      // 1. Setup blockchain provider/contract
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const eventFactory = new Contract(
        CONTRACT_ADDRESSES.EVENT_FACTORY,
        EVENT_FACTORY_ABI,
        signer
      );
      const creationFee = await eventFactory.eventCreationFee();

      // 1.5. Request faucet 0.01 AVAX (if supported by contract)
      try {
        if (typeof eventFactory.requestFaucet === 'function') {
          await (await eventFactory.requestFaucet()).wait();
          toast.success('Faucet requested: 0.01 AVAX');
        }
      } catch (e) {
        console.warn('Faucet request skipped or failed', e?.message || e);
      }

      // 2. Pinata metadata upload for both ticket type URIs
      const vipMeta = {
        name: `${formData.name} VIP Ticket`,
        description: `VIP access to ${formData.name} at ${formData.venue}`,
        image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600",
        attributes: [
          { trait_type: "Type", value: "VIP" },
          { trait_type: "Event", value: formData.name },
          { trait_type: "Venue", value: formData.venue },
          { trait_type: "Perks", value: "Priority entry, lounge access, merch" }
        ]
      };
      const regularMeta = {
        name: `${formData.name} Regular Ticket`,
        description: `Regular access to ${formData.name} at ${formData.venue}`,
        image: "https://images.unsplash.com/photo-1515165562835-c3b8c8f0f2fd?w=600",
        attributes: [
          { trait_type: "Type", value: "Regular" },
          { trait_type: "Event", value: formData.name },
          { trait_type: "Venue", value: formData.venue },
          { trait_type: "Perks", value: "Standard entry" }
        ]
      };
      const vipUpload = await uploadMetadataToPinata(vipMeta);
      const regularUpload = await uploadMetadataToPinata(regularMeta);

      // 3. Nested VIPConfig as ordered array
      const vipConfig = [
        formData.vipEnabled ? parseInt(formData.totalVIPSeats) || 0 : 0,
        formData.vipEnabled ? parseInt(formData.vipSeatStart) || 0 : 0,
        formData.vipEnabled ? parseInt(formData.vipSeatEnd) || 0 : 0,
        formData.vipEnabled ? parseInt(formData.vipHoldingPeriod) || 0 : 0,
        formData.vipEnabled,
      ];

      // 4. Flat event params array (order matters, must match ABI tuples!)
      const eventParams = [
        formData.name,                          // string name
        formData.symbol,                        // string symbol
        parseInt(formData.maxSupply),           // uint256 maxSupply
        parseEther(formData.baseMintPrice),     // uint256 baseMintPrice
        parseInt(formData.organizerPercentage), // uint256 organizerPercentage (BPS)
        parseInt(formData.royaltyFeePercentage),// uint256 royaltyFeePercentage (BPS)
        Math.floor(new Date(formData.eventStartTime).getTime() / 1000),  // uint256 eventStartTime (unix)
        Math.floor(new Date(formData.eventEndTime).getTime() / 1000),    // uint256 eventEndTime (unix)
        parseInt(formData.maxMintsPerUser),     // uint256 maxMintsPerUser
        vipConfig,                              // VIPConfig struct as array
        parseEther(formData.vipMintPrice || "0"),// uint256 vipMintPrice
        formData.waitlistEnabled,                // bool waitlistEnabled
        parseInt(formData.whitelistSaleDuration),// uint256 whitelistSaleDuration (seconds)
        [],                                      // address[] initialWhitelist (empty by default)
        formData.venue,                          // string venue
        formData.description,                    // string eventDescription
        parseInt(formData.maxSupply),            // uint256 seatCount (matching maxSupply)
        `https://gateway.pinata.cloud/ipfs/${vipUpload.IpfsHash}/`,       // string vipTokenURIBase
        `https://gateway.pinata.cloud/ipfs/${regularUpload.IpfsHash}/`    // string nonVipTokenURIBase
      ];

      // 5. Call the contract method
      const tx = await eventFactory.createEvent(eventParams, { value: creationFee });
      await tx.wait();

      toast.success("Event created successfully!");
      setFormData(INITIAL_STATE);
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error(
        "Failed to create event: " +
        (error?.info?.error?.message || error?.reason || error?.message || "Unknown error")
      );
    }
    setLoading(false);
  }

  return (
    <div className="form-page">
      <div className="card">
        <div className="form-header">
          <h2>Create New Event</h2>
          <p>Define your event, pricing, times and optional VIP seat range. Design stays on theme.</p>
        </div>

        <form onSubmit={handleCreateEvent} className="form-grid">
          <div className="form-group">
            <label>Event Name</label>
            <input className="input" name="name" required type="text" value={formData.name} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Symbol</label>
            <input className="input" name="symbol" required type="text" value={formData.symbol} onChange={handleInputChange} />
          </div>

          <div className="form-group">
            <label>Venue</label>
            <input className="input" name="venue" required type="text" value={formData.venue} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Max Supply</label>
            <input className="input" name="maxSupply" required type="number" min={1} value={formData.maxSupply} onChange={handleInputChange} />
          </div>

          <div className="form-group" style={{gridColumn: '1 / -1'}}>
            <label>Description</label>
            <textarea className="textarea" name="description" required value={formData.description} onChange={handleInputChange} />
          </div>

          <div className="form-group">
            <label>Base Mint Price (AVAX)</label>
            <input className="input" name="baseMintPrice" required type="number" step="0.0001" value={formData.baseMintPrice} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Organizer Percentage (BPS)</label>
            <input className="input" name="organizerPercentage" type="number" min={1} max={9800} value={formData.organizerPercentage} onChange={handleInputChange} />
            <span className="help-text">Example: 7000 = 70%</span>
          </div>

          <div className="form-group">
            <label>Royalty Fee (BPS)</label>
            <input className="input" name="royaltyFeePercentage" type="number" min={0} max={1000} value={formData.royaltyFeePercentage} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Max Mints Per User</label>
            <input className="input" name="maxMintsPerUser" type="number" min={1} max={100} value={formData.maxMintsPerUser} onChange={handleInputChange} />
          </div>

          <div className="form-group">
            <label>Start Time</label>
            <input className="input" name="eventStartTime" type="datetime-local" required value={formData.eventStartTime} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>End Time</label>
            <input className="input" name="eventEndTime" type="datetime-local" required value={formData.eventEndTime} onChange={handleInputChange} />
          </div>

          <div className="form-group">
            <label>Waitlist Enabled</label>
            <label className="switch">
              <input type="checkbox" name="waitlistEnabled" checked={formData.waitlistEnabled} onChange={handleInputChange} />
              <span className="help-text">Enable allowlist phase</span>
            </label>
          </div>
          <div className="form-group">
            <label>Whitelist Sale Duration (sec)</label>
            <input className="input" name="whitelistSaleDuration" type="number" min={0} value={formData.whitelistSaleDuration} onChange={handleInputChange} />
          </div>

          <div className="form-group" style={{gridColumn: '1 / -1'}}>
            <label className="switch">
              <input type="checkbox" name="vipEnabled" checked={formData.vipEnabled} onChange={handleInputChange} />
              Enable VIP Seats
            </label>
          </div>

          {formData.vipEnabled && (
            <>
              <div className="form-group">
                <label>VIP Mint Price (AVAX)</label>
                <input className="input" name="vipMintPrice" type="number" step="0.0001" required value={formData.vipMintPrice} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Total VIP Seats</label>
                <input className="input" name="totalVIPSeats" type="number" min={1} value={formData.totalVIPSeats} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>VIP Seat Start Index</label>
                <input className="input" name="vipSeatStart" type="number" min={1} value={formData.vipSeatStart} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>VIP Seat End Index</label>
                <input className="input" name="vipSeatEnd" type="number" min={1} value={formData.vipSeatEnd} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>VIP Holding Period (sec)</label>
                <input className="input" name="vipHoldingPeriod" type="number" min={0} value={formData.vipHoldingPeriod} onChange={handleInputChange} />
              </div>

              <div className="form-group" style={{gridColumn:'1 / -1'}}>
                <div className="preview-chips">
                  <div className="preview-chip">VIP Range: {formData.vipSeatStart || '-'} - {formData.vipSeatEnd || '-'}</div>
                  <div className="preview-chip">VIP Seats: {formData.totalVIPSeats || 0}</div>
                  <div className="preview-chip">VIP Price: {formData.vipMintPrice || 0} AVAX</div>
                </div>
              </div>
            </>
          )}

          <div className="form-group" style={{gridColumn:'1 / -1', marginTop: 8}}>
            <button disabled={loading} type="submit" className="btn btn-primary">
              {loading ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="form-header">
          <h2>Pre-flight</h2>
          <p>Request faucet and simulate deposits before creating your event.</p>
        </div>
        <div className="form-row" style={{marginBottom:12}}>
          <button className="btn" onClick={async()=>{
            try{ const provider=new BrowserProvider(window.ethereum); const signer=await provider.getSigner(); const f=new Contract(CONTRACT_ADDRESSES.EVENT_FACTORY, EVENT_FACTORY_ABI, signer); const tx= await f.requestFaucet(); await tx.wait(); toast.success('Faucet requested: 0.01 AVAX'); }catch(e){ toast.error('Faucet failed or not available'); }
          }}>Get Faucet 0.01 AVAX</button>
          <span className="help-text">Required by your contract; then Create Event will work.</span>
        </div>
        <div className="deposit-card">
          <input className="input" type="number" min={0} step={0.001} placeholder="Amount in AVAX" value={depositAmount} onChange={(e)=>setDepositAmount(e.target.value)} />
          <button className="btn" onClick={addFundsPreview} disabled={!depositAmount}>Simulate Deposit</button>
          <span className="help-text">Real deposits are per-event from Event Details page.</span>
        </div>
      </div>
    </div>
  );
}
