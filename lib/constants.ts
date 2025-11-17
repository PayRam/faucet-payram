export const FAUCET_CONFIG = {
  MIN_MAINNET_BALANCE: parseFloat(process.env.MIN_MAINNET_BALANCE || "0.0025"),
  COOLDOWN_MINUTES: parseInt(process.env.COOLDOWN_MINUTES || "5"),
  DAILY_CLAIM_LIMIT: parseInt(process.env.DAILY_CLAIM_LIMIT || "3"),
  FAUCET_AMOUNT: process.env.FAUCET_AMOUNT || "0.05",
};

export const TWEET_REQUIREMENTS = {
  REQUIRED_KEYWORDS: ["Sepolia", "Payram", "faucet"],
  MIN_LENGTH: 50,
};

export const ERROR_MESSAGES = {
  INVALID_ADDRESS: "Invalid wallet address",
  INVALID_TWEET: "Invalid tweet URL",
  INSUFFICIENT_BALANCE: "Insufficient mainnet balance",
  TWEET_ALREADY_USED: "This tweet has already been used",
  COOLDOWN_ACTIVE: "Please wait before claiming again",
  DAILY_LIMIT_REACHED: "Daily claim limit reached",
  TWEET_NOT_FOUND: "Tweet not found or deleted",
  DISTRIBUTION_FAILED: "Failed to send ETH",
  DATABASE_ERROR: "Database error occurred",
};

export const SUCCESS_MESSAGES = {
  CLAIM_SUCCESS: "Successfully claimed Sepolia ETH!",
  VERIFICATION_SUCCESS: "Tweet verified successfully",
};
