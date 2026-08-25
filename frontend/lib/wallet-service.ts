import type { WalletState } from './types';
import { BOT_CHAIN_NETWORK } from './contract-config';

declare global {
  interface Window {
    ethereum?: any;
  }
}

/**
 * Switches to or adds BOT Chain Mainnet (Chain ID 677) in the user's connected wallet
 */
export async function switchOrAddBotChain(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.ethereum) {
    return false;
  }

  try {
    // Attempt to switch to BOT Chain Mainnet
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: BOT_CHAIN_NETWORK.chainIdHex }],
    });
    return true;
  } catch (switchError: any) {
    // Error 4902 indicates that the chain has not been added yet
    if (switchError.code === 4902 || switchError.data?.originalError?.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: BOT_CHAIN_NETWORK.chainIdHex,
              chainName: BOT_CHAIN_NETWORK.chainName,
              rpcUrls: [BOT_CHAIN_NETWORK.rpcUrl],
              nativeCurrency: BOT_CHAIN_NETWORK.nativeCurrency,
              blockExplorerUrls: [BOT_CHAIN_NETWORK.explorerUrl],
            },
          ],
        });
        return true;
      } catch (addError: any) {
        console.error('Failed to add BOT Chain to wallet:', addError);
        throw new Error(`Failed to add BOT Chain to wallet: ${addError.message}`);
      }
    }
    console.error('Failed to switch to BOT Chain:', switchError);
    throw new Error(`Please switch your wallet to BOT Chain Mainnet (Chain ID 677)`);
  }
}

/**
 * Connects the user's Web3 wallet to BOT Chain Mainnet
 */
export async function connectWallet(): Promise<WalletState> {
  if (typeof window === 'undefined') {
    return { connected: false, address: null, chainId: null };
  }

  if (!window.ethereum) {
    alert(
      'No Web3 wallet detected! Please install MetaMask or another EVM-compatible browser extension to interact with BOT Chain Mainnet.'
    );
    throw new Error('No Web3 wallet extension found');
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts authorized in wallet.');
    }

    const address = accounts[0];

    // Ensure user is on BOT Chain Mainnet
    try {
      await switchOrAddBotChain();
    } catch (e: any) {
      console.warn('Network switch notice:', e.message);
    }

    const currentChainId = await window.ethereum.request({
      method: 'eth_chainId',
    });

    return {
      connected: true,
      address,
      chainId: currentChainId,
    };
  } catch (err: any) {
    console.error('Wallet connection error:', err);
    throw err;
  }
}

export async function disconnectWallet(): Promise<WalletState> {
  return {
    connected: false,
    address: null,
    chainId: null,
  };
}

export function shortenAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
