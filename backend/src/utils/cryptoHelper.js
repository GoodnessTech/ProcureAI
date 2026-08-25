const crypto = require("crypto");

/**
 * Computes Keccak256 / 32-byte hex hash.
 * If ethers is available, uses ethers.keccak256. Otherwise falls back to crypto sha256 or keccak.
 */
function hashString(input) {
  if (!input) return "0x0000000000000000000000000000000000000000000000000000000000000000";
  try {
    const { ethers } = require("ethers");
    if (ethers && ethers.keccak256 && ethers.toUtf8Bytes) {
      return ethers.keccak256(ethers.toUtf8Bytes(input));
    }
  } catch (e) {
    // Ethers not yet installed, use native SHA256 format for 32-byte hex representation
  }

  const hash = crypto.createHash("sha256").update(Buffer.from(input, "utf8")).digest("hex");
  return "0x" + hash;
}

module.exports = {
  hashString
};
