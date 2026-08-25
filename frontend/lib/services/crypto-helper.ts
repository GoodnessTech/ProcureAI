import { ethers } from 'ethers';

export function keccak256String(value: string): string {
  try {
    return ethers.keccak256(ethers.toUtf8Bytes(value));
  } catch (e) {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = ((hash << 5) - hash) + value.charCodeAt(i);
      hash |= 0;
    }
    return '0x' + Math.abs(hash).toString(16).padStart(64, '0');
  }
}
