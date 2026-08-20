import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../../components/Lib/supabaseClient';
import type { Json } from '../../../components/Lib/database.types';
import { logUserActivity } from '@/lib/analytics';
import { useAuth } from '../../../components/Context/AuthContext';
import { useWallet } from '@solana/wallet-adapter-react';
import type { Asset } from '@/platform/types/asset';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface Purchase {
  id?: string;
  user_id: string | null;
  wallet_address: string;
  asset_name: string;
  asset_key: string;
  asset_name_key?: string | null;
  quantity: number;
  price_usd: number;
  total_usd: number;
  payment_token: string;
  payment_history: PaymentHistoryItem[] | null;
  tx_signature: string;
  source: string;
  created_at: string;
  latest_purchase_at: string;
  updated_at?: string;
}

export interface PaymentHistoryItem {
  token: string;
  amount: number;
  date: string;
  quantity: number;
}

export interface TransactionParams {
  token: string;
  totalUSD: number;
  txSignature: string;
  source: string;
}

export interface InvestmentStateReturn {
  purchases: Purchase[];
  setPurchases: (purchases: Purchase[]) => void;
  userHasInvested: boolean;
  setUserHasInvested: (value: boolean) => void;
  recentPurchases: Purchase[];
  latestPurchase: Purchase | null;
  showPurchaseToast: boolean;
  setShowPurchaseToast: (value: boolean) => void;
  handleJoinPresale: (asset: SelectedAsset) => void;
  handleSellAsset: (purchase: Purchase) => void;
  recordPurchase: (params: TransactionParams) => Promise<void>;
  confirmTransaction: (
    selectedAsset: Asset,
    selectedToken: string,
    setUserHasInvested: (value: boolean) => void
  ) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

// ============================================
// HELPER: Get translated asset name (hardcoded)
// ============================================

const getTranslatedAssetName = (asset: Asset): string => {
  // Priority order: displayName → translatedName → hardcoded mapping → fallback
  if (asset.displayName) return asset.displayName;
  if (asset.translatedName) return asset.translatedName;
  if (asset.nameKey) {
    const nameMap: Record<string, string> = {
      'assets.portConcessions.name': 'Port Concession Rights',
      'assets.dockingFees.name': 'Docking & Berthing Fees',
      'assets.containerHandling.name': 'Container Handling Rights',
      'assets.logisticsInfrastructure.name': 'Logistics Infrastructure',
      'assets.straitPassageRights.name': 'Strait Passage Rights',
      'assets.tilTerminalx.name': 'TIL Terminal X Digital Infrastructure',
    };
    return nameMap[asset.nameKey] || asset.nameKey.replace(/^assets\./, '').replace(/\.name$/, '');
  }
  if (asset.key) return asset.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return 'Port Asset';
};

// ============================================
// HOOK DEFINITION
// ============================================

  export function useInvestmentState(
  userId: string | undefined,
  walletAddress: string | null,
  usdcBalance: number | null,
  setUsdcBalance: (value: number | ((prev: number | null) => number | null)) => void,
  userLegalCompliant: boolean,
  selectedAsset: Asset | null,
  setSelectedAsset: (asset: Asset | null) => void,
  setShowModal: (show: boolean) => void
): InvestmentStateReturn {
  // Get the real wallet connection from the adapter
  const { publicKey: adapterPublicKey, connected: adapterConnected } = useWallet();
  // Use adapter public key if available, otherwise fall back to the passed walletAddress
  const effectiveWalletAddress = adapterPublicKey?.toString() || walletAddress;
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [userHasInvested, setUserHasInvested] = useState(false);
  const [recentPurchases, setRecentPurchases] = useState<Purchase[]>([]);
  const [latestPurchase, setLatestPurchase] = useState<Purchase | null>(null);
  const [showPurchaseToast, setShowPurchaseToast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { session: authSession } = useAuth();
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<any>(null);
  const realtimeSetupRef = useRef<string | null>(null);
  const realtimeChannelTokenRef = useRef(0);

  // ============================================
  // FETCH USER PURCHASES
  // ============================================
  
  useEffect(() => {
    if (!userId) return;

    const fetchUserPurchases = async () => {
      console.log("📦 Loading user purchases...");
      
      try {
        const { data, error } = await supabase
          .from("presale_purchases")
          .select("*")
          .eq("user_id", userId!)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("❌ Failed to fetch purchases:", error);
          setError(error.message);
          return;
        }

        console.log("✅ Purchases loaded:", data?.length);
        setPurchases((data || []) as unknown as Purchase[]);
        setError(null);
      } catch (err: any) {
        console.error("❌ Exception fetching purchases:", err);
        setError(err.message);
      }
    };

    fetchUserPurchases();
  }, [userId]);

  // ============================================
  // FETCH INVESTOR STATS & REAL-TIME SUBSCRIPTION (FIXED)
  // ============================================
/*
  useEffect(() => {
  if (!userId) return;

  let isMounted = true;
  const token = ++realtimeChannelTokenRef.current;

  const setup = () => {
    console.log("🧹 Removing ALL channels...");

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    if (!isMounted || token !== realtimeChannelTokenRef.current) return;

    console.log("📡 Creating realtime channel...");

    const channel = supabase.channel(`recent-purchases-${userId}-${token}`);

    // Attach callbacks BEFORE subscribe
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'presale_purchases',
      },
      (payload: any) => {
        console.log('📡 New purchase detected!', payload.new);

        setRecentPurchases((prev) => {
          const updated = [payload.new, ...prev];
          return updated.slice(0, 5);
        });
      }
    );

    // Subscribe after callbacks are attached
    channel.subscribe((status) => {
      if (!isMounted || token !== realtimeChannelTokenRef.current) return;

      console.log("📡 Status:", status);

      if (status === 'CHANNEL_ERROR') {
        console.error('❌ Realtime failed — retrying...');
      }
    });

    channelRef.current = channel;
  };

  setup();

  return () => {
    console.log("🧹 Cleanup on unmount");
    isMounted = false;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  };
}, [userId]);
*/

  // ============================================
  // TOAST FOR NEW PURCHASES
  // ============================================
  
  useEffect(() => {
    if (recentPurchases.length > 0 && recentPurchases[0] !== latestPurchase) {
      setLatestPurchase(recentPurchases[0]);
      setShowPurchaseToast(true);

      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }

      toastTimeoutRef.current = setTimeout(() => {
        setShowPurchaseToast(false);
      }, 5000);

      return () => {
        if (toastTimeoutRef.current) {
          clearTimeout(toastTimeoutRef.current);
        }
      };
    }
  }, [recentPurchases, latestPurchase]);

  // ============================================
  // HANDLE JOIN PRESALE
  // ============================================
  
  const handleJoinPresale = useCallback((asset: Asset) => {
    console.log('🔘 handleJoinPresale CALLED with asset:', asset);
    setSelectedAsset(asset);
    setShowModal(true);
  }, [setSelectedAsset, setShowModal]);

  // ============================================
  // HANDLE SELL ASSET (Placeholder)
  // ============================================
  
  const handleSellAsset = useCallback((purchase: Purchase) => {
    console.log('Sell requested for:', purchase);
    alert(`Sell functionality for ${purchase.asset_name} is not available yet`);
  }, []);

  // ============================================
  // RECORD PURCHASE
  // ============================================
  
  const recordPurchase = useCallback(async ({ token, totalUSD, txSignature, source }: TransactionParams) => {
    if (!userId) {
      console.error('Cannot record purchase: No user ID');
      return;
    }

    try {
      const { data: updated, error } = await supabase
        .from("presale_purchases")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });

      if (error) {
        console.error('Error fetching updated purchases:', error);
        return;
      }

      setPurchases((updated || []) as unknown as Purchase[]);
    } catch (err) {
      console.error('Exception recording purchase:', err);
    }
  }, [userId]);

  // ============================================
  // VALIDATION HELPERS
  // ============================================
  
  const validateTransaction = useCallback((
  selectedAsset: Asset,
  totalUSD: number
): { isValid: boolean; error?: string } => {
  if (!effectiveWalletAddress) {
    return { isValid: false, error: "Wallet not connected. Please connect your Solana wallet." };
  }
    
    if (!selectedAsset) {
      return { isValid: false, error: "No asset selected" };
    }
    
    if (!userId) {
      return { isValid: false, error: "User not authenticated" };
    }
    
    const assetKey = selectedAsset.key;
    const assetNameKey = selectedAsset.nameKey;
    const usdPrice = selectedAsset.price;
    
    if (!assetKey && !assetNameKey) {
      return { isValid: false, error: "Asset missing required identifier" };
    }
    
    if (!usdPrice) {
      return { isValid: false, error: "Asset missing price" };
    }
    
    if ((usdcBalance || 0) < totalUSD) {
      return { 
        isValid: false, 
        error: `Insufficient USDC balance. Required: $${totalUSD.toFixed(2)}, Available: $${(usdcBalance || 0).toFixed(2)}` 
      };
    }
    
    return { isValid: true };
  }, [effectiveWalletAddress, userId, usdcBalance]);

  // ============================================
  // CONFIRM TRANSACTION
  // ============================================
  
  const confirmTransaction = useCallback(async (
    selectedAsset: SelectedAsset,
    selectedToken: string,
    setUserHasInvestedCallback: (value: boolean) => void
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Extract asset information
      const assetKey = selectedAsset.key;
      const assetNameKey = selectedAsset.nameKey;
      const usdPrice = selectedAsset.price;
      const quantity = selectedAsset.quantity || 1;
      const totalUSD = usdPrice * quantity;
      
      // Get translated asset name for display
      const translatedAssetName = getTranslatedAssetName(selectedAsset);
      
      console.log("🔍 DEBUG - Asset in confirmTransaction:", {
        selectedAsset,
        assetKey,
        assetNameKey,
        usdPrice,
        quantity,
        totalUSD,
        translatedAssetName
      });
      
      // Validate transaction
      const validation = validateTransaction(selectedAsset, totalUSD);
      if (!validation.isValid) {
        alert(validation.error);
        return;
      }
      
      const assetName = assetKey || assetNameKey?.replace('assets.', '') || assetNameKey || 'Unknown Asset';
      const txSignature = `simulated-usdc-${Date.now()}`;
      const source = "simulated";
      
      // Check existing records
      const { data: existingRecords, error: fetchErr } = await supabase
        .from("presale_purchases")
        .select("*")
        .eq("user_id", userId!)
        .eq("asset_name", assetName);
      
      if (fetchErr) throw new Error(`Database fetch failed: ${fetchErr.message}`);
      
      const existing = existingRecords?.[0];
      let result;
      
      if (existing) {
        // Update existing purchase
        const prevHistory = (existing.payment_history as unknown as PaymentHistoryItem[]) || [];
        const updatedHistory = [...prevHistory, {
          token: selectedToken,
          amount: totalUSD,
          date: new Date().toISOString(),
          quantity
        }];
        
        result = await supabase
          .from("presale_purchases")
          .update({
            quantity: (existing.quantity || 0) + quantity,
            total_usd: (existing.total_usd || 0) + totalUSD,
            payment_history: updatedHistory as unknown as Json,
            source,
            latest_purchase_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq("id", existing.id);
      } else {
        // Store translated name in database
        const newPurchase: Partial<Purchase> = {
          user_id: userId,
          wallet_address: effectiveWalletAddress!,
          asset_name: translatedAssetName,
          asset_key: assetKey || assetName,
          asset_name_key: assetNameKey,
          quantity,
          price_usd: usdPrice,
          total_usd: totalUSD,
          payment_token: selectedToken,
          payment_history: [{
            token: selectedToken,
            amount: totalUSD,
            date: new Date().toISOString(),
            quantity
          }],
          tx_signature: txSignature,
          source,
          created_at: new Date().toISOString(),
          latest_purchase_at: new Date().toISOString()
        };
        
        console.log("🔍 DEBUG - New Purchase Object:", newPurchase);
        
        result = await supabase
          .from("presale_purchases")
          .insert([newPurchase as any]);
      }
      
      // Log user activity
      await logUserActivity(userId ?? null, effectiveWalletAddress!, 'investment_made', {
        amount: totalUSD,
        asset: translatedAssetName,
        quantity,
        txSignature
      });
      
      if (result.error) throw new Error(`Database error: ${result.error.message}`);
      
      // Update presale session
      await supabase
        .from("presale_sessions")
        .update({ has_invested: true })
        .eq("user_id", userId!);
      
      // Update local state
      setUserHasInvestedCallback(true);
      setUsdcBalance((prev) => (prev || 0) - totalUSD);
      
      // Refresh purchases
      const { data: updated } = await supabase
        .from("presale_purchases")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      
      setPurchases((updated || []) as unknown as Purchase[]);
      setShowModal(false);
      
      // Show success alert with translated asset name
      alert(`✅ Successfully invested $${totalUSD.toFixed(2)} in ${translatedAssetName}`);
      
      // Send receipt email
      try {
        console.log('[Investment] Sending receipt email to:', authSession?.user?.email);
        
        const emailResponse = await fetch('/api/email/investment_receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: authSession?.user?.email,
            firstName: authSession?.user?.user_metadata?.firstName || 'Investor',
            userId,
            assetName: translatedAssetName,
            quantity,
            pricePerUnit: usdPrice,
            totalUSD,
            paymentToken: selectedToken,
            transactionId: txSignature,
            investmentDate: new Date().toISOString(),
            userTier: userLegalCompliant ? 'executive' : 'accredited'
          })
        });
        
        const emailResult = await emailResponse.json();
        console.log('[Investment] Email receipt response:', emailResult);
        
        if (!emailResponse.ok) {
          console.error('[Investment] Email receipt failed:', emailResult.error);
        } else {
          console.log('[Investment] Email receipt sent successfully');
        }
      } catch (emailError) {
        console.error("Failed to send receipt email:", emailError);
        // Don't throw - email failure shouldn't block the investment
      }
      
    } catch (err: any) {
      console.error("❌ Transaction failed:", err);
      setError(err.message);
      alert(`Transaction failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [userId, effectiveWalletAddress, usdcBalance, validateTransaction, setUsdcBalance, setShowModal, authSession, userLegalCompliant]);

  // ============================================
  // RETURN
  // ============================================
  
  return {
    purchases,
    setPurchases,
    userHasInvested,
    setUserHasInvested,
    recentPurchases,
    latestPurchase,
    showPurchaseToast,
    setShowPurchaseToast,
    handleJoinPresale,
    handleSellAsset,
    recordPurchase,
    confirmTransaction,
    isLoading,
    error
  };
}
