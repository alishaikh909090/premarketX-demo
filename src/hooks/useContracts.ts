import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { ESCROW_ABI, COLLATERAL_ABI, VESTING_NFT_ABI, ERC20_ABI } from '../contracts/abis';
import {
  USDC_ADDRESS, ESCROW_ADDRESS, COLLATERAL_ADDRESS,
  VESTING_NFT_ADDRESS, isContractDeployed,
} from '../contracts/addresses';

export type TxStatus = 'idle' | 'pending' | 'confirming' | 'success' | 'error';

interface TxState {
  status: TxStatus;
  hash: string | null;
  error: string | null;
}

function getProvider(): ethers.BrowserProvider | null {
  if (typeof window === 'undefined' || !window.ethereum) return null;
  return new ethers.BrowserProvider(window.ethereum);
}

function getChainId(): number {
  if (typeof window === 'undefined' || !window.ethereum) return 0;
  return 8453;
}

export function useEscrow() {
  const [txState, setTxState] = useState<TxState>({ status: 'idle', hash: null, error: null });

  const getContract = useCallback(async () => {
    const provider = getProvider();
    if (!provider) return null;
    const chainId = getChainId();
    if (!isContractDeployed(chainId)) return null;
    const signer = await provider.getSigner();
    return new ethers.Contract(ESCROW_ADDRESS[chainId], ESCROW_ABI, signer);
  }, []);

  const createTrade = useCallback(async (buyerAddress: string, amount: string, price: string) => {
    setTxState({ status: 'pending', hash: null, error: null });
    try {
      const contract = await getContract();
      if (!contract) {
        setTxState({ status: 'error', hash: null, error: 'Contract not deployed on this chain' });
        return null;
      }
      const amountBN = ethers.parseUnits(amount, 18);
      const priceBN = ethers.parseUnits(price, 6);
      const tx = await contract.createTrade(buyerAddress, amountBN, priceBN);
      setTxState((prev) => ({ ...prev, hash: tx.hash, status: 'confirming' }));
      await tx.wait();
      setTxState({ status: 'success', hash: tx.hash, error: null });
      return tx.hash;
    } catch (err: any) {
      setTxState({ status: 'error', hash: null, error: err?.message || 'Transaction failed' });
      return null;
    }
  }, [getContract]);

  const fundTrade = useCallback(async (tradeId: number) => {
    setTxState({ status: 'pending', hash: null, error: null });
    try {
      const provider = getProvider();
      if (!provider) {
        setTxState({ status: 'error', hash: null, error: 'No wallet connected' });
        return null;
      }
      const chainId = getChainId();
      const signer = await provider.getSigner();

      const usdcContract = new ethers.Contract(USDC_ADDRESS[chainId], ERC20_ABI, signer);
      const escrowAddr = ESCROW_ADDRESS[chainId];

      const tradeData = await (await (new ethers.Contract(escrowAddr, ESCROW_ABI, signer))).trades(tradeId);
      const price = tradeData.price;

      const approveTx = await usdcContract.approve(escrowAddr, price);
      setTxState((prev) => ({ ...prev, hash: approveTx.hash, status: 'confirming' }));
      await approveTx.wait();

      const escrowContract = new ethers.Contract(escrowAddr, ESCROW_ABI, signer);
      const fundTx = await escrowContract.fundTrade(tradeId);
      setTxState((prev) => ({ ...prev, hash: fundTx.hash, status: 'confirming' }));
      await fundTx.wait();

      setTxState({ status: 'success', hash: fundTx.hash, error: null });
      return fundTx.hash;
    } catch (err: any) {
      setTxState({ status: 'error', hash: null, error: err?.message || 'Funding failed' });
      return null;
    }
  }, []);

  const confirmDelivery = useCallback(async (tradeId: number) => {
    setTxState({ status: 'pending', hash: null, error: null });
    try {
      const contract = await getContract();
      if (!contract) {
        setTxState({ status: 'error', hash: null, error: 'Contract not deployed' });
        return null;
      }
      const tx = await contract.confirmDelivery(tradeId);
      setTxState((prev) => ({ ...prev, hash: tx.hash, status: 'confirming' }));
      await tx.wait();
      setTxState({ status: 'success', hash: tx.hash, error: null });
      return tx.hash;
    } catch (err: any) {
      setTxState({ status: 'error', hash: null, error: err?.message || 'Confirmation failed' });
      return null;
    }
  }, [getContract]);

  const getTrade = useCallback(async (tradeId: number) => {
    try {
      const contract = await getContract();
      if (!contract) return null;
      const trade = await contract.trades(tradeId);
      return {
        buyer: trade.buyer,
        seller: trade.seller,
        amount: ethers.formatUnits(trade.amount, 18),
        price: ethers.formatUnits(trade.price, 6),
        status: Number(trade.status),
      };
    } catch {
      return null;
    }
  }, [getContract]);

  const reset = useCallback(() => {
    setTxState({ status: 'idle', hash: null, error: null });
  }, []);

  return {
    ...txState,
    createTrade,
    fundTrade,
    confirmDelivery,
    getTrade,
    reset,
    isDeployed: isContractDeployed(getChainId()),
  };
}

export function useCollateral() {
  const [txState, setTxState] = useState<TxState>({ status: 'idle', hash: null, error: null });

  const getContract = useCallback(async () => {
    const provider = getProvider();
    if (!provider) return null;
    const chainId = getChainId();
    if (!isContractDeployed(chainId)) return null;
    const signer = await provider.getSigner();
    return new ethers.Contract(COLLATERAL_ADDRESS[chainId], COLLATERAL_ABI, signer);
  }, []);

  const depositCollateral = useCallback(async (amountEth: string) => {
    setTxState({ status: 'pending', hash: null, error: null });
    try {
      const contract = await getContract();
      if (!contract) {
        setTxState({ status: 'error', hash: null, error: 'Contract not deployed' });
        return null;
      }
      const tx = await contract.deposit({ value: ethers.parseEther(amountEth) });
      setTxState((prev) => ({ ...prev, hash: tx.hash, status: 'confirming' }));
      await tx.wait();
      setTxState({ status: 'success', hash: tx.hash, error: null });
      return tx.hash;
    } catch (err: any) {
      setTxState({ status: 'error', hash: null, error: err?.message || 'Deposit failed' });
      return null;
    }
  }, [getContract]);

  const withdrawCollateral = useCallback(async (amountEth: string) => {
    setTxState({ status: 'pending', hash: null, error: null });
    try {
      const contract = await getContract();
      if (!contract) {
        setTxState({ status: 'error', hash: null, error: 'Contract not deployed' });
        return null;
      }
      const tx = await contract.withdraw(ethers.parseEther(amountEth));
      setTxState((prev) => ({ ...prev, hash: tx.hash, status: 'confirming' }));
      await tx.wait();
      setTxState({ status: 'success', hash: tx.hash, error: null });
      return tx.hash;
    } catch (err: any) {
      setTxState({ status: 'error', hash: null, error: err?.message || 'Withdrawal failed' });
      return null;
    }
  }, [getContract]);

  const getCollateral = useCallback(async (address: string) => {
    try {
      const contract = await getContract();
      if (!contract) return '0';
      const amount = await contract.collateral(address);
      return ethers.formatEther(amount);
    } catch {
      return '0';
    }
  }, [getContract]);

  const reset = useCallback(() => {
    setTxState({ status: 'idle', hash: null, error: null });
  }, []);

  return {
    ...txState,
    depositCollateral,
    withdrawCollateral,
    getCollateral,
    reset,
    isDeployed: isContractDeployed(getChainId()),
  };
}

export function useVestingNFT() {
  const [txState, setTxState] = useState<TxState>({ status: 'idle', hash: null, error: null });

  const getContract = useCallback(async () => {
    const provider = getProvider();
    if (!provider) return null;
    const chainId = getChainId();
    if (!isContractDeployed(chainId)) return null;
    const signer = await provider.getSigner();
    return new ethers.Contract(VESTING_NFT_ADDRESS[chainId], VESTING_NFT_ABI, signer);
  }, []);

  const mintVesting = useCallback(async (
    to: string,
    total: string,
    start: number,
    duration: number
  ) => {
    setTxState({ status: 'pending', hash: null, error: null });
    try {
      const contract = await getContract();
      if (!contract) {
        setTxState({ status: 'error', hash: null, error: 'Contract not deployed' });
        return null;
      }
      const totalBN = ethers.parseUnits(total, 18);
      const tx = await contract.mint(to, totalBN, start, duration);
      setTxState((prev) => ({ ...prev, hash: tx.hash, status: 'confirming' }));
      await tx.wait();
      setTxState({ status: 'success', hash: tx.hash, error: null });
      return tx.hash;
    } catch (err: any) {
      setTxState({ status: 'error', hash: null, error: err?.message || 'Mint failed' });
      return null;
    }
  }, [getContract]);

  const getClaimable = useCallback(async (tokenId: number) => {
    try {
      const contract = await getContract();
      if (!contract) return '0';
      const amount = await contract.claimable(tokenId);
      return ethers.formatUnits(amount, 18);
    } catch {
      return '0';
    }
  }, [getContract]);

  const getVesting = useCallback(async (tokenId: number) => {
    try {
      const contract = await getContract();
      if (!contract) return null;
      const v = await contract.vestings(tokenId);
      return {
        total: ethers.formatUnits(v.total, 18),
        claimed: ethers.formatUnits(v.claimed, 18),
        start: Number(v.start),
        duration: Number(v.duration),
      };
    } catch {
      return null;
    }
  }, [getContract]);

  const reset = useCallback(() => {
    setTxState({ status: 'idle', hash: null, error: null });
  }, []);

  return {
    ...txState,
    mintVesting,
    getClaimable,
    getVesting,
    reset,
    isDeployed: isContractDeployed(getChainId()),
  };
}

export function useUSDC() {
  const [txState, setTxState] = useState<TxState>({ status: 'idle', hash: null, error: null });

  const getBalance = useCallback(async (address: string) => {
    try {
      const provider = getProvider();
      if (!provider) return '0';
      const chainId = getChainId();
      const contract = new ethers.Contract(USDC_ADDRESS[chainId], ERC20_ABI, provider);
      const balance = await contract.balanceOf(address);
      return ethers.formatUnits(balance, 6);
    } catch {
      return '0';
    }
  }, []);

  const approve = useCallback(async (spender: string, amount: string) => {
    setTxState({ status: 'pending', hash: null, error: null });
    try {
      const provider = getProvider();
      if (!provider) {
        setTxState({ status: 'error', hash: null, error: 'No wallet' });
        return null;
      }
      const chainId = getChainId();
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(USDC_ADDRESS[chainId], ERC20_ABI, signer);
      const tx = await contract.approve(spender, ethers.parseUnits(amount, 6));
      setTxState((prev) => ({ ...prev, hash: tx.hash, status: 'confirming' }));
      await tx.wait();
      setTxState({ status: 'success', hash: tx.hash, error: null });
      return tx.hash;
    } catch (err: any) {
      setTxState({ status: 'error', hash: null, error: err?.message || 'Approval failed' });
      return null;
    }
  }, []);

  const getAllowance = useCallback(async (owner: string, spender: string) => {
    try {
      const provider = getProvider();
      if (!provider) return '0';
      const chainId = getChainId();
      const contract = new ethers.Contract(USDC_ADDRESS[chainId], ERC20_ABI, provider);
      const allowance = await contract.allowance(owner, spender);
      return ethers.formatUnits(allowance, 6);
    } catch {
      return '0';
    }
  }, []);

  const reset = useCallback(() => {
    setTxState({ status: 'idle', hash: null, error: null });
  }, []);

  return {
    ...txState,
    getBalance,
    approve,
    getAllowance,
    reset,
  };
}
