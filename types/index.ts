export interface FaucetClaimRequest {
  walletAddress: string;
  tweetUrl: string;
}

export interface FaucetClaimResponse {
  message: string;
  txHash: string;
  amount: string;
}

export interface ClaimStatus {
  canClaim: boolean;
  reason: string;
  todayClaims: number;
  dailyLimit: number;
  lastClaimTime: Date | null;
}

export interface TweetVerification {
  tweetId: string;
  tweetAccount: string;
  isValid: boolean;
  text?: string;
}

export interface TreasuryWallet {
  address: string;
  balance: string;
}

export interface FaucetStats {
  totalClaims: number;
  totalDistributed: string;
  uniqueWallets: number;
  last24Hours: number;
}
