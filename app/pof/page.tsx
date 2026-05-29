"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../components/Context/AuthContext";
import { useWallet } from "@solana/wallet-adapter-react";
import { supabase } from "../components/Lib/supabaseClient";
import { WalletVerificationGate } from "../platform/components/WalletVerificationGate";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { syncOnboardingStatus } from "../services/onboardingStateService";
import { useAccessMatrix } from '../platform/hooks/useAccessMatrix';

export default function POFPage() {
  const router = useRouter();
  const { session, loading } = useAuth();
  const matrix = useAccessMatrix(session?.user?.id);
  const { connected, publicKey } = useWallet();

  if (loading) return <div>Loading...</div>;
  if (!session) {
    router.push("/signin");
    return null;
  }
  if (!session.user.id) {
  return <div>Loading user information...</div>;
}

  // If wallet not connected, show connect button
  if (!connected || !publicKey) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-[#0a1f2f] to-[#071526]">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl p-8 border border-slate-700/50">
            <h1 className="text-2xl font-bold text-white mb-4">Connect Wallet</h1>
            <p className="text-slate-400 text-sm mb-6">
              Please connect your wallet to verify your USDC balance.
            </p>
            <WalletMultiButton className="!bg-gradient-to-r !from-cyan-600 !to-emerald-600 !text-white !px-6 !py-3 !rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

 const handleVerified = async () => {
  try {
    console.log("[POF] Finalizing onboarding");

    // Update BOTH status AND pof_verified
    const { error } = await supabase
      .from('user_onboarding_state')
      .upsert({
        user_id: session.user.id,
        status: 'completed',
        pof_verified: true,           // ← CRITICAL
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (error) throw error;

    console.log("[POF] Onboarding finalized with pof_verified=true");
       await matrix.refresh(); 

    router.push("/dashboard");
  } catch (error) {
    console.error("[POF] Failed:", error);
  }
};

  return (
    <WalletVerificationGate
      publicKey={publicKey}
      userId={session.user.id}
      onVerified={handleVerified}
      minimumBalance={10000} // 10,000 USDC
    >
      {/* This content will show only after verification */}
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-white">Verification passed. Redirecting...</p>
        </div>
      </div>
    </WalletVerificationGate>
  );
}
