import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";

const MIN_MAINNET_BALANCE = parseFloat(
  process.env.MIN_MAINNET_BALANCE || "0.0025"
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get("address");

    // Get MIN_MAINNET_BALANCE from env
    const minBalance = process.env.MIN_MAINNET_BALANCE;
    if (!minBalance) {
      console.error("MIN_MAINNET_BALANCE is not configured");
      return NextResponse.json(
        {
          error:
            "Configuration error: MIN_MAINNET_BALANCE is not set. Please contact the administrator.",
        },
        { status: 500 }
      );
    }

    const MIN_MAINNET_BALANCE = parseFloat(minBalance);
    if (isNaN(MIN_MAINNET_BALANCE)) {
      console.error("MIN_MAINNET_BALANCE is not a valid number:", minBalance);
      return NextResponse.json(
        {
          error:
            "Configuration error: Invalid MIN_MAINNET_BALANCE value. Please contact the administrator.",
        },
        { status: 500 }
      );
    }

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
      console.error("Ethereum Mainnet RPC is not configured properly");
      return NextResponse.json(
        {
          error:
            "Configuration error: Ethereum Mainnet RPC is not configured. Please contact the administrator.",
        },
        { status: 500 }
      );
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
