// src/utils/web3.js
import { ethers } from "ethers";
import contractABI from "./ABI.json"; // Make sure ABI.json is present

export function getContract() {
  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
  if (!window.ethereum) throw new Error("Wallet not detected.");
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  return new ethers.Contract(contractAddress, contractABI, signer);
}
