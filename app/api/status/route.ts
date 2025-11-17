import { NextRequest, NextResponse } from "next/server";
import { initializeDatabase, AppDataSource } from "@/lib/database";
import { FaucetClaim } from "@/lib/entities/FaucetClaim";
import { MoreThanOrEqual } from "typeorm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get("address");

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    await initializeDatabase();
    const claimRepository = AppDataSource.getRepository(FaucetClaim);

    // Get today's claims
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayClaims = await claimRepository.count({
      where: {
        to_wallet_address: walletAddress,
        time_stamp: MoreThanOrEqual(today),
      },
    });

    // Get last claim time
    const lastClaim = await claimRepository.findOne({
      where: { to_wallet_address: walletAddress },
      order: { time_stamp: "DESC" },
    });

    const cooldownMinutes = parseInt(process.env.COOLDOWN_MINUTES || "5");
    const dailyLimit = parseInt(process.env.DAILY_CLAIM_LIMIT || "3");

    let canClaim = true;
    let reason = "";

    if (todayClaims >= dailyLimit) {
      canClaim = false;
      reason = `Daily limit reached (${dailyLimit} claims per day)`;
    } else if (lastClaim) {
      const timeSinceLastClaim = Date.now() - lastClaim.time_stamp.getTime();
      const cooldownMs = cooldownMinutes * 60 * 1000;

      if (timeSinceLastClaim < cooldownMs) {
        canClaim = false;
        const minutesLeft = Math.ceil(
          (cooldownMs - timeSinceLastClaim) / 60000
        );
        reason = `Cooldown active. Wait ${minutesLeft} minute(s)`;
      }
    }

    return NextResponse.json({
      canClaim,
      reason,
      todayClaims,
      dailyLimit,
      lastClaimTime: lastClaim?.time_stamp || null,
    });
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json(
      { error: "Failed to check claim status" },
      { status: 500 }
    );
  }
}
