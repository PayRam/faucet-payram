"use client";

import { useState, useEffect } from "react";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { mainnet } from "wagmi/chains";
import axios from "axios";
import Image from "next/image";
import {
  Linkedin,
  Twitter,
  Mail,
  ArrowUp,
  ChevronRight,
  ChevronDown,
  Globe,
  Book,
  Github,
  MessageCircle,
} from "lucide-react";
import faqData from "@/data/FAQ.json";

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
  const [openFaqId, setOpenFaqId] = useState<number | null>(1);
  const [config, setConfig] = useState({
    minMainnetBalance: 0.0025,
    cooldownMinutes: 5,
    dailyClaimLimit: 3,
    faucetAmount: "0.05",
  });

  // Fetch configuration on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await axios.get("/api/config");
        setConfig(response.data);
      } catch (error) {
        console.error("Failed to fetch config:", error);
        // Keep default values if fetch fails
      }
    };
    fetchConfig();
  }, []);

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
          `Insufficient balance. Minimum ${config.minMainnetBalance} ETH required. Current: ${response.data.balance} ETH`
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
  const hasMinBalance = minBalance >= config.minMainnetBalance;

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="p-4 md:p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Image
            src="/payram_horizontalVividGreen.svg"
            alt="PayRam Logo"
            width={180}
            height={39}
            priority
            className="w-32 md:w-[180px] h-auto"
          />
        </div>
        <div className="payram-connect-button">
          <ConnectButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:py-12 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-6 md:gap-8 items-start">
          {/* Left Side - Faucet Form */}
          <div
            className="bg-gray-900 rounded-2xl p-4 md:p-8 shadow-2xl border border-payram-green/20"
            style={{
              boxShadow:
                "0 0 40px rgba(202, 255, 84, 0.16), 0 0 80px rgba(202, 255, 84, 0.08)",
            }}
          >
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
              <Image
                src="/payram_logoIconVividGreen.svg"
                alt="PayRam Logo"
                width={60}
                height={17}
                priority
                className="w-12 md:w-[90px] h-auto"
              />
              <h1 className="text-2xl md:text-4xl font-bold text-white">
                Free Ethereum Sepolia Faucet
              </h1>
            </div>

            <p className="text-gray-300 mb-6 md:mb-8 leading-relaxed text-sm md:text-base">
              Stop hunting for testnet Ethereum Sepolia. PayRam gives you free
              and instant Sepolia ETH so you can test smart contracts, dApps,
              and payments without friction.
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
                  Enter the wallet where you want to receive the free Sepolia
                  ETH. You can connect a supported wallet or type in your
                  address manually.
                </p>
                <p className="text-gray-400 text-sm mb-4">
                  Your wallet must hold at least{" "}
                  <span className="text-payram-green font-semibold">
                    {config.minMainnetBalance} ETH on Ethereum Mainnet
                  </span>{" "}
                  to access the EVM faucet.
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
                          ⚠ Invalid ETH mainnet balance. Minimum{" "}
                          {config.minMainnetBalance} ETH required.
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
                Share a tweet
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
                      Tell the world you are using the PayRam faucet. After
                      posting, share your X post link here to unlock the next
                      step.
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
                      Click-to-Post
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
              {loading ? "Processing..." : "Claim free Sepolia ETH"}
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
            <div className="rounded-2xl p-8 shadow-2xl border border-[#F9F5F0]/30">
              <h2 className="text-2xl font-bold text-[#F9F5F0]/60 mb-4">
                What is PayRam?
              </h2>
              <p className="text-[#F9F5F0]/70 mb-6 text-base">
                PayRam is a self-hosted crypto payments gateway that powers fast
                and reliable stablecoin payments for global merchants and
                creators. PayRam enables permissionless commerce so anyone can
                accept payments without approvals or middlemen.
              </p>
              <div className="space-y-3">
                <a
                  href="https://payram.short.gy/payram-faucet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-payram-lime hover:text-payram-green font-semibold flex items-center gap-2 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  Website
                </a>
                <a
                  href="https://payram.short.gy/payram-faucet-docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-payram-lime hover:text-payram-green font-semibold flex items-center gap-2 transition-colors"
                >
                  <Book className="w-4 h-4" />
                  Docs
                </a>
                <a
                  href="https://payram.short.gy/payram-faucet-github"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-payram-lime hover:text-payram-green font-semibold flex items-center gap-2 transition-colors"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
                <a
                  href="https://payram.short.gy/payram-faucet-x"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-payram-lime hover:text-payram-green font-semibold flex items-center gap-2 transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
                </a>
                <a
                  href="https://payram.short.gy/payram-faucet-tg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-payram-lime hover:text-payram-green font-semibold flex items-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Telegram
                </a>
              </div>
            </div>

            {/* Faucet Information */}
            <div className="rounded-2xl p-8 shadow-2xl border border-[#F9F5F0]/30">
              <h3 className="text-xl font-bold text-[#F9F5F0]/60 mb-4">
                Faucet Information
              </h3>
              <ul className="space-y-3 text-[#F9F5F0]/70">
                <li className="flex items-start gap-2">
                  <span className="text-payram-green mt-1">✓</span>
                  <span>
                    Minimum {config.minMainnetBalance} ETH balance on Mainnet
                    required
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-payram-green mt-1">✓</span>
                  <span>
                    {config.cooldownMinutes} minutes cooldown between claims
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-payram-green mt-1">✓</span>
                  <span>
                    Maximum {config.dailyClaimLimit} claims per day per wallet
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-payram-green mt-1">✓</span>
                  <span>Each tweet must be unique for claiming</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-payram-green mt-1">✓</span>
                  <span>
                    {config.faucetAmount} Sepolia ETH per successful claim
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 md:mt-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#F9F5F0]/60 mb-6 md:mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqData.map((faq) => (
              <div
                key={faq.id}
                className="rounded-xl border border-[#F9F5F0]/30 overflow-hidden bg-transparent"
              >
                <button
                  onClick={() =>
                    setOpenFaqId(openFaqId === faq.id ? null : faq.id)
                  }
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-[#F9F5F0]/5 transition-colors"
                >
                  <span className="text-[#F9F5F0]/60 font-semibold text-base md:text-lg pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-payram-lime flex-shrink-0 transition-transform duration-300 ${
                      openFaqId === faq.id ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openFaqId === faq.id ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <div className="px-6 pb-4 pt-2">
                    <p className="text-[#F9F5F0]/70 text-sm md:text-base leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-8 md:mt-20 py-8 md:py-16 bg-payram-lime">
        <div className="container mx-auto px-6 md:px-12 lg:px-16">
          {/* First Row - Logo and Social Links */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 mb-8 md:mb-12">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Image
                src="/PayRam_longshadow_long_1.svg"
                alt="PayRam Logo"
                width={400}
                height={88}
                priority
                className="w-64 md:w-[400px] h-auto"
              />
            </div>

            {/* Social Links and Back to Top */}
            <div className="flex items-center gap-3 md:gap-4">
              <a
                href="https://www.linkedin.com/company/payram"
                className="flex items-center gap-2 text-gray-900 hover:text-black transition-colors text-sm md:text-base"
              >
                <svg
                  className="w-4 h-4 md:w-5 md:h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                <span>LinkedIn</span>
              </a>
              <a
                href="https://payram.short.gy/payram-faucet-x"
                className="flex items-center gap-2 text-gray-900 hover:text-black transition-colors text-sm md:text-base"
              >
                <Twitter className="w-4 h-4 md:w-5 md:h-5" />
                <span>Twitter</span>
              </a>
              <a
                href="mailto:dev@payram.com"
                className="flex items-center gap-2 text-gray-900 hover:text-black transition-colors text-sm md:text-base"
              >
                <Mail className="w-4 h-4 md:w-5 md:h-5" />
                <span>Email</span>
              </a>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="ml-2 w-10 h-10 md:w-11 md:h-11 rounded-full bg-black hover:bg-gray-900 transition-colors flex items-center justify-center text-payram-lime"
              >
                <ArrowUp className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
          </div>

          {/* Second Row - Copyright */}
          <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-900">
            <span className="whitespace-nowrap">© 2025 — Copyright</span>
            <span className="hidden md:inline">|</span>
            <div className="flex flex-wrap gap-2 md:gap-4">
              <a
                href="https://payram.com/privacy-policy"
                className="hover:text-black transition-colors whitespace-nowrap"
              >
                Privacy Policy
              </a>
              <a
                href="https://payram.com/terms-and-conditions"
                className="hover:text-black transition-colors whitespace-nowrap"
              >
                Terms & Conditions
              </a>
              <a
                href="https://payram.com/cookie-policy"
                className="hover:text-black transition-colors whitespace-nowrap"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
