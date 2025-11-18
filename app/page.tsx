"use client";

import { useState } from "react";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { mainnet } from "wagmi/chains";
import axios from "axios";
import Image from "next/image";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const [tweetUrl, setTweetUrl] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const [verifiedAddress, setVerifiedAddress] = useState("");
  const [balanceChecked, setBalanceChecked] = useState(false);
  const [checkingBalance, setCheckingBalance] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [mainnetBalance, setMainnetBalance] = useState<any>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const handleContinue = async () => {
    const walletAddress = isConnected ? address : manualAddress;

    if (!walletAddress) {
      setMessage("Please connect your wallet or enter a wallet address");
      setMessageType("error");
      return;
    }

    setCheckingBalance(true);
    setMessage("");
    setMessageType("");

    try {
      // Check balance using the API or ethers
      const response = await axios.get(
        `/api/check-balance?address=${walletAddress}`
      );

      if (response.data.hasMinBalance) {
        setVerifiedAddress(walletAddress);
        setBalanceChecked(true);
        setMessage("Balance verified successfully!");
        setMessageType("success");
        setMainnetBalance(response.data.balance);
      } else {
        setMessage(
          `Insufficient balance. Minimum 0.0025 ETH required. Current: ${response.data.balance} ETH`
        );
        setMessageType("error");
        setBalanceChecked(false);
      }
    } catch (error: any) {
      setMessage(error.response?.data?.error || "Failed to verify balance");
      setMessageType("error");
      setBalanceChecked(false);
    } finally {
      setCheckingBalance(false);
    }
  };

  const handleClaim = async () => {
    if (!balanceChecked || !verifiedAddress) {
      setMessage("Please verify your balance first by clicking Continue");
      setMessageType("error");
      return;
    }

    if (!tweetUrl) {
      setMessage("Please enter a tweet URL");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const response = await axios.post("/api/claim", {
        walletAddress: verifiedAddress,
        tweetUrl: tweetUrl,
      });

      setMessage(response.data.message || "Successfully claimed Sepolia ETH!");
      setMessageType("success");
      setTweetUrl("");
    } catch (error: any) {
      setMessage(error.response?.data?.error || "Failed to claim tokens");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const generateTweetText = () => {
    const text = encodeURIComponent(
      "I'm claiming free Sepolia ETH from @PayRamApp Faucet! 🚀\n\nGet yours at http://faucet.payram.com\n\n#Ethereum #Sepolia #TestnetFaucet"
    );
    return `https://twitter.com/intent/tweet?text=${text}`;
  };
  console.log("Mainnet Balance:", mainnetBalance);

  const minBalance = parseFloat(mainnetBalance || "0");
  const hasMinBalance = minBalance >= 0.0025;

  return (
    <div className="min-h-screen bg-gradient-to-br from-payram-dark via-payram-purple to-payram-dark">
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Image
            src="/payram_horizontalVividGreen.svg"
            alt="Payram Logo"
            width={244}
            height={53}
            priority
          />
        </div>
        <ConnectButton />
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left Side - Faucet Form */}
          <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl border border-payram-green/20">
            <div className="flex items-center gap-3 mb-6">
              <Image
                src="/payram_logoIconVividGreen.svg"
                alt="Payram Logo"
                width={90}
                height={25}
                priority
              />
              <h1 className="text-4xl font-bold text-white">
                Ethereum Sepolia Faucet
              </h1>
            </div>

            <p className="text-gray-300 mb-8 leading-relaxed">
              QuickNode got tired of having to scrounge for testnet tokens, so
              we created this Ethereum Faucet for Sepolia.
            </p>

            {/* Wallet Connection Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="bg-payram-green text-payram-dark w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </span>
                Drop in your wallet details
              </h2>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <p className="text-gray-400 text-sm mb-4">
                  Connect your wallet! We support Coinbase Wallet, MetaMask,
                  Uniswap Wallet, and Phantom wallet. Or enter your wallet
                  address manually below.
                </p>
                <p className="text-gray-400 text-sm mb-4">
                  A user's wallet must hold at least{" "}
                  <span className="text-payram-green font-semibold">
                    0.001 ETH on Ethereum Mainnet
                  </span>{" "}
                  to use the EVM faucets.
                </p>

                {/* Manual Address Input */}
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">
                    Wallet Address{" "}
                    {!isConnected && <span className="text-red-400">*</span>}
                  </label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={isConnected ? address || "" : manualAddress}
                    onChange={(e) => {
                      if (!isConnected) {
                        setManualAddress(e.target.value);
                        setBalanceChecked(false);
                        setVerifiedAddress("");
                      }
                    }}
                    disabled={isConnected}
                    className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-payram-green focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
                  />
                  {!isConnected && (
                    <p className="text-xs text-gray-500 mt-1">
                      Enter your wallet address manually or connect your wallet
                      above
                    </p>
                  )}
                </div>

                {/* Divider */}
                <div className="flex items-center my-4">
                  <div className="flex-1 border-t border-gray-600"></div>
                  <span className="px-3 text-gray-500 text-sm">OR</span>
                  <div className="flex-1 border-t border-gray-600"></div>
                </div>

                {/* Connect Wallet Button */}
                <div className="mb-4">
                  <div className="payram-connect-button">
                    <ConnectButton />
                  </div>
                </div>

                {/* Continue Button */}
                {(isConnected || manualAddress) && !balanceChecked && (
                  <button
                    onClick={handleContinue}
                    disabled={
                      checkingBalance || (!isConnected && !manualAddress)
                    }
                    className="w-full bg-payram-green hover:bg-payram-lime text-payram-dark font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {checkingBalance ? "Checking Balance..." : "Continue →"}
                  </button>
                )}

                {balanceChecked && verifiedAddress && (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                      <span className="text-sm text-gray-400">
                        Network: <span className="text-white">Ethereum</span>
                      </span>
                      <span className="text-sm text-gray-400">
                        Chain: <span className="text-white">Sepolia</span>
                      </span>
                    </div>

                    <div className="p-3 bg-gray-900 rounded-lg">
                      <p className="text-sm text-gray-400 mb-1">
                        Wallet Address
                      </p>
                      <p className="text-white font-mono text-sm break-all">
                        {address}
                      </p>
                    </div>

                    <div
                      className={`p-3 rounded-lg ${
                        hasMinBalance ? "bg-green-900/30" : "bg-red-900/30"
                      }`}
                    >
                      <p className="text-sm text-gray-400 mb-1">
                        Mainnet Balance
                      </p>
                      <p
                        className={`font-semibold ${
                          hasMinBalance ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {mainnetBalance || "0"} ETH
                      </p>
                      {!hasMinBalance && (
                        <p className="text-red-400 text-xs mt-2">
                          ⚠ Invalid ETH mainnet balance. Minimum 0.0025 ETH
                          required.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tweet Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="bg-payram-green text-payram-dark w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </span>
                Share a tweet to get 2x bonus!
              </h2>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-start gap-3 mb-4">
                  <svg
                    className="w-6 h-6 text-payram-green flex-shrink-0 mt-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <div>
                    <p className="text-gray-300 text-sm mb-2">
                      Click the button below to compose a tweet about this
                      faucet.
                    </p>
                    <a
                      href={generateTweetText()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-payram-green hover:bg-payram-lime text-payram-dark font-semibold px-6 py-3 rounded-lg transition-all duration-200"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      Click-2-Tweet
                    </a>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm text-gray-400 mb-2">
                    Submit Tweet Post Link
                  </label>
                  <input
                    type="text"
                    placeholder="https://twitter.com/user/status/..."
                    value={tweetUrl}
                    onChange={(e) => setTweetUrl(e.target.value)}
                    className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-payram-green focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Claim Button */}
            <button
              onClick={handleClaim}
              disabled={
                loading ||
                (!isConnected && !manualAddress) ||
                (isConnected && !hasMinBalance)
              }
              className="w-full bg-gradient-to-r from-payram-green to-payram-lime text-payram-dark font-bold text-lg py-4 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              {loading ? "Processing..." : "Continue →"}
            </button>

            {/* Message Display */}
            {message && (
              <div
                className={`mt-4 p-4 rounded-lg ${
                  messageType === "success"
                    ? "bg-green-900/30 text-green-400 border border-green-700"
                    : "bg-red-900/30 text-red-400 border border-red-700"
                }`}
              >
                {message}
              </div>
            )}
          </div>

          {/* Right Side - Information */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-payram-magenta to-payram-purple rounded-2xl p-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-4">
                How to Create and Deploy an ERC20 Token (Smart Contract)
              </h2>
              <p className="text-gray-200 mb-4">
                This guide will bring you up to speed with ERC-20 tokens and
                show you how to create them.
              </p>
              <button className="text-payram-lime hover:text-payram-green font-semibold flex items-center gap-2 transition-colors">
                Explore this guide
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            <div className="bg-gradient-to-br from-payram-purple to-payram-dark rounded-2xl p-8 shadow-2xl border border-payram-green/20">
              <h2 className="text-2xl font-bold text-white mb-4">
                How to Create and Deploy an ERC-721 (NFT)
              </h2>
              <p className="text-gray-200 mb-4">
                This guide will show you how to create and deploy an ERC-721
                token.
              </p>
              <button className="text-payram-lime hover:text-payram-green font-semibold flex items-center gap-2 transition-colors">
                Explore this guide
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            {/* <div className="bg-gradient-to-br from-payram-dark to-payram-purple rounded-2xl p-8 shadow-2xl border border-payram-green/20">
              <h2 className="text-2xl font-bold text-white mb-4">
                How to Make a Flash Loan using Aave (DeFi)
              </h2>
              <p className="text-gray-200 mb-4">
                This guide will give you an overview of Aave as well as flash
                loans and walk you through how to create a flash loan smart...
              </p>
              <button className="text-payram-lime hover:text-payram-green font-semibold flex items-center gap-2 transition-colors">
                Explore this guide
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div> */}

            {/* Faucet Information */}
            <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl border border-payram-green/20">
              <h3 className="text-xl font-bold text-white mb-4">
                Faucet Information
              </h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-payram-green mt-1">✓</span>
                  <span>Minimum 0.0025 ETH balance on Mainnet required</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-payram-green mt-1">✓</span>
                  <span>5 minutes cooldown between claims</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-payram-green mt-1">✓</span>
                  <span>Maximum 3 claims per day per wallet</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-payram-green mt-1">✓</span>
                  <span>Each tweet must be unique for claiming</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-payram-green mt-1">✓</span>
                  <span>0.05 Sepolia ETH per successful claim</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-gray-800">
        <div className="container mx-auto px-4 text-center flex flex-col items-center">
          <Image
            src="/green-payram-badge-350x100.png"
            alt="Payram Logo"
            width={244}
            height={53}
            priority
          />
          <p className="text-gray-500 text-sm mt-2">
            Permissionless commerce starts here
          </p>
        </div>
      </footer>
    </div>
  );
}
