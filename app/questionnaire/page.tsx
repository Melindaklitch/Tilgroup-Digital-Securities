"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../components/Lib/supabaseClient";
import { syncOnboardingStatus } from "../services/onboardingStateService";
import { useAuth } from "../components/Context/AuthContext";
import ExecutivePresaleProtocol from "../components/Data/ExecutivePresaleProtocol";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Building2, Clock, CheckCircle2, AlertCircle } from "lucide-react";

export default function QuestionnairePage() {
  const router = useRouter();
  const { session, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [questionnaireCompleted, setQuestionnaireCompleted] = useState(false);
  const hasFetched = useRef(false);
  const submittingRef = useRef(false);


  useEffect(() => {
    if (authLoading) return;
    if (hasFetched.current) return;
    hasFetched.current = true;
    checkStatusAndRedirect();
  }, [session, authLoading]);

   // Poll for status changes while under review
  useEffect(() => {
    if (status !== "pending_review" || !session?.user?.id) return;

  const interval = setInterval(async () => {
    const { data } = await supabase
      .from("user_onboarding_state")
      .select("status")
      .eq("user_id", session.user.id)
      .single();

    if (data?.status === "kyc_pending") {
      router.push("/kyc");
    } else if (data?.status === "wallet_pending") {
      router.push("/wallet");
    } else if (data?.status === "pof_pending") {
      router.push("/pof");
    } else if (data?.status === "completed") {
      router.push("/dashboard");
    }
  }, 30000);

  return () => clearInterval(interval);
}, [status, session?.user?.id, router]);

  const checkStatusAndRedirect = async () => {
    if (!session?.user?.id) {
      router.push("/signin");
      return;
    }

    console.log("[Questionnaire] Checking master status for:", session.user.id);

    const { data: master, error } = await supabase
      .from("user_onboarding_state")
      .select("status")
      .eq("user_id", session.user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("[Questionnaire] Error fetching status:", error);
      setLoading(false);
      return;
    }

    const currentStatus = master?.status || "pending";
    setStatus(currentStatus);

    // Redirect based on status
    if (currentStatus === "kyc_pending") {
      router.push("/kyc");
      return;
    }
    if (currentStatus === "wallet_pending") {
      router.push("/wallet");
      return;
    }

    if (currentStatus === "pof_pending") {
      router.push("/pof");
      return;
    }

   if (currentStatus === "completed") {
  const { data: matrix } = await supabase
    .from("user_access_matrix")
    .select("can_access_dashboard")
    .eq("user_id", session.user.id)
    .single();

  if (matrix?.can_access_dashboard) {
    router.push("/dashboard");
    return;
  }

  console.warn(
    "[Questionnaire] Completed user missing dashboard access"
  );

  router.push("/platform");
  return;
}

  // Only brand new users should ever see questionnaire
setShowQuestionnaire(currentStatus === "pending" || currentStatus === "not_started");
    setLoading(false);
  };

  const handleQuestionnaireComplete = async (protocolStatus: string) => {
    if (!session?.user?.id) return;
 
   if (submittingRef.current) return;
      submittingRef.current = true;

    try {
      console.log("[Questionnaire] Submitting...");

      // 1. Update legacy table
      const { error: legacyError } = await supabase
        .from("executive_presale_protocols")
        .update({
          protocol_status: "pending",
          questionnaire_status: "completed",
          submitted_at: new Date().toISOString(),
        })
        .eq("user_id", session.user.id);

      if (legacyError) throw legacyError;

      await syncOnboardingStatus(
      session.user.id,
      "pending_review"
     );

      // 3. Verify the update
      const { data: verify } = await supabase
        .from("user_onboarding_state")
        .select("status")
        .eq("user_id", session.user.id)
        .single();

      console.log("[Questionnaire] Verified status:", verify?.status);

      if (verify?.status !== "pending_review") {
        throw new Error("Status verification failed");
      }

      // 4. Update local UI state immediately – no redirect, just change view
      setStatus("pending_review");
      setShowQuestionnaire(false);
      setQuestionnaireCompleted(true);

      // 5. Send email (fire and forget)
      fetch("/api/email/executive-approval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.user.email,
          name: session.user.user_metadata?.full_name,
          userId: session.user.id,
          status: protocolStatus,
        }),
      }).catch(console.error);

      // 6. Send welcome email — server-side authoritative, idempotent
        fetch("/api/email/welcome", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${session.access_token}`,
          },
        }).catch(console.error);

       } catch (error) {
       console.error("[Questionnaire] Submission error:", error);
       alert("Submission failed. Please try again.");
     } finally {
      submittingRef.current = false;
    }
  };

  // Loading states
 if (authLoading || loading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-b from-[#0a1f2f] to-[#071526]">
        <div className="text-center space-y-3 md:space-y-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping"></div>
            <Loader2 className="h-10 w-10 md:h-12 md:w-12 animate-spin text-cyan-400 mx-auto relative" />
          </div>
          <p className="text-slate-300 text-sm md:text-base">Verifying investor status...</p>
        </div>
      </div>
    );
  }

  // Pending review screen
  if (status === "pending_review") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-b from-[#0a1f2f] to-[#071526]">
        <div className="max-w-md w-full space-y-5">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl p-6 md:p-8 text-center border border-slate-700/50 shadow-2xl space-y-5">
            <div className="flex justify-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                <Clock className="h-8 w-8 md:h-10 md:w-10 text-white animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-xl md:text-2xl font-bold text-white">
                Executive Presale Protocol Under Review
              </h1>
              <p className="text-slate-300 text-xs md:text-sm">
                Your responses are being reviewed. This takes 5-15 minutes. You will be automatically redirected when approved.
              </p>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-3 md:p-4 border border-slate-700/30">
              <p className="text-xs md:text-sm text-slate-400">
                You can close this page. We will notify you when approved.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Questionnaire form
  if (showQuestionnaire && session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1f2f] to-[#071526]">
        <div className="sticky top-0 z-10 bg-gradient-to-b from-[#0a1f2f]/95 to-[#071526]/95 backdrop-blur-md border-b border-slate-700/50">
          <div className="max-w-6xl mx-auto px-4 py-3 md:p-6">
            <Button
              variant="ghost"
              onClick={() => router.push("/platform")}
              className="text-slate-300 hover:text-white hover:bg-slate-800/50 text-sm md:text-base"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Platform Overview
            </Button>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-6 md:p-6">
          <div className="text-center space-y-3 md:space-y-4 mb-6 md:mb-10">
            <div className="flex justify-center">
              <div className="inline-flex p-2.5 md:p-3 rounded-xl bg-gradient-to-br from-cyan-900 to-emerald-900 border border-cyan-500/30">
                <Building2 className="h-6 w-6 md:h-8 md:w-8 text-cyan-400" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                TIL Group Investor Qualification
              </h1>
              <p className="text-slate-300 text-sm md:text-base">
                To access the $150M Can Gio Port presale, please complete the accredited investor qualification form as required by Vietnamese securities regulations.
              </p>
            </div>
            <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-500/20 rounded-xl p-3 md:p-4 max-w-2xl mx-auto">
              <div className="flex items-start gap-2 md:gap-3">
                <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="text-xs md:text-sm text-slate-300">
                    <span className="font-semibold text-white">Important</span>{" "}
                    This $150M presale is available only to accredited investors as defined under Vietnamese securities law. All information provided is confidential and used solely for qualification purposes.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <ExecutivePresaleProtocol
            userId={session.user.id}
            onComplete={handleQuestionnaireComplete}
            onCancel={() => router.push("/platform")}
            session={session}
          />
        </div>
      </div>
    );
  }

  return null;
}
