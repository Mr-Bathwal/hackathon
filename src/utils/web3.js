// src/utils/web3.js
import { BrowserProvider, formatEther } from 'ethers';
import { toast } from 'sonner';

export const connectWallet = async () => {
  if (!window.ethereum) {
    toast.error('MetaMask not installed');
    return null;
  }

  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    toast.success('Wallet connected successfully');
    return { provider, signer, address };
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    toast.error('Failed to connect wallet');
    return null;
  }
};

export const getBalance = async (address) => {
  try {
    const provider = new BrowserProvider(window.ethereum);
    const balance = await provider.getBalance(address);
    return formatEther(balance);
  } catch (error) {
    console.error('Failed to get balance:', error);
    return '0';
  }
};

export const waitForTransaction = async (txHash, provider) => {
  try {
    const receipt = await provider.waitForTransaction(txHash);
    return receipt;
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
};

export const estimateGas = async (contract, method, params, value = 0n) => {
  // note: ethers v6 uses BigInt (e.g., 0n) for values
  try {
    const gasEstimate = await contract.estimateGas[method](...params, { value });
    return gasEstimate;
  } catch (error) {
    console.error('Gas estimation failed:', error);
    return 500_000n; // Default gas limit as BigInt
  }
};
