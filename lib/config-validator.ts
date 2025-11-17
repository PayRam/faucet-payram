import { ethers } from "ethers";

interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateEnvironmentConfig(): ConfigValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check Database Configuration
  if (!process.env.DB_HOST) {
    errors.push("DB_HOST is not set");
  }
  if (!process.env.DB_DATABASE) {
    errors.push("DB_DATABASE is not set");
  }
  if (!process.env.DB_USERNAME) {
    errors.push("DB_USERNAME is not set");
  }
  if (!process.env.DB_PASSWORD) {
    warnings.push("DB_PASSWORD is not set (might be required)");
  }

  // Check RPC Configuration
  if (!process.env.ETHEREUM_MAINNET_RPC) {
    errors.push("ETHEREUM_MAINNET_RPC is not set");
  } else if (process.env.ETHEREUM_MAINNET_RPC.includes("YOUR_API_KEY")) {
    errors.push("ETHEREUM_MAINNET_RPC contains placeholder value");
  }

  if (!process.env.SEPOLIA_RPC) {
    errors.push("SEPOLIA_RPC is not set");
  } else if (process.env.SEPOLIA_RPC.includes("YOUR_API_KEY")) {
    errors.push("SEPOLIA_RPC contains placeholder value");
  }

  // Check Treasury Configuration
  if (!process.env.TREASURY_PRIVATE_KEYS) {
    errors.push("TREASURY_PRIVATE_KEYS is not set");
  } else {
    const keys = process.env.TREASURY_PRIVATE_KEYS.split(",");
    if (keys.some((key) => key.includes("YOUR_PRIVATE_KEY"))) {
      errors.push("TREASURY_PRIVATE_KEYS contains placeholder values");
    }

    // Validate private key format
    keys.forEach((key, index) => {
      const trimmedKey = key.trim();
      if (!trimmedKey.startsWith("0x")) {
        errors.push(`Treasury private key ${index + 1} must start with 0x`);
      } else if (trimmedKey.length !== 66) {
        errors.push(
          `Treasury private key ${
            index + 1
          } has invalid length (expected 66 characters)`
        );
      } else {
        try {
          new ethers.Wallet(trimmedKey);
        } catch {
          errors.push(`Treasury private key ${index + 1} is invalid`);
        }
      }
    });

    if (keys.length < 2) {
      warnings.push(
        "Only one treasury wallet configured. Consider adding more for redundancy."
      );
    }
  }

  // Check WalletConnect Configuration
  if (!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
    errors.push("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set");
  } else if (
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID === "YOUR_PROJECT_ID"
  ) {
    errors.push(
      "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID contains placeholder value"
    );
  }

  // Check Twitter Configuration
  if (!process.env.TWITTER_BEARER_TOKEN) {
    warnings.push(
      "TWITTER_BEARER_TOKEN is not set. Tweet verification will use fallback mode."
    );
  } else if (process.env.TWITTER_BEARER_TOKEN === "your_twitter_bearer_token") {
    warnings.push("TWITTER_BEARER_TOKEN appears to be a placeholder value");
  }

  // Validate Faucet Configuration
  const minBalance = parseFloat(process.env.MIN_MAINNET_BALANCE || "0.0025");
  if (isNaN(minBalance) || minBalance <= 0) {
    errors.push("MIN_MAINNET_BALANCE must be a positive number");
  }

  const cooldownMinutes = parseInt(process.env.COOLDOWN_MINUTES || "5");
  if (isNaN(cooldownMinutes) || cooldownMinutes < 1) {
    errors.push("COOLDOWN_MINUTES must be a positive integer");
  }

  const dailyLimit = parseInt(process.env.DAILY_CLAIM_LIMIT || "3");
  if (isNaN(dailyLimit) || dailyLimit < 1) {
    errors.push("DAILY_CLAIM_LIMIT must be a positive integer");
  }

  const faucetAmount = parseFloat(process.env.FAUCET_AMOUNT || "0.05");
  if (isNaN(faucetAmount) || faucetAmount <= 0) {
    errors.push("FAUCET_AMOUNT must be a positive number");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function logConfigValidation(): void {
  const result = validateEnvironmentConfig();

  console.log("\n========================================");
  console.log("   Environment Configuration Check");
  console.log("========================================\n");

  if (result.errors.length > 0) {
    console.error("❌ ERRORS:");
    result.errors.forEach((error) => console.error(`  - ${error}`));
    console.log("");
  }

  if (result.warnings.length > 0) {
    console.warn("⚠️  WARNINGS:");
    result.warnings.forEach((warning) => console.warn(`  - ${warning}`));
    console.log("");
  }

  if (result.isValid && result.warnings.length === 0) {
    console.log("✅ All environment variables are properly configured!");
  } else if (result.isValid) {
    console.log("✅ Configuration is valid (with warnings)");
  } else {
    console.error("❌ Configuration has errors that must be fixed!");
    console.error(
      "\nPlease check your .env.local file and fix the errors above."
    );
    console.error("See QUICKSTART.md or README.md for setup instructions.\n");
  }

  console.log("========================================\n");
}
