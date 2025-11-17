"use client";

import { useAccount, useBalance } from "wagmi";
import { mainnet } from "wagmi/chains";
import { useEffect, useState } from "react";
import axios from "axios";
import { ClaimStatus } from "@/types";

export function useClaimStatus() {
  const { address } = useAccount();
  const [status, setStatus] = useState<ClaimStatus | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) {
      setStatus(null);
      return;
    }

    const fetchStatus = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/status?address=${address}`);
        setStatus(response.data);
      } catch (error) {
        console.error("Failed to fetch claim status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [address]);

  return { status, loading };
}

export function useMainnetBalance() {
  const { address } = useAccount();
  const { data: balance, isLoading } = useBalance({
    address: address,
    chainId: mainnet.id,
  });

  const hasMinBalance = balance && parseFloat(balance.formatted) >= 0.0025;

  return {
    balance: balance?.formatted || "0",
    hasMinBalance,
    isLoading,
  };
}
