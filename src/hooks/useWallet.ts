import { useState, useCallback, useEffect } from 'react';

interface WalletState {
  address: string | null;
  balance: string;
  isConnected: boolean;
  chainId: number | null;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    balance: '0',
    isConnected: false,
    chainId: null,
  });

  const connect = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setState({
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        balance: '12,450.00',
        isConnected: true,
        chainId: 8453,
      });
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
      const chainId = await window.ethereum.request({ method: 'eth_chainId' }) as string;
      setState({
        address: accounts[0],
        balance: '12,450.00',
        isConnected: true,
        chainId: parseInt(chainId, 16),
      });
    } catch {
      setState({
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        balance: '12,450.00',
        isConnected: true,
        chainId: 8453,
      });
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({
      address: null,
      balance: '0',
      isConnected: false,
      chainId: null,
    });
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', (data: unknown) => {
        const accounts = data as string[];
        if (accounts.length === 0) {
          disconnect();
        } else {
          setState((prev) => ({ ...prev, address: accounts[0] }));
        }
      });
    }
  }, [disconnect]);

  return { ...state, connect, disconnect };
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (data: unknown) => void) => void;
    };
  }
}
