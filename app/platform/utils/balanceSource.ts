// utils/balanceSource.ts
import { TEST_MODE } from "./constants";
import { checkStablecoinBalance, checkTokenBalance, USDC_MINT, BalanceCheckResult } from "./balanceCheck";
import { PublicKey } from "@solana/web3.js";

export interface BalanceSourceConfig {
  testMode?: boolean;
  mockBalance?: number;
  cacheTimeout?: number; // milliseconds
  retryAttempts?: number;
}

// Cache for balance checks
const balanceCache = new Map<string, { balance: number; timestamp: number }>();
const DEFAULT_CACHE_TIMEOUT = 60000; // Increased to 60 seconds
const DEFAULT_RETRY_ATTEMPTS = 3;
let lastCallTime = 0;
let lastCallWallet = '';
let lastCallResult = 0;

/**
 * Get USDC balance with caching and retry logic
 * @param wallet - Solana wallet public key
 * @param config - Configuration options
 * @returns Promise<number>
 */
export async function getUSDCBalance(
  wallet: PublicKey,
  config: BalanceSourceConfig = {}
): Promise<number> {
  const {
    testMode = TEST_MODE,
    mockBalance = 50000,
    cacheTimeout = DEFAULT_CACHE_TIMEOUT,
    retryAttempts = DEFAULT_RETRY_ATTEMPTS,
  } = config;
  
  const walletKey = wallet.toString();
  const now = Date.now();
  
  // PREVENT RAPID REPEATED CALLS (debounce within 500ms)
  if (lastCallWallet === walletKey && (now - lastCallTime) < 500) {
    console.log('[BalanceSource] ⏱️ Debounced - returning cached result (rapid call)');
    return lastCallResult;
  }
  
  // Check cache first
  const cached = balanceCache.get(walletKey);
  if (cached && (now - cached.timestamp) < cacheTimeout) {
    console.log('[BalanceSource] 📦 Cache hit - balance:', cached.balance);
    lastCallTime = now;
    lastCallWallet = walletKey;
    lastCallResult = cached.balance;
    return cached.balance;
  }
  
  if (testMode) {
    // Only log mock mode once per minute
    const lastMockLog = localStorage?.getItem('lastMockLog') || '0';
    if (now - parseInt(lastMockLog) > 60000) {
      console.log('[BalanceSource] 🎭 Mock mode active');
      localStorage?.setItem('lastMockLog', now.toString());
    }
    lastCallTime = now;
    lastCallWallet = walletKey;
    lastCallResult = mockBalance;
    return mockBalance;
  }
  
  console.log('[BalanceSource] 🔗 Real mode - checking blockchain');
  
  // Retry logic
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= retryAttempts; attempt++) {
    try {
      const realBalance = await checkStablecoinBalance(wallet);
      
      // Cache the result
      balanceCache.set(walletKey, { balance: realBalance, timestamp: now });
      lastCallTime = now;
      lastCallWallet = walletKey;
      lastCallResult = realBalance;
      
      return realBalance;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      if (attempt === 1) {
        console.error(`[BalanceSource] Attempt ${attempt} failed:`, lastError.message);
      }
      
      if (attempt < retryAttempts) {
        const delay = 1000 * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error('[BalanceSource] ❌ All retries failed, returning last cached or 0');
  return cached?.balance || 0;
}

/**
 * Get detailed USDC balance information
 * @param wallet - Solana wallet public key
 * @returns Promise<BalanceCheckResult>
 */
export async function getUSDCBalanceDetails(wallet: PublicKey): Promise<BalanceCheckResult> {
  if (TEST_MODE) {
    return {
      balance: 50000,
      formattedBalance: '50,000.00',
      decimals: 6,
      mint: USDC_MINT.toString(),
      success: true,
    };
  }
  
  return checkTokenBalance(wallet, USDC_MINT);
}

/**
 * Clear balance cache for a specific wallet or all wallets
 * @param walletKey - Optional wallet key to clear specific cache
 */
export function clearBalanceCache(walletKey?: string): void {
  if (walletKey) {
    balanceCache.delete(walletKey);
    console.log('[BalanceSource] 🧹 Cache cleared for wallet');
  } else {
    balanceCache.clear();
    console.log('[BalanceSource] 🧹 Full cache cleared');
  }
}

/**
 * Get current cache stats
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: balanceCache.size,
    keys: Array.from(balanceCache.keys()),
  };
}
