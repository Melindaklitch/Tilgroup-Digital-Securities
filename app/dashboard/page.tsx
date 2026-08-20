"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "../components/Context/AuthContext";
import DashboardContent from "../platform/components/DashboardContent";
import { supabase } from "../components/Lib/supabaseClient";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

export default function DashboardPage() {
  const router = useRouter();
  const { session, loading } = useAuth();
  const [status, setStatus] = useState<string | null>(null);
  const { connected, connecting: walletConnecting } = useWallet();

  // Existing auth + database status check
  useEffect(() => {
    if (!loading && !session) {
      router.push("/signin");
      return;
    }

    const checkStatus = async () => {
      if (!session?.user?.id) return;
      const { data } = await supabase
        .from("user_access_matrix")
        .select(`can_access_dashboard, onboarding_status`)
        .eq("user_id", session.user.id)
        .single();

      if (!data?.can_access_dashboard) {
        switch (data?.onboarding_status) {
          case "kyc_pending":
            router.push("/kyc");
            return;
          case "wallet_pending":
            router.push("/wallet");
            return;
          case "pof_pending":
            router.push("/pof");
            return;
          default:
            router.push("/questionnaire");
            return;
        }
      } else {
        setStatus("completed");
      }
    };

    if (session) checkStatus();
  }, [session, loading, router]);

  // New effect: redirect to /wallet if live wallet is disconnected
  useEffect(() => {
    if (loading || !session || !status || walletConnecting) return;
    if (!connected) {
      console.log("[Dashboard] 🔴 REDIRECTING TO /wallet — wallet disconnected");
      router.push("/wallet");
    }
  }, [loading, session, status, walletConnecting, connected, router]);

  // Loading condition no longer uses walletReady
  if (loading || !session || !status || walletConnecting) {
    return <div>Loading...</div>;
  }

  // If wallet not connected, effect will redirect; avoid rendering dashboard
  if (!connected) return null;

  return <DashboardContent />;
}
