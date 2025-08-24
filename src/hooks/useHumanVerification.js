import { useState } from 'react';
import { useAccount } from 'wagmi';
import { BrowserProvider, Contract } from 'ethers';
import { CONTRACT_ADDRESSES, USER_VERIFICATION_ABI } from '../lib/contracts';

export function useHumanVerification() {
  const { address, isConnected } = useAccount();
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkVerificationStatus = async () => {
    if (!isConnected || !address) return null;

    setLoading(true);
    try {
      const provider = new BrowserProvider(window.ethereum);
      const userVerification = new Contract(
        CONTRACT_ADDRESSES.USER_VERIFIER,
        USER_VERIFICATION_ABI,
        provider
      );

      const status = await userVerification.getUserStatus(address);
      // status = [isVerified, level, verifiedAt, expiresAt, suspended, suspendedUntil, suspendedReason]
      const verificationData = {
        isVerified: status[0],
        level: Number(status[1]),
        verifiedAt: new Date(Number(status[2]) * 1000),
        expiresAt: new Date(Number(status[3]) * 1000),
        suspended: status[4],
        suspendedUntil: Number(status[5]) > 0 ? new Date(Number(status[5]) * 1000) : null,
        suspendedReason: Number(status[6]),
      };

      setVerificationStatus(verificationData);
      return verificationData;
    } catch (error) {
      console.error('Error checking verification status:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const requestVerification = async () => {
    return {
      success: false,
      message: 'Verification requests must be submitted manually. Please contact support.',
    };
  };

  const isVerifiedAndActive = () => {
    if (!verificationStatus) return false;

    return (
      verificationStatus.isVerified &&
      !verificationStatus.suspended &&
      verificationStatus.expiresAt > new Date()
    );
  };

  const hasMinimumLevel = (minLevel) => {
    if (!verificationStatus) return false;

    return (
      isVerifiedAndActive() &&
      verificationStatus.level >= minLevel
    );
  };

  const getVerificationLevelName = (level) => {
    const levels = ['None', 'Basic', 'Premium', 'VIP', 'Admin'];
    return levels[level] || 'Unknown';
  };

  return {
    verificationStatus,
    loading,
    checkVerificationStatus,
    requestVerification,
    isVerifiedAndActive,
    hasMinimumLevel,
    getVerificationLevelName,
  };
}
