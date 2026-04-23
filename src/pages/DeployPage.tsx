import { motion } from 'framer-motion';
import { Shield, FileCode, Coins, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import {
  USDC_ADDRESS, ESCROW_ADDRESS, COLLATERAL_ADDRESS,
  VESTING_NFT_ADDRESS, BASE_CHAIN_ID, BASE_TESTNET_CHAIN_ID,
} from '../contracts/addresses';

export function DeployPage() {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const contracts = [
    {
      name: 'PreMarketEscrow',
      address: ESCROW_ADDRESS[BASE_CHAIN_ID],
      description: 'Main escrow contract handling trade creation, USDC locking, delivery confirmation, and settlement.',
      features: ['Create trades', 'Lock USDC in escrow', 'Confirm delivery', 'Admin finalize', 'Emergency cancel'],
      deployed: ESCROW_ADDRESS[BASE_CHAIN_ID] !== '0x0000000000000000000000000000000000000000',
    },
    {
      name: 'CollateralVault',
      address: COLLATERAL_ADDRESS[BASE_CHAIN_ID],
      description: 'Anti-scam layer. Sellers deposit ETH collateral that gets slashed if they fail to deliver.',
      features: ['Deposit collateral', 'Withdraw collateral', 'Slash on scam', 'Admin controls'],
      deployed: COLLATERAL_ADDRESS[BASE_CHAIN_ID] !== '0x0000000000000000000000000000000000000000',
    },
    {
      name: 'VestingNFT',
      address: VESTING_NFT_ADDRESS[BASE_CHAIN_ID],
      description: 'Turns vesting allocations into tradable ERC-721 NFTs. Each allocation becomes a sellable asset.',
      features: ['Mint vesting NFTs', 'Linear vesting schedule', 'Claimable amounts', 'ERC-721 transferable'],
      deployed: VESTING_NFT_ADDRESS[BASE_CHAIN_ID] !== '0x0000000000000000000000000000000000000000',
    },
  ];

  const deploySteps = [
    {
      step: '1',
      title: 'Deploy USDC (or use existing)',
      description: 'Use Base mainnet USDC or deploy a mock for testnet.',
      command: 'USDC: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    },
    {
      step: '2',
      title: 'Deploy PreMarketEscrow',
      description: 'Pass the USDC contract address to the constructor.',
      command: 'PreMarketEscrow.deploy(USDC_ADDRESS)',
    },
    {
      step: '3',
      title: 'Deploy CollateralVault',
      description: 'No constructor arguments needed.',
      command: 'CollateralVault.deploy()',
    },
    {
      step: '4',
      title: 'Deploy VestingNFT',
      description: 'No constructor arguments needed. ERC-721 with vesting data.',
      command: 'VestingNFT.deploy()',
    },
    {
      step: '5',
      title: 'Update Contract Addresses',
      description: 'Update src/contracts/addresses.ts with deployed addresses.',
      command: 'ESCROW_ADDRESS[8453] = "0x..."',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Smart Contracts</h1>
        <p className="text-gray-400">Base chain deployment guide and contract addresses</p>
      </div>

      {/* Network Badge */}
      <div className="flex items-center gap-3 mb-8 p-4 rounded-xl bg-white/[0.03] border border-white/5">
        <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse" />
        <div>
          <p className="text-sm font-medium">Base Chain</p>
          <p className="text-xs text-gray-500">Chain ID: {BASE_CHAIN_ID} (Mainnet) / {BASE_TESTNET_CHAIN_ID} (Testnet)</p>
        </div>
      </div>

      {/* Deployed Contracts */}
      <div className="space-y-4 mb-10">
        <h2 className="text-xl font-bold">Deployed Contracts</h2>
        {contracts.map((contract, i) => (
          <motion.div
            key={contract.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="p-6 rounded-2xl bg-white/[0.03] border border-white/5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
                  <FileCode className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="font-semibold">{contract.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-mono text-gray-500">{contract.address.slice(0, 10)}...{contract.address.slice(-6)}</span>
                    <button
                      onClick={() => copyToClipboard(contract.address, contract.name)}
                      className="p-1 rounded hover:bg-white/10 transition-colors"
                    >
                      {copiedField === contract.name ? (
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-lg flex items-center gap-1 ${
                contract.deployed
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-amber-500/10 text-amber-400'
              }`}>
                {contract.deployed ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                {contract.deployed ? 'Deployed' : 'Pending'}
              </span>
            </div>

            <p className="text-sm text-gray-400 mb-3">{contract.description}</p>

            <div className="flex flex-wrap gap-2">
              {contract.features.map((feature) => (
                <span key={feature} className="text-[10px] px-2 py-1 rounded bg-white/5 text-gray-400">
                  {feature}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Deploy Guide */}
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-4">Deploy Guide</h2>
        <div className="space-y-3">
          {deploySteps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="flex gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-sm font-bold text-emerald-400 shrink-0">
                {step.step}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium mb-1">{step.title}</h4>
                <p className="text-xs text-gray-500 mb-2">{step.description}</p>
                <code className="text-xs font-mono text-cyan-400 bg-white/5 px-2 py-1 rounded">
                  {step.command}
                </code>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* USDC Info */}
      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 mb-10">
        <div className="flex items-center gap-3 mb-4">
          <Coins className="w-5 h-5 text-emerald-400" />
          <h3 className="font-semibold">USDC on Base</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <span className="text-sm text-gray-400">Mainnet</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono">{USDC_ADDRESS[BASE_CHAIN_ID]}</span>
              <button
                onClick={() => copyToClipboard(USDC_ADDRESS[BASE_CHAIN_ID], 'usdc-main')}
                className="p-1 rounded hover:bg-white/10"
              >
                {copiedField === 'usdc-main' ? (
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-400">Testnet (Sepolia)</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono">{USDC_ADDRESS[BASE_TESTNET_CHAIN_ID]}</span>
              <button
                onClick={() => copyToClipboard(USDC_ADDRESS[BASE_TESTNET_CHAIN_ID], 'usdc-test')}
                className="p-1 rounded hover:bg-white/10"
              >
                {copiedField === 'usdc-test' ? (
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Path */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 border border-emerald-500/10">
        <div className="flex items-center gap-3 mb-3">
          <Shield className="w-5 h-5 text-emerald-400" />
          <h3 className="font-semibold">Future Upgrades</h3>
        </div>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Replace admin finalize with multi-sig or DAO voting
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Oracle-based settlement for automatic delivery verification
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Dispute resolution system with evidence submission
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Off-chain orderbook engine for gasless signature-based trades
          </li>
        </ul>
      </div>
    </div>
  );
}
