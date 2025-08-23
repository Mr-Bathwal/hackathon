import React, { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";

const BuyNFT = () => {
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  
  const { writeContract, data: hash } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });

  const handleBuy = async () => {
    if (!isConnected) {
      alert("Connect your wallet first!");
      return;
    }

    try {
      setIsLoading(true);
      
      // Replace with your actual contract address and ABI
      writeContract({
        address: '0xYourNFTContractAddress', // Replace with actual contract
        abi: [
          {
            name: 'mint',
            type: 'function',
            stateMutability: 'payable',
            inputs: [],
            outputs: [],
          },
        ],
        functionName: 'mint',
        value: parseEther('0.01'), // 0.01 AVAX/ETH
      });
      
    } catch (err) {
      console.error("Error buying NFT:", err);
      alert("Transaction failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="section">
      <div className="buy-panel">
        <h2>Buy NFT Ticket</h2>
        {isConnected ? (
          <>
            <p>Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</p>
            <div className="nft-details">
              <p>Price: 0.01 AVAX/ETH</p>
              <p>Event: Concert Ticket NFT</p>
            </div>
            <button
              className="btn"
              onClick={handleBuy}
              disabled={isLoading || isConfirming}
            >
              {isLoading || isConfirming ? "Processing..." : "Buy NFT"}
            </button>
            {isConfirmed && (
              <p className="success">Transaction confirmed!</p>
            )}
          </>
        ) : (
          <p>Please connect your wallet to continue.</p>
        )}
      </div>
    </div>
  );
};

export default BuyNFT;
