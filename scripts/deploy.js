const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");

// Load local .env
const envPath = path.join(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = (match[2] || "").trim().replace(/^['"]|['"]$/g, "");
    }
  }
}

const RPC_URL = process.env.BOTCHAIN_RPC_URL || "https://rpc.botchain.ai";
const CHAIN_ID = 677;

let reqId = 1;
async function callRpc(method, params = [], retries = 5) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(RPC_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "ProcureAI-Deployer/1.0"
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: reqId++,
          method,
          params
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      if (json.error) {
        throw new Error(`RPC Error [${json.error.code}]: ${json.error.message}`);
      }

      return json.result;
    } catch (err) {
      if (attempt === retries) throw err;
      console.warn(`⚠️ RPC Call [${method}] attempt ${attempt} failed: ${err.message}. Retrying in 1.5s...`);
      await new Promise((res) => setTimeout(res, 1500));
    }
  }
}

async function main() {
  console.log("==================================================");
  console.log("🚀 ProcureAI Gas-Optimized Deployment on BOT Chain");
  console.log("==================================================");
  console.log(`🌐 Network: BOT Chain Mainnet`);
  console.log(`🔗 Chain ID: ${CHAIN_ID}`);
  console.log(`📡 RPC Endpoint: ${RPC_URL}`);

  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey || privateKey.startsWith("0x0000000000000000000000000000000000000000000000000000000000000001")) {
    throw new Error("No valid deployer PRIVATE_KEY found in .env.");
  }

  const wallet = new ethers.Wallet(privateKey);
  console.log(`👤 Deployer Address: ${wallet.address}`);

  // 1. Check Chain ID
  const rpcChainIdHex = await callRpc("eth_chainId");
  const rpcChainId = parseInt(rpcChainIdHex, 16);
  console.log(`✅ Verified On-Chain ID: ${rpcChainId}`);

  // 2. Query Balance
  const balanceHex = await callRpc("eth_getBalance", [wallet.address, "latest"]);
  const balanceWei = BigInt(balanceHex);
  const balanceBOT = ethers.formatEther(balanceWei);
  console.log(`💰 Deployer Balance: ${balanceBOT} BOT`);

  if (balanceWei === 0n) {
    throw new Error("Deployer account has 0 BOT balance. Please fund wallet with native BOT.");
  }

  // 3. Load Compiled Artifact
  const artifactPath = path.join(
    __dirname,
    "../artifacts/contracts/ProcureAIRegistry.sol/ProcureAIRegistry.json"
  );
  if (!fs.existsSync(artifactPath)) {
    throw new Error(`Artifact not found at ${artifactPath}. Please run npm run compile first.`);
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const { abi, bytecode } = artifact;

  // 4. Query Gas Price & Estimate Gas Limit
  console.log("⛽ Calculating minimum optimal gas fees...");
  const gasPriceHex = await callRpc("eth_gasPrice");
  const gasPrice = BigInt(gasPriceHex);
  console.log(`   Minimum Gas Price: ${ethers.formatUnits(gasPrice, "gwei")} Gwei (${gasPrice.toString()} wei)`);

  const estimatedGasHex = await callRpc("eth_estimateGas", [{
    from: wallet.address,
    data: bytecode
  }]);
  const estimatedGas = BigInt(estimatedGasHex);
  const safeGasLimit = (estimatedGas * 115n) / 100n; // 15% safe buffer
  console.log(`   Estimated Gas Limit: ${estimatedGas.toString()} units (Safe Limit: ${safeGasLimit.toString()})`);

  const estimatedCostBOT = ethers.formatEther(safeGasLimit * gasPrice);
  console.log(`💵 Estimated Max Deployment Fee: ${estimatedCostBOT} BOT`);

  // 5. Get Account Nonce
  const nonceHex = await callRpc("eth_getTransactionCount", [wallet.address, "pending"]);
  const nonce = parseInt(nonceHex, 16);
  console.log(`🔢 Account Nonce: ${nonce}`);

  // 6. Construct & Sign Raw Transaction (Type 0 / Legacy for minimum gas overhead on EVM)
  const txData = {
    to: null, // Contract creation
    nonce: nonce,
    gasLimit: safeGasLimit,
    gasPrice: gasPrice,
    data: bytecode,
    value: 0n,
    chainId: CHAIN_ID
  };

  console.log("✍️ Signing deployment transaction...");
  const rawTx = await wallet.signTransaction(txData);

  // 7. Submit Transaction
  console.log("⏳ Submitting deployment transaction to BOT Chain Mainnet...");
  const txHash = await callRpc("eth_sendRawTransaction", [rawTx]);
  console.log(`📜 Transaction Hash: ${txHash}`);
  console.log(`🔍 Explorer Link: https://scan.botchain.ai/tx/${txHash}`);

  // 8. Wait for Block Confirmation
  console.log("⏳ Waiting for transaction receipt...");
  let receipt = null;
  for (let i = 0; i < 30; i++) {
    await new Promise((res) => setTimeout(res, 2000));
    receipt = await callRpc("eth_getTransactionReceipt", [txHash]);
    if (receipt && receipt.blockNumber) {
      break;
    }
  }

  if (!receipt || !receipt.contractAddress) {
    throw new Error(`Transaction submitted (${txHash}) but receipt not received within timeout. Check https://scan.botchain.ai/tx/${txHash}`);
  }

  const deployedAddress = ethers.getAddress(receipt.contractAddress);
  const blockNumber = parseInt(receipt.blockNumber, 16);
  const actualGasUsed = BigInt(receipt.gasUsed);
  const actualCostBOT = ethers.formatEther(actualGasUsed * gasPrice);

  console.log("==================================================");
  console.log("🎉 SUCCESS: ProcureAIRegistry Deployed to BOT Chain Mainnet!");
  console.log(`📍 Contract Address: ${deployedAddress}`);
  console.log(`🔗 Chain ID: ${CHAIN_ID}`);
  console.log(`📜 Tx Hash: ${txHash}`);
  console.log(`📦 Block Number: ${blockNumber}`);
  console.log(`⛽ Actual Gas Used: ${actualGasUsed.toString()} units`);
  console.log(`💰 Actual Deployment Cost: ${actualCostBOT} BOT`);
  console.log(`🔍 Explorer Contract: https://scan.botchain.ai/address/${deployedAddress}`);
  console.log(`🔍 Explorer Tx Link: https://scan.botchain.ai/tx/${txHash}`);
  console.log("==================================================");

  // 9. Export Configuration & ABI
  const exportDir = path.join(__dirname, "../frontend-integration");
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  // Save ABI
  const abiPath = path.join(exportDir, "contract-abi.json");
  fs.writeFileSync(abiPath, JSON.stringify(abi, null, 2));
  console.log(`💾 Saved ABI to ${abiPath}`);

  // Save Config JSON
  const configOutput = {
    contractName: "ProcureAIRegistry",
    address: deployedAddress,
    chainId: CHAIN_ID,
    network: "botchain",
    chainName: "BOT Chain Mainnet",
    rpcUrl: RPC_URL,
    explorerUrl: "https://scan.botchain.ai",
    deploymentTxHash: txHash,
    blockNumber: blockNumber,
    gasUsed: actualGasUsed.toString(),
    deploymentCostBOT: actualCostBOT,
    deployedAt: new Date().toISOString(),
    abi: abi
  };
  const configPath = path.join(exportDir, "contract-config.json");
  fs.writeFileSync(configPath, JSON.stringify(configOutput, null, 2));
  console.log(`💾 Saved configuration to ${configPath}`);

  // Save Frontend .env template
  const envFrontendPath = path.join(exportDir, ".env.frontend");
  const envFrontendContent = [
    `VITE_PROCUREAI_CONTRACT_ADDRESS=${deployedAddress}`,
    `VITE_BOTCHAIN_RPC_URL=${RPC_URL}`,
    `VITE_CHAIN_ID=${CHAIN_ID}`,
    `VITE_EXPLORER_URL=https://scan.botchain.ai`,
    `VITE_BACKEND_API_URL=http://localhost:5000`
  ].join("\n");
  fs.writeFileSync(envFrontendPath, envFrontendContent);
  console.log(`💾 Saved frontend .env to ${envFrontendPath}`);

  // Update root .env
  let envFileText = fs.readFileSync(envPath, "utf8");
  if (envFileText.includes("PROCUREAI_CONTRACT_ADDRESS=")) {
    envFileText = envFileText.replace(
      /PROCUREAI_CONTRACT_ADDRESS=.*/g,
      `PROCUREAI_CONTRACT_ADDRESS=${deployedAddress}`
    );
  } else {
    envFileText += `\nPROCUREAI_CONTRACT_ADDRESS=${deployedAddress}`;
  }
  fs.writeFileSync(envPath, envFileText);
  console.log(`💾 Updated root .env with PROCUREAI_CONTRACT_ADDRESS=${deployedAddress}`);

  console.log("==================================================");
  console.log("✨ All files and environment variables successfully configured!");
  console.log("==================================================");
}

main().catch((err) => {
  console.error("❌ Deployment failed:", err);
  process.exit(1);
});
