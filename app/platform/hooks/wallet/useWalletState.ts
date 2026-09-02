// useWalletState.ts (OPTIMIZED - NO SPAM)
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { supabase } from '../../../components/Lib/supabaseClient';
import { getUSDCBalance } from '../../utils/balanceSource';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface WalletBalance {
  sol: number;
  usdc: number;
  lastUpdated: Date | null;
}

export interface WalletState {
  connected: boolean;
  connecting: boolean;
  ready: boolean;
  publicKey: PublicKey | null;
  walletAddress: string | null;
  solBalance: number | null;
  usdcBalance: number | null;
  isWalletReady: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface WalletStateReturn extends WalletState {
  setUsdcBalance: (balance: number | ((prev: number | null) => number | null)) => void;
  fetchBalances: () => Promise<void>;
  refreshBalances: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  saveWalletToProfile: (address: string) => Promise<boolean>;
  getStoredWallet: () => Promise<string | null>;
  hasSufficientBalance: (requiredUsdc: number) => boolean;
  formattedSolBalance: string;
  formattedUsdcBalance: string;
}

// ============================================
// CONSTANTS
// ============================================

const BALANCE_REFRESH_INTERVAL_MS = 120000; // Changed to 2 minutes (was 30 seconds)
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;
let lastBalanceLogTime = 0;

// ============================================
// HELPER FUNCTIONS
// ============================================

export function formatSolBalance(balance: number | null): string {
  if (balance === null) return '--';
  return `${balance.toFixed(4)} SOL`;
}

export function formatUsdcBalance(balance: number | null): string {
  if (balance === null) return '--';
  return `$${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function hasSufficientBalance(balance: number | null, required: number): boolean {
  if (balance === null) return false;
  return balance >= required;
}

export function shortenWalletAddress(address: string | null, startChars: number = 6, endChars: number = 4): string {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

export function getWalletStatusMessage(connected: boolean, connecting: boolean, ready: boolean): string {
  if (!ready) return 'Initializing wallet...';
  if (connecting) return 'Connecting to wallet...';
  if (connected) return 'Wallet connected';
  return 'Wallet not connected';
}

export function getWalletStatusColor(connected: boolean, connecting: boolean): string {
  if (connecting) return 'text-yellow-400';
  if (connected) return 'text-green-400';
  return 'text-red-400';
}

// ============================================
// MAIN HOOK
// ============================================

export function useWalletState(
  userId: string | undefined,
  isTestUser: boolean,
  isProfileLoaded: boolean
): WalletStateReturn {
  const { connection } = useConnection();
  const { connected, publicKey, connecting, disconnect, wallet } = useWallet();

 useEffect(() => {
    console.log("========== WALLET ==========");
    console.log("connected:", connected);
    console.log("connecting:", connecting);
    console.log("wallet:", wallet?.adapter.name);
    console.log("publicKey:", publicKey?.toString());
    console.log("============================");
}, [
    connected,
    connecting,
    publicKey,
    wallet
]);

  const ready = true;
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [usdcBalance, setUsdcBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const retryCountRef = useRef(0);
  const isFetchingRef = useRef(false); // Prevent concurrent fetches
  const syncedWalletRef = useRef<string | null>(null);  
  const onboardingSyncedRef = useRef(false);
  const fetchIdRef = useRef(0);
  const wasConnectedRef = useRef(connected);
  const syncIdRef = useRef(0);



  // ============================================
  // FETCH BALANCES (OPTIMIZED - MINIMAL LOGGING)
  // ============================================
  
  const fetchBalances = useCallback(async (): Promise<void> => {
  if (!publicKey || !connected) {
    setSolBalance(null);
    setUsdcBalance(null);
    return;
  }

  if (!isProfileLoaded) {
    setIsLoading(true);
    return;
  }

  // Always supersede any previous in-flight request.
  const fetchId = ++fetchIdRef.current;
  isFetchingRef.current = true;
  setIsLoading(true);
  setError(null);

  const now = Date.now();
  const currentWalletKey = publicKey?.toString();

  try {
    console.log("🧪 useWalletState received:", {
      isTestUser,
      connected,
      wallet: publicKey?.toString(),
    });

    // ✅ TEST USER: never call real Solana RPC.
    if (isTestUser) {
      console.log('[TEST USER] Simulating USDC balance');
      setUsdcBalance(50000); // match existing mockBalance if different
      setSolBalance(1);
      return;
    }

      let sol = 0;
      let usdc = 0;

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/wallet/balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ wallet: publicKey.toString() }),
      });

      const balanceData = await response.json();

      if (!response.ok || !balanceData.ok) {
        throw new Error(balanceData.error || 'BALANCE_UNAVAILABLE');
      }

      sol = balanceData.sol;
      usdc = balanceData.usdc;

    // Ignore stale requests after async work.
    if (fetchId !== fetchIdRef.current) {
      return;
    }

    if (
      isMountedRef.current &&
      publicKey?.toString() === currentWalletKey
    ) {
      setUsdcBalance(usdc);
      setSolBalance(sol);
      retryCountRef.current = 0;

      if (now - lastBalanceLogTime > 60000) {
        console.log('[Wallet] Balances updated');
        lastBalanceLogTime = now;
      }
    }
  } catch (err: any) {
    // Ignore stale errors too.
    if (fetchId !== fetchIdRef.current) {
      return;
    }

    if (retryCountRef.current < MAX_RETRY_ATTEMPTS) {
      retryCountRef.current++;
      setTimeout(() => {
        if (isMountedRef.current) {
          fetchBalances();
        }
      }, RETRY_DELAY_MS);
    } else {
      if (isMountedRef.current) {
        setError(err.message || 'Failed to fetch balances');
        setUsdcBalance(0);
        setSolBalance(0);
      }
    }
  } finally {
    // Only latest request may modify fetch state.
    if (
      fetchId === fetchIdRef.current &&
      isMountedRef.current
    ) {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }
}, [publicKey, connected, connection, isTestUser, isProfileLoaded]);

  // ============================================
  // REFRESH BALANCES (alias)
  // ============================================
  
  const refreshBalances = useCallback(async () => {
    await fetchBalances();
  }, [fetchBalances]);

  // ============================================
  // SAVE WALLET TO PROFILE (OPTIMIZED - NO REPEAT LOGS)
  // ============================================
  
  const saveWalletToProfile = useCallback(async (address: string): Promise<boolean> => {
    if (!userId) return false;
    
    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ wallet_address: address })
        .eq("id", userId);
      
      if (updateError) {
        console.error("[Wallet] Failed to save wallet:", updateError.message);
        setError(updateError.message);
        return false;
      }
      
      // Silent success - no log spam
      return true;
      
    } catch (err: any) {
      console.error("[Wallet] Exception saving wallet:", err);
      setError(err.message);
      return false;
    }
  }, [userId]);

  // ============================================
  // GET STORED WALLET
  // ============================================
  
  const getStoredWallet = useCallback(async (): Promise<string | null> => {
    if (!userId) return null;
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('wallet_address')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) return null;
      return profile?.wallet_address || null;
      
    } catch (err) {
      return null;
    }
  }, [userId]);

  // ============================================
  // DISCONNECT WALLET
  // ============================================
  
  const disconnectWallet = useCallback(async () => {
  try {
    await disconnect();
    setWalletAddress(null);
    setSolBalance(null);
    setUsdcBalance(null);
    setError(null);
    
    // Update DB: wallet_connected = false
    if (userId) {
      const { error: dbError } = await supabase
        .from('user_onboarding_state')
        .upsert({ 
          user_id: userId, 
          wallet_connected: false, 
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      
      if (dbError) console.error('[Wallet] Failed to update disconnect:', dbError);
    }
  } catch (err: any) {
    console.error('[Wallet] Disconnect failed:', err);
    setError(err.message);
  }
}, [disconnect, userId]); 

  // ============================================
  // AUTO-DETECT WALLET CONNECTION (OPTIMIZED)
  // ============================================
  
useEffect(() => {
  console.log('[WalletEffect] rerun', {
    connected,
    publicKey: publicKey?.toString(),
    userId,
  });

  console.log('[WalletEffect] isTestUser at effect start', isTestUser);

  const updateWallet = async () => {
    try {
      if (connected && publicKey && isProfileLoaded) {
        const key = publicKey.toString();

        console.log('[WalletEffect] wallet detected:', key);

        setWalletAddress(key);

        // ============================================
        // SYNC TO user_onboarding_state
        // ============================================
          if (userId && !onboardingSyncedRef.current) {
            console.log('[WalletEffect] syncing wallet state');

          const syncId = ++syncIdRef.current;

          const { error: onboardingError } = await supabase
            .from('user_onboarding_state')
            .upsert(
              { user_id: userId, wallet_connected: true, updated_at: new Date().toISOString() },
              { onConflict: 'user_id' }
            );

          if (syncId === syncIdRef.current) {
            if (onboardingError) {
              console.error('[WalletEffect] onboarding sync FAILED:', onboardingError);
          } else {
            onboardingSyncedRef.current = true;
            console.log('[WalletEffect] onboarding sync SUCCESS');
         }
        }
      }

         // ============================================
        // SAVE WALLET TO PROFILE
        // ============================================

        if (userId && syncedWalletRef.current !== key) {
          console.log('[WalletEffect] checking stored wallet');

          const storedAddress = await getStoredWallet();

          console.log(
            '[WalletEffect] stored wallet:',
            storedAddress
          );

          if (storedAddress !== key) {
            console.log('[WalletEffect] saving wallet to profile');

            await saveWalletToProfile(key);
          }

          syncedWalletRef.current = key;
        }

        // ============================================
        // FETCH BALANCES
        // ============================================

        console.log('[WalletEffect] fetching balances');

        await fetchBalances();

        console.log('[WalletEffect] completed successfully');
      }
    } catch (err) {
      console.error('[WalletEffect] unexpected error:', err);
    }
  };

  updateWallet();
}, [
  connected,
  publicKey,
  userId,
  ready,
  isTestUser,   // ✅ add this
  isProfileLoaded
]);

  // ============================================
  // RESET ON DISCONNECT
  // ============================================
  
  useEffect(() => {
  console.log("🔴 WALLET DISCONNECT EFFECT", {
    connected,
    wasConnected: wasConnectedRef.current,
    userId,
  });

  const was = wasConnectedRef.current;
  wasConnectedRef.current = connected;

  if (was && !connected) {
    onboardingSyncedRef.current = false;
    setWalletAddress(null);
    setSolBalance(null);
    setUsdcBalance(null);
    setError(null);

    if (userId) {
      const syncId = ++syncIdRef.current;
      console.log("🔴 ATTEMPTING DB DISCONNECT UPDATE", { userId, syncId });

      supabase
        .from('user_onboarding_state')
        .upsert(
          { user_id: userId, wallet_connected: false, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        )
        .then(({ data, error }) => {
          if (syncId !== syncIdRef.current) {
            console.log("🔴 STALE DB DISCONNECT RESULT IGNORED", { syncId });
            return;
          }
          console.log("🔴 DB DISCONNECT UPDATE RESULT", { data, error });
          if (error) console.error("[Wallet] Failed to update disconnect:", error);
        });
    }
  }
}, [connected, userId]);  

   // Native Phantom disconnect listener
useEffect(() => {
  const solana = (window as any).solana;

  if (!solana || typeof solana.on !== "function") {
    return;
  }

  const handleNativeDisconnect = () => {
    console.log("[WalletState] Detected external Phantom disconnect");

    // Immediately synchronize persistent wallet state.
    if (userId) {
      console.log("🔴 NATIVE DISCONNECT ATTEMPTING DB UPDATE", { userId });

      supabase
        .from("user_onboarding_state")
        .upsert(
          {
            user_id: userId,
            wallet_connected: false,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        )
        .then(({ error }) => {
          if (error) {
            console.error("[Wallet] Native disconnect DB update failed:", error);
          } else {
            console.log("🔴 NATIVE DISCONNECT DB UPDATE SUCCESS");
          }
        });
    }

    try {
      disconnect();
    } catch (error) {
      console.error("[WalletState] Failed to force adapter disconnect:", error);
    }
  };

  try {
    solana.on("disconnect", handleNativeDisconnect);
  } catch (error) {
    console.warn("[WalletState] Failed to attach Phantom disconnect listener:", error);
  }

  return () => {
    try {
      if (typeof solana.off === "function") {
        solana.off("disconnect", handleNativeDisconnect);
      }
    } catch {
      // Ignore cleanup errors.
    }
  };
}, [disconnect, userId]);

  // ============================================
  // SETUP BALANCE REFRESH INTERVAL (LONGER)
  // ============================================
  
  useEffect(() => {
    console.log("========== WALLET EFFECT ==========");
    console.log("connected =", connected);
    console.log("publicKey =", publicKey?.toBase58());
    console.log("userId =", userId);
    console.log("ready =", ready);
    console.log("walletAddress =", walletAddress);

    if (connected && publicKey && isProfileLoaded) {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      
      refreshIntervalRef.current = setInterval(() => {
        if (isMountedRef.current && connected && !isFetchingRef.current) {
          fetchBalances();
        }
      }, BALANCE_REFRESH_INTERVAL_MS);
      
      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
          refreshIntervalRef.current = null;
        }
      };
    }
  }, [connected, publicKey, fetchBalances]);

  // ============================================
  // CLEANUP ON UNMOUNT
  // ============================================
  
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  // ============================================
  // COMPUTED VALUES
  // ============================================
  
  const hasSufficientBalanceFn = useCallback((requiredUsdc: number): boolean => {
    return hasSufficientBalance(usdcBalance, requiredUsdc);
  }, [usdcBalance]);
  
  const formattedSolBalance = useMemo(() => formatSolBalance(solBalance), [solBalance]);
  const formattedUsdcBalance = useMemo(() => formatUsdcBalance(usdcBalance), [usdcBalance]);

  // ============================================
  // RETURN
  // ============================================
  
  return {
    connected,
    connecting,
    ready,
    publicKey,
    walletAddress,
    solBalance,
    usdcBalance,
    isWalletReady: ready,
    isLoading,
    error,
    setUsdcBalance,
    fetchBalances: () => fetchBalances(),
    refreshBalances,
    disconnectWallet,
    saveWalletToProfile,
    getStoredWallet,
    hasSufficientBalance: hasSufficientBalanceFn,
    formattedSolBalance,
    formattedUsdcBalance,
  };
}

// ============================================
// ADDITIONAL HOOKS (unchanged)
// ============================================

export function useWalletStatus() {
  const { connected, connecting, wallet } = useWallet();
  const [statusMessage, setStatusMessage] = useState<string>('');
  
  useEffect(() => {
    if (!wallet) {
      setStatusMessage('No wallet detected');
    } else if (connecting) {
      setStatusMessage('Connecting...');
    } else if (connected) {
      setStatusMessage(`Connected to ${wallet.adapter.name}`);
    } else {
      setStatusMessage('Disconnected');
    }
  }, [connected, connecting, wallet]);
  
  return {
    statusMessage,
    isConnected: connected,
    isConnecting: connecting,
    walletName: wallet?.adapter.name,
  };
}

export function useWalletTransactions() {
  const [pendingTransaction, setPendingTransaction] = useState<boolean>(false);
  const [lastTransaction, setLastTransaction] = useState<{ signature: string; timestamp: Date } | null>(null);
  
  const startTransaction = useCallback(() => {
    setPendingTransaction(true);
  }, []);
  
  const completeTransaction = useCallback((signature: string) => {
    setPendingTransaction(false);
    setLastTransaction({ signature, timestamp: new Date() });
  }, []);
  
  const failTransaction = useCallback(() => {
    setPendingTransaction(false);
  }, []);
  
  return {
    pendingTransaction,
    lastTransaction,
    startTransaction,
    completeTransaction,
    failTransaction,
  };
}

export function useWalletNetwork() {
  const { connection } = useConnection();
  const [network, setNetwork] = useState<string | null>(null);
  const [slot, setSlot] = useState<number | null>(null);
  
  useEffect(() => {
    const fetchNetworkInfo = async () => {
      try {
        const version = await connection.getVersion();
        const currentSlot = await connection.getSlot();
        setNetwork(version['solana-core']);
        setSlot(currentSlot);
      } catch (err) {
        // Silent fail
      }
    };
    
    fetchNetworkInfo();
    const interval = setInterval(fetchNetworkInfo, 30000); // Reduced frequency
    
    return () => clearInterval(interval);
  }, [connection]);
  
  return { network, slot };
}
