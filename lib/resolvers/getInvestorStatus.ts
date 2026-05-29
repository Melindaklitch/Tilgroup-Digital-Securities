import { supabase } from "@/components/Lib/supabaseClient";

export async function getInvestorStatus(userId: string) {
  const { data: protocol } = await supabase
    .from("executive_presale_protocols")
    .select("questionnaire_status, protocol_status")
    .eq("user_id", userId)
    .maybeSingle();

  const { data: kyc } = await supabase
    .from("kyc_status")
    .select("status")
    .eq("user_id", userId)
    .maybeSingle();

  const { data: legal } = await supabase
    .from("legal_status")
    .select("fully_compliant")
    .eq("user_id", userId)
    .maybeSingle();

  const questionnaire = protocol?.questionnaire_status || "not_started";
  const protocolStatus = protocol?.protocol_status || "pending";

  const kycStatus = kyc?.status || "not_started"; // 🔥 THIS FIXES YOUR BUG
  const legalStatus = legal?.fully_compliant || false;

  return {
    questionnaire,
    protocol: protocolStatus,
    kyc: kycStatus,
    legal: legalStatus,
    canInvest:
      questionnaire === "completed" &&
      kycStatus === "verified" &&
      legalStatus === true &&
      protocolStatus !== "rejected",
  };
}
