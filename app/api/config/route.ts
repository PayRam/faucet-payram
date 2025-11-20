import { NextResponse } from "next/server";
import { FAUCET_CONFIG } from "@/lib/constants";

export async function GET() {
  try {
    return NextResponse.json({
      minMainnetBalance: FAUCET_CONFIG.MIN_MAINNET_BALANCE,
      cooldownMinutes: FAUCET_CONFIG.COOLDOWN_MINUTES,
      dailyClaimLimit: FAUCET_CONFIG.DAILY_CLAIM_LIMIT,
      faucetAmount: FAUCET_CONFIG.FAUCET_AMOUNT,
    });
  } catch (error) {
    console.error("Config fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch configuration" },
      { status: 500 }
    );
  }
}
