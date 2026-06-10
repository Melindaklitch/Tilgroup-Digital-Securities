import { supabase } from '@/app/components/Lib/supabaseClient';

export interface LegalStatusPayload {
  userId: string;
  // Map these exactly to your database schema requirements
  accreditedInvestorCompleted?: boolean;
  executiveProtocolCompleted?: boolean;
  fullyCompliant?: boolean;
  // Add any specific base KYC field if it differs from fully_compliant
}

export async function updateLegalStatus({
  userId,
  accreditedInvestorCompleted,
  executiveProtocolCompleted,
  fullyCompliant,
}: LegalStatusPayload) {
  try {
    // 1. Dynamically build the payload so we only update what is passed in
    const updatePayload: Record<string, boolean> = {};

    if (accreditedInvestorCompleted !== undefined) {
      updatePayload.accredited_investor_questionnaire_completed = accreditedInvestorCompleted;
    }
    if (executiveProtocolCompleted !== undefined) {
      updatePayload.executive_protocol_completed = executiveProtocolCompleted;
    }
    if (fullyCompliant !== undefined) {
      updatePayload.fully_compliant = fullyCompliant;
    }

    // 2. Execute the unified Supabase write
    const { data, error } = await supabase
      .from('user_legal_status')
      .update(updatePayload as any)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('❌ Failed to update legal status:', error);
    return { success: false, error };
  }
}
