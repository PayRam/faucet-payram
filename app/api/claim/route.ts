import { NextRequest, NextResponse } from "next/server";
import { initializeDatabase, AppDataSource } from "@/lib/database";
import { FaucetClaim } from "@/lib/entities/FaucetClaim";
import { ethers } from "ethers";
import { LessThan, MoreThanOrEqual } from "typeorm";
import axios from "axios";

const MIN_MAINNET_BALANCE = parseFloat(
  process.env.MIN_MAINNET_BALANCE || "0.0025"
);
const COOLDOWN_MINUTES = parseInt(process.env.COOLDOWN_MINUTES || "5");
const DAILY_CLAIM_LIMIT = parseInt(process.env.DAILY_CLAIM_LIMIT || "3");
const FAUCET_AMOUNT = process.env.FAUCET_AMOUNT || "0.05";

// Helper function to verify tweet
async function verifyTweet(tweetUrl: string): Promise<{
  tweetId: string;
  tweetAccount: string;
  isValid: boolean;
}> {
  try {
    // Extract tweet ID from URL
    const tweetIdMatch = tweetUrl.match(/status\/(\d+)/);
    if (!tweetIdMatch) {
      throw new Error("Invalid tweet URL format");
    }

    const tweetId = tweetIdMatch[1];

    // Extract username from URL
    // const usernameMatch = tweetUrl.match(/twitter\.com\/([^\/]+)\//);
    // const tweetAccount = usernameMatch ? usernameMatch[1] : "unknown";

    // Here you would implement actual Twitter API verification
    const apiKey = process.env.TWITTER_API_KEY;

    console.log("=== Tweet Verification Debug ===");
    console.log("Tweet ID:", tweetId);
    console.log("API Key exists:", !!apiKey);
    console.log(
      "API Key value:",
      apiKey ? `${apiKey.substring(0, 10)}...` : "not set"
    );
    console.log(
      "API Key is valid:",
      apiKey && apiKey !== "your_TWITTER_API_KEY"
    );

    if (apiKey && apiKey !== "your_TWITTER_API_KEY") {
      console.log("Making Twitter API request...");

      try {
        // Make actual Twitter API call
        const apiUrl = `https://api.twitterapi.io/twitter/tweets?tweet_ids=${tweetId}`;
        console.log("API URL:", apiUrl);

        const response = await axios.get(apiUrl, {
          headers: { "X-API-Key": apiKey },
        });

        console.log("Twitter API response status:", response.status);

        const data = response.data;
        const tweetText = data.tweets[0]?.text || "";
        console.log("Tweet text:", tweetText);

        // Verify tweet contains required keywords
        const hasRequiredContent = tweetText.includes(
          "I'm claiming free Sepolia ETH from @PayRamApp Faucet! 🚀\n\nGet yours at"
        );

        console.log("Has required content:", hasRequiredContent);

        const tweetAccount = data.tweets[0]?.author.userName || "unknown";

        return {
          tweetId,
          tweetAccount,
          isValid: hasRequiredContent,
        };
      } catch (apiError: any) {
        console.error("Twitter API request failed:", apiError.message);
        if (apiError.response) {
          console.error(
            "API Error Response:",
            apiError.response.status,
            apiError.response.data
          );
        }
        throw new Error(`Twitter API error: ${apiError.message}`);
      }
    }

    // No fallback - require proper API configuration
    console.log("Twitter API key not configured properly");
    throw new Error(
      "Twitter API key is not configured. Please contact the administrator."
    );
  } catch (error) {
    console.error("Tweet verification error:", error);
    throw new Error("Failed to verify tweet");
  }
}

// Helper function to check mainnet balance
async function checkMainnetBalance(address: string): Promise<boolean> {
  try {
    const rpcUrl = process.env.ETHEREUM_MAINNET_RPC;
    if (!rpcUrl || rpcUrl.includes("YOUR_API_KEY")) {
      console.warn("Mainnet RPC not configured, skipping balance check");
      return true; // Skip check if not configured
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const balance = await provider.getBalance(address);
    const balanceInEth = parseFloat(ethers.formatEther(balance));

    return balanceInEth >= MIN_MAINNET_BALANCE;
  } catch (error) {
    console.error("Balance check error:", error);
    return false;
  }
}

// Helper function to select random treasury wallet
function getRandomTreasuryWallet(): ethers.Wallet {
  const privateKeys = (process.env.TREASURY_PRIVATE_KEYS || "").split(",");

  if (!privateKeys.length || privateKeys[0].includes("YOUR_PRIVATE_KEY")) {
    throw new Error("Treasury wallets not configured");
  }

  const randomIndex = Math.floor(Math.random() * privateKeys.length);
  const rpcUrl = process.env.SEPOLIA_RPC;

  if (!rpcUrl || rpcUrl.includes("YOUR_API_KEY")) {
    throw new Error("Sepolia RPC not configured");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  return new ethers.Wallet(privateKeys[randomIndex].trim(), provider);
}

// Helper function to distribute ETH
async function distributeETH(
  toAddress: string,
  amount: string
): Promise<string> {
  try {
    const wallet = getRandomTreasuryWallet();
    const tx = await wallet.sendTransaction({
      to: toAddress,
      value: ethers.parseEther(amount),
    });

    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error("Distribution error:", error);
    throw new Error("Failed to send ETH");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, tweetUrl } = body;

    // Validate input
    if (!walletAddress || !ethers.isAddress(walletAddress)) {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 }
      );
    }

    if (!tweetUrl) {
      return NextResponse.json(
        { error: "Tweet URL is required" },
        { status: 400 }
      );
    }

    // Initialize database
    await initializeDatabase();
    const claimRepository = AppDataSource.getRepository(FaucetClaim);

    // Check mainnet balance
    const hasMinBalance = await checkMainnetBalance(walletAddress);
    if (!hasMinBalance) {
      return NextResponse.json(
        {
          error: `Insufficient mainnet balance. Minimum ${MIN_MAINNET_BALANCE} ETH required.`,
        },
        { status: 400 }
      );
    }

    // Verify tweet
    const { tweetId, tweetAccount, isValid } = await verifyTweet(tweetUrl);

    if (!isValid) {
      return NextResponse.json(
        { error: "Tweet does not meet requirements" },
        { status: 400 }
      );
    }

    // Check if tweet was already used
    const existingTweet = await claimRepository.findOne({
      where: { tweet_id: tweetId },
    });

    if (existingTweet) {
      return NextResponse.json(
        { error: "This tweet has already been used for a claim" },
        { status: 400 }
      );
    }

    // Check cooldown (5 minutes)
    const cooldownTime = new Date(Date.now() - COOLDOWN_MINUTES * 60 * 1000);
    const recentClaim = await claimRepository.findOne({
      where: {
        to_wallet_address: walletAddress,
        time_stamp: MoreThanOrEqual(cooldownTime),
      },
      order: { time_stamp: "DESC" },
    });

    if (recentClaim) {
      const timeLeft = Math.ceil(
        (recentClaim.time_stamp.getTime() +
          COOLDOWN_MINUTES * 60 * 1000 -
          Date.now()) /
          60000
      );
      return NextResponse.json(
        {
          error: `Please wait ${timeLeft} minute(s) before claiming again`,
        },
        { status: 429 }
      );
    }

    // Check daily claim limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailyClaims = await claimRepository.count({
      where: {
        to_wallet_address: walletAddress,
        time_stamp: MoreThanOrEqual(today),
      },
    });

    if (dailyClaims >= DAILY_CLAIM_LIMIT) {
      return NextResponse.json(
        {
          error: `Daily claim limit reached (${DAILY_CLAIM_LIMIT} claims per day)`,
        },
        { status: 429 }
      );
    }

    // Distribute ETH
    const txHash = await distributeETH(walletAddress, FAUCET_AMOUNT);

    // Save claim to database
    const claim = new FaucetClaim();
    claim.to_wallet_address = walletAddress;
    claim.tweet_id = tweetId;
    claim.tweet_account = tweetAccount;
    claim.amount = FAUCET_AMOUNT;
    await claimRepository.save(claim);

    return NextResponse.json({
      message: `Successfully sent ${FAUCET_AMOUNT} Sepolia ETH!`,
      txHash,
      amount: FAUCET_AMOUNT,
    });
  } catch (error: any) {
    console.error("Claim error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process claim" },
      { status: 500 }
    );
  }
}
