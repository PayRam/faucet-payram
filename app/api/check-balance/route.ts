import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";

const MIN_MAINNET_BALANCE = parseFloat(
  process.env.MIN_MAINNET_BALANCE || "0.0025"
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Validate address format
    if (!ethers.isAddress(address)) {
      return NextResponse.json(
        { error: "Invalid wallet address format" },
        { status: 400 }
      );
    }

    // Check mainnet balance
    const rpcUrl = process.env.ETHEREUM_MAINNET_RPC;

    if (!rpcUrl || rpcUrl.includes("YOUR_API_KEY")) {
      // If RPC not configured, return mock response for development
      console.warn("Mainnet RPC not configured, skipping balance check");
      return NextResponse.json({
        hasMinBalance: true,
        balance: "0.0025",
        required: MIN_MAINNET_BALANCE.toString(),
      });
    }

    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const balance = await provider.getBalance(address);
      const balanceInEth = parseFloat(ethers.formatEther(balance));
      const hasMinBalance = balanceInEth >= MIN_MAINNET_BALANCE;

      return NextResponse.json({
        hasMinBalance,
        balance: balanceInEth.toFixed(6),
        required: MIN_MAINNET_BALANCE.toString(),
      });
    } catch (rpcError) {
      console.error("RPC Error:", rpcError);
      return NextResponse.json(
        { error: "Failed to check balance. Please try again." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Balance check error:", error);
    return NextResponse.json(
      { error: "Failed to verify balance" },
      { status: 500 }
    );
  }
}
