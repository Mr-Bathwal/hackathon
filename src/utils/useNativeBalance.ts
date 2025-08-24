import { useBalance, useAccount } from 'wagmi';

export function useNativeBalance() {
  const { address, isConnected } = useAccount();

  const { data, isLoading, error } = useBalance({
    address,
    chainId: 43113,        // Number, not string or URL
        // watch only when connected
  });

  return {
    balance: data?.formatted ?? '0',
    raw: data?.value,
    isLoading,
    error,
  };
}
