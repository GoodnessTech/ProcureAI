/**
 * ProcureAI Web3 Helper for Frontend (Bolt / React / Vite integration)
 * Facilitates single-transaction procurement approval on BOT Chain Mainnet (Chain ID 677).
 */

import { ethers } from "ethers";

export const BOT_CHAIN_CONFIG = {
  chainId: "0x2A5", // 677 in hexadecimal
  chainIdDecimal: 677,
  chainName: "BOT Chain Mainnet",
  rpcUrls: ["https://rpc.botchain.ai"],
  nativeCurrency: {
    name: "BOT",
    symbol: "BOT",
    decimals: 18,
  },
  blockExplorerUrls: ["https://scan.botchain.ai"],
};

/**
 * Ensures the user's browser wallet (MetaMask, OKX, Coinbase, etc.) is connected to BOT Chain Mainnet
 */
export async function switchOrAddBotChain() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No Web3 browser wallet detected. Please install MetaMask or a compatible wallet.");
  }

  try {
    // Attempt to switch to BOT Chain Mainnet
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: BOT_CHAIN_CONFIG.chainId }],
    });
    return true;
  } catch (switchError) {
    // Error code 4902 indicates that the chain has not been added to the wallet
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [BOT_CHAIN_CONFIG],
        });
        return true;
      } catch (addError) {
        throw new Error(`Failed to add BOT Chain to wallet: ${addError.message}`);
      }
    }
    throw new Error(`Failed to switch network: ${switchError.message}`);
  }
}

/**
 * Connects the user wallet and returns the provider, signer, and connected address
 */
export async function connectWallet() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No Web3 wallet found.");
  }

  await switchOrAddBotChain();

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const network = await provider.getNetwork();

  return {
    provider,
    signer,
    address,
    chainId: Number(network.chainId),
  };
}

/**
 * Calls `approveProcurement` on ProcureAIRegistry smart contract in a single transaction.
 * 
 * @param {ethers.Signer} signer - Connected user wallet signer
 * @param {string} contractAddress - Deployed ProcureAIRegistry address
 * @param {Array} abi - Contract ABI
 * @param {Object} params - { procurementIdBytes32, supplierHash, amount }
 */
export async function approveProcurementOnChain(signer, contractAddress, abi, params) {
  const { procurementIdBytes32, supplierHash, amount } = params;

  if (!contractAddress || contractAddress === "0x0000000000000000000000000000000000000000") {
    throw new Error("Contract address is not configured. Please set VITE_PROCUREAI_CONTRACT_ADDRESS in .env");
  }

  const contract = new ethers.Contract(contractAddress, abi, signer);

  // Single wallet transaction execution
  const tx = await contract.approveProcurement(
    procurementIdBytes32,
    supplierHash,
    BigInt(amount)
  );

  console.log("Transaction submitted:", tx.hash);

  // Wait for 1 confirmation
  const receipt = await tx.wait(1);

  const explorerUrl = `https://scan.botchain.ai/tx/${tx.hash}`;

  return {
    success: receipt.status === 1,
    txHash: tx.hash,
    blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed.toString(),
    explorerUrl,
    approver: await signer.getAddress(),
  };
}

/**
 * Checks on-chain if a procurement ID has already been recorded
 */
export async function checkIsApproved(provider, contractAddress, abi, procurementIdBytes32) {
  const contract = new ethers.Contract(contractAddress, abi, provider);
  return await contract.isApproved(procurementIdBytes32);
}

/**
 * Reads full on-chain approval record
 */
export async function getApprovalRecord(provider, contractAddress, abi, procurementIdBytes32) {
  const contract = new ethers.Contract(contractAddress, abi, provider);
  const [supplierHash, approver, timestamp, amount] = await contract.getApproval(procurementIdBytes32);
  return {
    supplierHash,
    approver,
    timestamp: Number(timestamp),
    amount: Number(amount),
    isApproved: approver !== ethers.ZeroAddress
  };
}
