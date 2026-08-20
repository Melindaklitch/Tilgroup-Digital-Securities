"use client";

import { useEffect, useState, useCallback, useMemo, useRef, useId } from 'react';
import { useAuth } from '../../components/Context/AuthContext';
import { useWalletState } from './wallet/useWalletState';
import { usePresaleSession } from './presale/usePresaleSession';
import { useKYCState } from './kyc/useKYCState';
import { useQuestionnaireState } from './questionnaire/useQuestionnaireState';
import { useLegalState } from './legal/useLegalState';
import { useInvestmentState } from './investment/useInvestmentState';
import { useUIModalState } from './ui/useUIModalState';
import { useUtilities } from './utils/useUtilities';
import { useAccessMatrix } from './useAccessMatrix';
import { TEST_MODE } from '../utils/constants';
import { supabase } from '../../components/Lib/supabaseClient';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface PlatformState {
  // Session
  session: any;
  userId: string | undefined;
  isLoading: boolean;
  error: string | null;  

  // Wallet
  walletConnected: boolean;
  connected: boolean;
  walletConnecting: boolean;
  isWalletReady: boolean; 
  ready: boolean;
  connecting: boolean;
  walletAddress: string | null;
  publicKey: any;
  usdcBalance: number | null;
  solBalance: number | null;
  formattedSolBalance: string;  
  formattedUsdcBalance: string;

  // KYC
  kycStatus: 'pending' | 'verified' | 'failed' | null;
  isCheckingKYC: boolean;
  
  // Questionnaire
  questionnaireStatus: string;
  questionnaireCompleted: boolean;
  showQuestionnaire: boolean;
  isSubmittingKYC: boolean;
  
  // Legal
  userLegalCompliant: boolean;
  legalAcknowledged: boolean;
  showLegalModal: boolean;
  showLegalRequirements: boolean;
  showDocumentModal: boolean; // <-- Added
  selectedDocument: any;      // <-- Added
  

  // Investment
  purchases: any[];
  userHasInvested: boolean;
  recentPurchases: any[];
  
  // UI
  showAssetDetail: boolean;
  showModal: boolean;
  selectedAsset: Asset | null;
  selectedAssetDetail: any;
  
  // POF
  pofVerified: boolean;
  
  // Constants
  TEST_MODE: boolean;
}

export interface PlatformStateReturn extends PlatformState {
  // Setters
  setKycStatus: (status: any) => void;
  setShowLegalModal: (show: boolean) => void;
  setShowLegalRequirements: (show: boolean) => void;
  setLegalAcknowledged: (acknowledged: boolean) => void;
  setUserLegalCompliant: (compliant: boolean) => void;
  setShowQuestionnaire: (show: boolean) => void;
  setShowAssetDetail: (show: boolean) => void;
  setSelectedAsset: (asset: any) => void;
  setSelectedToken: (token: string) => void;
  setShowModal: (show: boolean) => void;
  setSelectedAssetDetail: (asset: any) => void;
  setShowPurchaseToast: (show: boolean) => void;
  setUserHasInvested: (invested: boolean) => void;
  setShowDocumentModal: (show: boolean) => void;  
  setUsdcBalance: (balance: number) => void;
  fetchBalances: () => Promise<void>;
  refreshBalances: () => Promise<void>;
  disconnectWallet: () => Promise<void>;


  // Handlers
  handleInvestFromDetails: (asset: any, requireLegal?: boolean) => void;
  handleShowAssetDetails: (asset: any, assetKey: string) => void;
  handleViewDocument: (doc: any) => void;
  handleJoinPresale: (asset: any) => void;
  confirmTransaction: (selectedAsset: Asset, selectedToken: string, setUserHasInvested: (value: boolean) => void) => Promise<void>;
  saveWalletToProfile: (address: string) => Promise<boolean>;  
  getStoredWallet: () => Promise<string | null>;
  hasSufficientBalance: (requiredUsdc: number) => boolean;
  


  // Computed
  isFullyOnboarded: boolean;
  canAccessPlatform: boolean;
  onboardingProgress: number;
  refresh: () => Promise<void>;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate onboarding progress percentage
 */
function calculateOnboardingProgress(
  questionnaireCompleted: boolean,
  userLegalCompliant: boolean,
  walletConnected: boolean,
  pofVerified: boolean
): number {
  let progress = 0;
  
  if (questionnaireCompleted) progress += 25;
  if (userLegalCompliant) progress += 25;
  if (walletConnected) progress += 25;
  if (pofVerified) progress += 25;
  
  return progress;
}

// ============================================
// MAIN HOOK
// ============================================

export default function usePlatformState(): PlatformStateReturn {
  const { session: authSession } = useAuth();
  const userId = authSession?.user?.id;

// ============================================
// TEST USER DETECTION
// ============================================

const [isTestUser, setIsTestUser] = useState(false);
const [isProfileLoaded, setIsProfileLoaded] = useState(false);

useEffect(() => {
  if (!userId) {
    setIsTestUser(false);
    return;
  }

  const loadProfile = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", userId)
      .single();

    console.log("🧪 PROFILE QUERY", {
      userId,
      data,
      error,
    });

    if (error) {
      console.error("❌ PROFILE QUERY FAILED", error);
      setIsProfileLoaded(true);
      return;
    }

    const email = data?.email?.toLowerCase() ?? "";
    const test = email.includes("+test");
    setIsTestUser(test);
    setIsProfileLoaded(true);

    console.log("🧪 TEST USER CHECK", {
      email,
      test,
    });

    setIsTestUser(test);
  };

  loadProfile();
  }, [userId]);

  const matrix = useAccessMatrix(userId);
  const instanceId = useId();

  console.log("🏗️ PLATFORM STATE INSTANCE", {
  instanceId,
  can_invest: matrix.can_invest,
  questionnaire: matrix.questionnaire_status
});

  // Refs for optimized logging
  const prevStateRef = useRef<string>('');
  const debugExposeRef = useRef<number>(0);

  // ============================================
  // INDIVIDUAL STATE HOOKS
  // ============================================
  
  // Wallet state
  console.log("Creating useWalletState...");
  console.log('[Platform] isTestUser value', isTestUser);

  const wallet = useWalletState(
    userId,
    isTestUser,
    isProfileLoaded 
 );
  
  console.log("Wallet hook returned:", wallet);
  console.log("[Platform] Passing isTestUser =", isTestUser);

  // Presale session
  const presale = usePresaleSession(userId);

  // Questionnaire state
  const questionnaire = useQuestionnaireState();
  
  // KYC state
  const kyc = useKYCState(questionnaire.questionnaireStatus as any);

  // Legal state
  const legal = useLegalState(userId);
  
  // UI Modal state
  const ui = useUIModalState();
  
  // Utilities
  const utils = useUtilities();
    
  // ============================================
  // INVESTMENT STATE (depends on multiple hooks)
  // ============================================
  
  const investment = useInvestmentState(
    userId,
    wallet.walletAddress,
    wallet.usdcBalance,
    wallet.setUsdcBalance,
    legal.userLegalCompliant,
    ui.selectedAsset,
    ui.setSelectedAsset,
    ui.setShowModal
  );

  // ============================================
  // HANDLERS
  // ============================================
  
  /**
   * Handle investment from asset details modal
   */
 const handleInvestFromDetails = useCallback((asset: any, requireLegal: boolean = true) => {
  console.log("💰 INVESTMENT FLOW STARTED", { asset, requireLegal });
  console.log("🔍 DEBUG - Asset structure:", {
    hasKey: !!asset.key,
    hasNameKey: !!asset.nameKey,
    hasPrice: !!asset.price,
    asset: asset
  });

   console.log("🧠 INVEST GATE CHECK", {
   requireLegal,
   can_invest: matrix.can_invest,
   matrix
  });

  // Use matrix for investment permission (single source of truth)
  if (requireLegal && !matrix.can_invest) {
     console.log("🔐 Investment blocked", {
     can_invest: matrix.can_invest,
     legal: matrix.is_legally_compliant,
     wallet: wallet.connected,
     pof: matrix.pof_verified,
     questionnaire: matrix.questionnaire_status
 });
  // show correct blocking UI
     ui.setShowAssetDetail(false);
     ui.setShowModal(false);

     legal.setShowLegalRequirements(true);

    return;
  }

  // Close the asset detail modal
  ui.setShowAssetDetail(false);
  
  // Set the selected asset and open the investment modal
  ui.setSelectedAsset(asset);
  ui.setShowModal(true);
}, [
    matrix.can_invest,
    matrix.is_legally_compliant,
    wallet.connected,
    matrix.pof_verified,
    legal.setShowLegalRequirements,
    ui.setShowAssetDetail,
    ui.setSelectedAsset,
    ui.setShowModal
]);
  /**
   * Handle showing asset details
   */
  const handleShowAssetDetails = useCallback((asset: any, assetKey: string) => {
    console.log("🔍 Showing asset details for:", assetKey);
    ui.handleShowAssetDetails(asset, assetKey);
  }, [ui]);

  /**
   * Handle viewing a document
   */
  const handleViewDocument = useCallback((doc: any) => {
    console.log("📄 Viewing document:", doc);
    ui.handleViewDocument(doc);
  }, [ui]);

  /**
   * Handle joining presale
   */
  const handleJoinPresale = useCallback((asset: any) => {
    console.log("🚀 Joining presale for asset:", asset);
    investment.handleJoinPresale(asset);
  }, [investment]);

  /**
   * Confirm transaction
   */
  const confirmTransaction = useCallback(async (
    selectedAsset: Asset | null,
    selectedToken: string,
    setUserHasInvestedCallback: (value: boolean) => void
  ) => {
    console.log("💸 Confirming transaction for:", selectedAsset?.nameKey);
    await investment.confirmTransaction(selectedAsset, selectedToken, setUserHasInvestedCallback);
  }, [investment]);

  // ============================================
  // DEBUGGING - Expose to window (OPTIMIZED)
  // ============================================
  
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      const now = Date.now();
      // Only log debug exposure once every 10 seconds max
      if (now - debugExposeRef.current > 10000) {
        debugExposeRef.current = now;
        (window as any).platformState = {
          connected: wallet.connected,
          publicKey: wallet.publicKey?.toString(),
          questionnaireStatus: questionnaire.questionnaireStatus,
          userQuestionnaireCompleted: questionnaire.userQuestionnaireCompleted,
          legalCompliant: legal.userLegalCompliant,
          pofVerified: matrix.pof_verified,
          session: authSession?.user?.id
        };
        console.log("🔧 DEBUG: Exposed platformState to window");
      } else {
        // Silently update without logging
        (window as any).platformState = {
          connected: wallet.connected,
          publicKey: wallet.publicKey?.toString(),
          questionnaireStatus: questionnaire.questionnaireStatus,
          userQuestionnaireCompleted: questionnaire.userQuestionnaireCompleted,
          legalCompliant: legal.userLegalCompliant,
          pofVerified: matrix.pof_verified,
          session: authSession?.user?.id
        };
      }
    }
  }, [wallet.connected, wallet.publicKey, questionnaire.questionnaireStatus, questionnaire.userQuestionnaireCompleted, legal.userLegalCompliant, matrix.pof_verified, authSession]);

   // ============================================
  // FINAL STATUS LOGGING (OPTIMIZED - ONLY ON CHANGE)
  // ============================================
  
  useEffect(() => {
    const currentState = JSON.stringify({
    questionnaire: matrix.questionnaire_status,
    legal: matrix.is_legally_compliant,
    wallet: wallet.connected ? "connected" : "disconnected",
    pofVerified: matrix.pof_verified,
    canInvest: matrix.can_invest,
    hasSession: !!userId,
    kycTruth: matrix.kyc_verified,
  });
    
    // Only log when state actually changes
    if (prevStateRef.current !== currentState) {
      prevStateRef.current = currentState;
      console.log("📋 Platform State Summary:", JSON.parse(currentState));
    }
  }, [questionnaire.questionnaireStatus, legal.userLegalCompliant, wallet.connected, matrix.pof_verified, userId, kyc.kycStatus]);

  const refresh = useCallback(async () => {
  await matrix.refresh();
}, [matrix]);  

  // ============================================
  // COMPUTED VALUES
  // ============================================
  const isFullyOnboarded =
  matrix.can_access_dashboard &&
  matrix.can_invest;
  const canAccessPlatform = wallet.connected && matrix.can_access_dashboard;
  const onboardingProgress = useMemo(() => {
  let progress = 0;
  if (matrix.questionnaire_status === 'completed') progress += 25;
  if (matrix.is_legally_compliant) progress += 25;
  if (wallet.connected) progress += 25;
  if (matrix.pof_verified) progress += 25;
  return progress;
 }, [matrix]);

  // ============================================
  // RETURN
  // ============================================
  
      return {
      // 1. Structural Spreads (Must come first so lower declarations overwrite them safely)
      ...kyc,
      ...questionnaire,
      ...legal,
      ...investment,
      ...ui,
      ...utils,
      ...presale,

      // 2. Base Platform State Properties
      session: authSession,
      userId,
      isLoading: wallet.isLoading || matrix.isLoading || legal.isLoading || investment.isLoading,
      error: wallet.error || investment.error,
      
      // Wallet state (Use matrix as truth for connection status, preserve downstream hooks)
      walletConnected: wallet.connected,
      connected: wallet.connected,
      walletConnecting: wallet.connecting,
      walletAddress: wallet.walletAddress,
      usdcBalance: wallet.usdcBalance,
      setUsdcBalance: wallet.setUsdcBalance,
      solBalance: wallet.solBalance,
      publicKey: wallet.publicKey,
      connecting: wallet.connecting,
      ready: (wallet as any).ready ?? false,
      isWalletReady: wallet.isWalletReady,
      fetchBalances: wallet.fetchBalances,
      refreshBalances: wallet.refreshBalances,
      disconnectWallet: (wallet as any).disconnectWallet,
      saveWalletToProfile: (wallet as any).saveWalletToProfile,
      getStoredWallet: (wallet as any).getStoredWallet,
      hasSufficientBalance: (wallet as any).hasSufficientBalance,
      formattedSolBalance: (wallet as any).formattedSolBalance,
      formattedUsdcBalance: (wallet as any).formattedUsdcBalance,
      
      // KYC state
      kycStatus: kyc.kycStatus as any,
      isCheckingKYC: (kyc as any).isCheckingKYC ?? false,
      
      // Questionnaire state
      questionnaireStatus: questionnaire.questionnaireStatus,
      questionnaireCompleted: questionnaire.questionnaireCompleted || (matrix.questionnaire_status === 'completed'),
      showQuestionnaire: questionnaire.showQuestionnaire,
      isSubmittingKYC: questionnaire.isSubmittingKYC,
      
      // Legal state
      userLegalCompliant: legal.userLegalCompliant || (matrix.is_legally_compliant ?? false),
      legalAcknowledged: legal.legalAcknowledged || (matrix.all_legal_docs_acknowledged ?? false),
      showLegalModal: legal.showLegalModal,
      showLegalRequirements: legal.showLegalRequirements,
      showDocumentModal: (legal as any).showDocumentModal ?? false,
      selectedDocument: (legal as any).selectedDocument ?? null,
      
      // Investment state tracking
      purchases: investment.purchases || [],
      userHasInvested: investment.userHasInvested,
      recentPurchases: investment.recentPurchases || [],
      
      // UI state
      showAssetDetail: ui.showAssetDetail,
      showModal: ui.showModal,
      selectedAsset: ui.selectedAsset,
      selectedAssetDetail: ui.selectedAssetDetail,
      
      // POF validation
      pofVerified: matrix.pof_verified ?? false,
      
      // Environment
      TEST_MODE,

      // 3. Setters & State Callbacks
      setKycStatus: (status: any) => {
        if ('setKycStatus' in kyc) (kyc as any).setKycStatus(status);
      },
      setShowLegalModal: legal.setShowLegalModal,
      setShowLegalRequirements: legal.setShowLegalRequirements,
      setLegalAcknowledged: legal.setLegalAcknowledged,
      setUserLegalCompliant: legal.setUserLegalCompliant,
      setShowQuestionnaire: questionnaire.setShowQuestionnaire,
      setShowAssetDetail: ui.setShowAssetDetail,
      setSelectedAsset: ui.setSelectedAsset,
      setSelectedToken: (ui as any).setSelectedToken ?? (() => {}),
      setShowModal: ui.setShowModal,
      setSelectedAssetDetail: ui.setSelectedAssetDetail,
      setShowPurchaseToast: investment.setShowPurchaseToast,
      setUserHasInvested: investment.setUserHasInvested,
      setShowDocumentModal: (show: boolean) => {
        if ('setShowDocumentModal' in legal) (legal as any).setShowDocumentModal(show);
      },
      
      // 4. Action Handlers
      handleInvestFromDetails,
      handleShowAssetDetails,
      handleViewDocument,
      handleJoinPresale,
      confirmTransaction,
      
      // 5. Derived Properties
      isFullyOnboarded,
      canAccessPlatform: canAccessPlatform ?? false,
      onboardingProgress,
      refresh
    };
   }

// ============================================
// ADDITIONAL HOOKS
// ============================================

/**
 * Hook for platform initialization status
 */
export function usePlatformInitialization() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  
  useEffect(() => {
    const initialize = async () => {
      try {
        // Check for required environment variables
        const requiredEnvVars = [
          'NEXT_PUBLIC_SUPABASE_URL',
          'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        ];
        
        const missingVars = requiredEnvVars.filter(
          varName => !process.env[varName]
        );
        
        if (missingVars.length > 0) {
          throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
        }
        
        setIsInitializing(false);
      } catch (err: any) {
        console.error('Platform initialization failed:', err);
        setInitError(err.message);
        setIsInitializing(false);
      }
    };
    
    initialize();
  }, []);
  
  return { isInitializing, initError };
}

/**
 * Hook for platform health monitoring
 */
export function usePlatformHealth() {
  const [health, setHealth] = useState<{
    supabase: boolean;
    wallet: boolean;
    rpc: boolean;
  }>({
    supabase: true,
    wallet: true,
    rpc: true,
  });
  
  const checkHealth = useCallback(async () => {
    // Check Supabase connection
    try {
      const { error } = await import('../../components/Lib/supabaseClient').then(
        module => (module.supabase as any).from('health_check').select('count').limit(1)

      );
      setHealth(prev => ({ ...prev, supabase: !error }));
    } catch {
      setHealth(prev => ({ ...prev, supabase: false }));
    }
    
    // Check RPC connection
    try {
      const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
      const response = await fetch(rpcUrl || 'https://api.mainnet-beta.solana.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getHealth',
        }),
      });
      setHealth(prev => ({ ...prev, rpc: response.ok }));
    } catch {
      setHealth(prev => ({ ...prev, rpc: false }));
    }
  }, []);
  
  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [checkHealth]);
  
  return { health, checkHealth };
}
