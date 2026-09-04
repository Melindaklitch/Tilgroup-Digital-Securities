"use client";

import DashboardContent from "./DashboardContent";
import LoadingStates from "../components/LoadingStates";
import KYCVerification from '../../components/Data/KYCVerification';
import { useRouter } from 'next/navigation';
import { useAuth } from "../../components/Context/AuthContext"; 
import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { Loader2, Wallet, AlertCircle } from "lucide-react";
import { WalletVerificationGate } from "./WalletVerificationGate";
import { getOnboardingState } from "../../services/onboardingStateService";

const WalletMultiButton = dynamic(
  () => import("@solana/wallet-adapter-react-ui").then(mod => mod.WalletMultiButton),
  { ssr: false }
);

interface ConditionalRenderProps {
  platform: any;
}

export default function ConditionalRender({ platform }: ConditionalRenderProps) {
  const {
    connected,
    publicKey,
    walletConnecting,
    isInitialLoading,
    isCheckingQuestionnaire,
    questionnaireStatus,
    isCheckingKYC,
    setKycStatus,
    userLegalCompliant = true,
    pofVerified,
    setPofVerified,
    canAccessPlatform,
  } = platform;

  const { session: authSession, loading: authLoading } = useAuth();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [hasVerified, setHasVerified] = useState(false);

  const hasRedirected = useRef(false);
  const hasRedirectedToQuestionnaire = useRef(false);

  // =========================
  // VALIDATE USER EXISTS IN MASTER TABLE
  // =========================
  useEffect(() => {
  const validateUserExists = async () => {
    if (!authSession?.user?.id) {
      setIsValidating(false);
      return;
    }
    
    try {
     const data = await getOnboardingState(authSession.user.id);

   if (!data) {
     console.log('⚠️ No onboarding state yet (will be created)');
   }
      setIsValidating(false);
    } catch (err) {
      console.error('Validation exception:', err);
      setIsValidating(false);
    }
  };

      validateUserExists();
   }, [authSession]);

  const walletConnected = connected;

  const questionnaireComplete =
[
  'pending_review',
  'completed',
  'qualified',
  'priority',
  'kyc_pending',
  'wallet_pending',
  'pof_pending'
].includes(questionnaireStatus);
  
  console.log("📊 ConditionalRender State:", {
  questionnaireStatus,
  questionnaireComplete,
  canAccessPlatform,
  isCheckingQuestionnaire,
});

  const kycComplete = userLegalCompliant;

  useEffect(() => {
    setMounted(true);
  }, []);

  // 🔐 AUTH REDIRECT
  useEffect(() => {
    if (authLoading || isInitialLoading || !mounted || isValidating) return; // ADD isValidating

    const isOnSigninPage = window.location.pathname === '/signin';

    if (!authSession && !walletConnected && !isOnSigninPage && !hasRedirected.current) {
      hasRedirected.current = true;
      router.push('/signin');
    }

    if (authSession) {
      hasRedirected.current = false;
    }
  }, [authSession, authLoading, isInitialLoading, walletConnected, mounted, router, isValidating]); // ADD isValidating

  // =========================
  // LOADING
  // =========================
  if (isValidating || !mounted || authLoading || isInitialLoading) { // ADD isValidating
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-cyan-400" />
      </div>
    );
  }

  // =========================
  // NO SESSION UI
  // =========================
  if (!authSession) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <AlertCircle className="mx-auto mb-4 text-amber-400" size={48} />
          <h2 className="text-white text-xl">Session Expired</h2>
          <button
            onClick={() => router.push('/signin')}
            className="mt-4 bg-cyan-600 px-4 py-2 rounded hover:bg-cyan-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // STATUS LOADING
  // =========================
  if (isCheckingQuestionnaire || isCheckingKYC) {
    return <LoadingStates type="generic" />;
  }

  // =========================
  // 📋 QUESTIONNAIRE REDIRECT (FIXED)
  // =========================
   if (
  authSession &&
  (questionnaireStatus === 'pending' || questionnaireStatus === 'not_started') &&
  !canAccessPlatform &&
  !isCheckingQuestionnaire &&
  !isValidating &&
  !hasRedirectedToQuestionnaire.current
) {
  hasRedirectedToQuestionnaire.current = true;

  console.log("📋 Redirecting to questionnaire:", {
    questionnaireStatus,
    canAccessPlatform,
  });

  router.push('/questionnaire');

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-cyan-400" />
    </div>
  );
}

  // =========================
  // WALLET NOT CONNECTED
  // =========================
  if (!walletConnected && !walletConnecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <Wallet className="text-cyan-400 mb-4" size={48} />
        <h2 className="text-white mb-4">Connect your wallet to continue</h2>
        <WalletMultiButton />
      </div>
    );
  }

  // =========================
  // WALLET CONNECTING
  // =========================
  if (walletConnecting && !walletConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-cyan-400" />
      </div>
    );
  }

  // =========================
  // KYC
  // =========================
  if (walletConnected && questionnaireComplete && !kycComplete) {
    return (
      <KYCVerification
        userId={authSession.user.id}
        onComplete={(status) => {
          setKycStatus(status === 'verified' ? 'verified' : 'failed');
        }}
      />
    );
  }

  // =========================
  // POF
  // =========================

if (walletConnected && questionnaireComplete && kycComplete && !platform.pofVerified && !hasVerified) {
    return (
      <WalletVerificationGate
        publicKey={publicKey}
        userId={authSession.user.id}
        onVerified={() => {
          setHasVerified(true);
          platform.refresh?.();
        }}
        minimumBalance={7000}
      >
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-cyan-400" />
        </div>
      </WalletVerificationGate>
    );
  }

  // =========================
  // FINAL DASHBOARD
  // =========================
  return <DashboardContent platformState={platform} />;
}
