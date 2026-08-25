export const PROCUREAI_REGISTRY_ABI = [
  {
    "inputs": [],
    "name": "AlreadyApproved",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidAmount",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidProcurementId",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidSupplier",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "procurementId",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "supplierHash",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "approver",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint128",
        "name": "amount",
        "type": "uint128"
      },
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "timestamp",
        "type": "uint64"
      }
    ],
    "name": "ProcurementApproved",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "procurementId",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "supplierHash",
        "type": "bytes32"
      },
      {
        "internalType": "uint128",
        "name": "amount",
        "type": "uint128"
      }
    ],
    "name": "approveProcurement",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "approvals",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "supplierHash",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "approver",
        "type": "address"
      },
      {
        "internalType": "uint64",
        "name": "timestamp",
        "type": "uint64"
      },
      {
        "internalType": "uint128",
        "name": "amount",
        "type": "uint128"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "procurementId",
        "type": "bytes32"
      }
    ],
    "name": "getApproval",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "supplierHash",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "approver",
        "type": "address"
      },
      {
        "internalType": "uint64",
        "name": "timestamp",
        "type": "uint64"
      },
      {
        "internalType": "uint128",
        "name": "amount",
        "type": "uint128"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "procurementId",
        "type": "bytes32"
      }
    ],
    "name": "isApproved",
    "outputs": [
      {
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_PROCUREAI_CONTRACT_ADDRESS ||
  "0xE4c3b3cB0919D904588F60D138b7eE076BAa76a8";

export const BOT_CHAIN_NETWORK = {
  chainId: 677,
  chainIdHex: "0x2A5",
  chainName: "BOT Chain Mainnet",
  rpcUrl: process.env.NEXT_PUBLIC_BOTCHAIN_RPC_URL || "https://rpc.botchain.ai",
  explorerUrl: process.env.NEXT_PUBLIC_EXPLORER_URL || "https://scan.botchain.ai",
  nativeCurrency: {
    name: "BOT",
    symbol: "BOT",
    decimals: 18,
  },
};
