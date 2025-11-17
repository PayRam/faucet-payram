/**
 * Validates Ethereum address format
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validates tweet URL format
 */
export function isValidTweetUrl(url: string): boolean {
  const tweetPattern =
    /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/\w+\/status\/\d+/;
  return tweetPattern.test(url);
}

/**
 * Extracts tweet ID from URL
 */
export function extractTweetId(url: string): string | null {
  const match = url.match(/status\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Extracts username from tweet URL
 */
export function extractUsername(url: string): string | null {
  const match = url.match(/(?:twitter\.com|x\.com)\/([^\/]+)\//);
  return match ? match[1] : null;
}

/**
 * Formats time remaining in minutes
 */
export function formatTimeRemaining(milliseconds: number): string {
  const minutes = Math.ceil(milliseconds / 60000);
  return minutes === 1 ? "1 minute" : `${minutes} minutes`;
}

/**
 * Formats ETH amount for display
 */
export function formatEthAmount(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return num.toFixed(4);
}

/**
 * Shortens address for display
 */
export function shortenAddress(address: string): string {
  if (!address) return "";
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
}

/**
 * Validates private key format
 */
export function isValidPrivateKey(key: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(key);
}

/**
 * Generates a random index for treasury wallet selection
 */
export function getRandomIndex(max: number): number {
  return Math.floor(Math.random() * max);
}
