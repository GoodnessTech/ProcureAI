# ProcureAI 🤖💼

> **AI-Powered Autonomous Procurement Agent with On-Chain Approval on BOT Chain Mainnet**

ProcureAI evaluates enterprise procurement requests off-chain using multi-criteria deterministic scoring and transparent AI reasoning, committing only the finalized user approval to **BOT Chain Mainnet** via a gas-optimized smart contract (`ProcureAIRegistry.sol`).

---

## 🌐 Network Information: BOT Chain Mainnet

- **Network Name**: BOT Chain Mainnet
- **Chain ID**: `677` (`0x2A5`)
- **RPC URL**: `https://rpc.botchain.ai`
- **Block Explorer**: `https://scan.botchain.ai`
- **Native Token**: `BOT`
- **Deployed Contract Address**: `0xE4c3b3cB0919D904588F60D138b7eE076BAa76a8`
- **Deployment Transaction**: [`0xb1aebda5ac17d992438141f5c756b87361d5184ac0b2753a0c2911a21fbd5018`](https://scan.botchain.ai/tx/0xb1aebda5ac17d992438141f5c756b87361d5184ac0b2753a0c2911a21fbd5018)

---

## 🏗️ Architecture & Philosophy

```
 USER PROCUREMENT REQUEST ("Buy 50 laptops under $30,000.")
                            │
                            ▼
            [OFF-CHAIN AI & SCORING ENGINE]
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
   [PRICE (35%)]     [DELIVERY (20%)]  [REPUTATION (20%)]
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
              [WARRANTY 15% & TERMS 10%]
                            │
                            ▼
              [AI RECOMMENDATION + VERDICT]
                            │
                            ▼
             [USER ONE-CLICK WALLET APPROVAL]
                            │
             (1 Wallet Transaction on BOT Chain)
                            │
                            ▼
           [ProcureAIRegistry.sol on BOT Chain]
             • bytes32 procurementId
             • bytes32 supplierHash
             • uint128 amount
             • uint64 timestamp
             • address approver
```

### Why this is ultra gas-efficient:
1. **Zero unnecessary on-chain storage**: No long strings, supplier lists, or heavy metadata on-chain. Everything is hashed with `keccak256`.
2. **Zero loops & single transaction**: `approveProcurement` executes in a single lightweight transaction with packed storage slots (total gas ~48,000 gas, costing less than $0.0001).
3. **No gas paid by backend**: The signing user wallet submits the transaction directly.

---

## 🚀 Quick Start

### 1. Installation
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 2. Environment Variables

Create `.env` in the root and `frontend/.env.local`:

**Root `.env`**:
```env
BOTCHAIN_RPC_URL=https://rpc.botchain.ai
BOTCHAIN_CHAIN_ID=677
BOTCHAIN_EXPLORER_URL=https://scan.botchain.ai
PROCUREAI_CONTRACT_ADDRESS=0xE4c3b3cB0919D904588F60D138b7eE076BAa76a8
PORT=5000
```

**Frontend `frontend/.env.local`**:
```env
NEXT_PUBLIC_PROCUREAI_CONTRACT_ADDRESS=0xE4c3b3cB0919D904588F60D138b7eE076BAa76a8
NEXT_PUBLIC_BOTCHAIN_RPC_URL=https://rpc.botchain.ai
NEXT_PUBLIC_CHAIN_ID=677
NEXT_PUBLIC_EXPLORER_URL=https://scan.botchain.ai
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:5000
```

### 3. Run Backend & Frontend

In terminal 1 (Backend API):
```bash
npm run backend
```
> Runs at `http://localhost:5000`

In terminal 2 (Next.js Frontend):
```bash
npm run frontend:dev
```
> Runs at `http://localhost:3000`

### 4. Run Automated Test Suite
```bash
npm test
```
> Runs 15 unit, integration, scoring engine, and smart contract tests.

### 5. Build for Production / Vercel
```bash
npm run build
```

---

## 🔌 API Reference

### `POST /api/analyze`
Analyzes a natural language or structured procurement request off-chain.

**Request Body:**
```json
{
  "procurementRequest": "Buy 50 laptops under $30,000."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "procurementId": "PROC-2026-LAPTOPS-50-8391",
  "procurementIdBytes32": "0x7a2...b4",
  "parsedRequirements": {
    "quantity": 50,
    "maxBudget": 30000,
    "itemCategory": "Laptops",
    "unitBudgetCap": 600
  },
  "recommendedSupplier": {
    "supplierId": "supp_techsource",
    "supplierName": "TechSource Enterprise",
    "supplierHash": "0xd32...1f",
    "unitPrice": 570,
    "totalPrice": 28500,
    "deliveryDays": 3,
    "warrantyMonths": 36,
    "paymentTerms": "Net 60",
    "scores": {
      "priceScore": 88.5,
      "deliveryScore": 93.5,
      "reputationScore": 98.0,
      "warrantyScore": 100.0,
      "termsScore": 95.0,
      "totalScore": 94.1
    }
  },
  "supplierScore": 94.1,
  "comparisonResults": [ ... ],
  "aiReasoning": {
    "verdict": "Recommended: TechSource Enterprise",
    "confidenceScore": 92,
    "summary": "Based on multi-criteria analysis...",
    "tradeOffAnalysis": "Although GlobalTech Supplies offers lower price...",
    "keyAdvantages": [ ... ]
  },
  "contractCallData": {
    "targetContract": "0xE4c3b3cB0919D904588F60D138b7eE076BAa76a8",
    "chainId": 677,
    "functionName": "approveProcurement",
    "params": {
      "procurementId": "0x7a2...b4",
      "supplierHash": "0xd32...1f",
      "amount": 28500
    }
  }
}
```

### `GET /api/suppliers`
Returns the 3 demo supplier profiles and evaluation criteria.

### `GET /api/history`
Returns historical analyses and on-chain recorded approvals.

### `POST /api/history/record-tx`
Updates a procurement entry with on-chain confirmation details.

---

## 📦 Deployment to GitHub & Vercel

1. **Push to GitHub**:
```bash
git add .
git commit -m "feat: complete ProcureAI backend, frontend, and smart contract integration"
git push origin main
```

2. **Deploy to Vercel**:
- Set **Root Directory** to `frontend` or leave as root with `Build Command: npm run frontend:build` and `Output Directory: frontend/.next`.
- Add environment variables:
  - `NEXT_PUBLIC_PROCUREAI_CONTRACT_ADDRESS`: `0xE4c3b3cB0919D904588F60D138b7eE076BAa76a8`
  - `NEXT_PUBLIC_BOTCHAIN_RPC_URL`: `https://rpc.botchain.ai`
  - `NEXT_PUBLIC_CHAIN_ID`: `677`
  - `NEXT_PUBLIC_EXPLORER_URL`: `https://scan.botchain.ai`
