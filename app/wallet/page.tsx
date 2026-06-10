"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../components/Context/AuthContext";
import { supabase } from "../components/Lib/supabaseClient";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect, useState } from "react";
import { syncOnboardingStatus } from "../services/onboardingStateService";

export default function WalletPage() {
  const router = useRouter();
  const { session, loading } = useAuth();
  const { connected, publicKey } = useWallet();
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (!loading && !session) {
      router.push("/signin");
    }
  }, [session, loading, router]);

  const handleWalletComplete = async () => {
    if (!connected || !publicKey) return;
    
    setConnecting(true);
    
  // Sync onboarding progression centrally
   await syncOnboardingStatus(
   session!.user.id,
   "pof_pending"
  );
    
    // Also save to profiles
    await supabase
      .from("profiles")
      .update({ wallet_address: publicKey.toString() })
      .eq("id", session?.user?.id ?? "")

    router.push("/pof");
  };

  if (loading) return <div>Loading...</div>;
  if (!session) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-[#0a1f2f] to-[#071526]">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl p-8 border border-slate-700/50">
          <h1 className="text-2xl font-bold text-white mb-4">Connect Wallet</h1>
          <p className="text-slate-400 text-sm mb-6">
            Connect your Solana wallet to receive digital securities tokens
          </p>
          
          <WalletMultiButton className="!bg-gradient-to-r !from-cyan-600 !to-emerald-600 !text-white !px-6 !py-3 !rounded-xl" />
          
          {connected && publicKey && (
            <button
              onClick={handleWalletComplete}
              disabled={connecting}
              className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl transition-all"
            >
              {connecting ? "Processing..." : "Continue to Proof of Funds"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
