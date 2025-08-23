import { useState, useCallback } from 'react';

export const useHumanVerification = () => {
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [verificationResolve, setVerificationResolve] = useState(null);

  const requestVerification = useCallback((title, message) => {
    return new Promise((resolve) => {
      setVerificationResolve(() => resolve);
      setIsVerificationOpen(true);
    });
  }, []);

  const handleVerified = useCallback(() => {
    if (verificationResolve) {
      verificationResolve(true);
      setVerificationResolve(null);
    }
    setIsVerificationOpen(false);
  }, [verificationResolve]);

  const handleClose = useCallback(() => {
    if (verificationResolve) {
      verificationResolve(false);
      setVerificationResolve(null);
    }
    setIsVerificationOpen(false);
  }, [verificationResolve]);

  return {
    isVerificationOpen,
    requestVerification,
    handleVerified,
    handleClose,
  };
};
