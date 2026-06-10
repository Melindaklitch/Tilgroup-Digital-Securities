// app/services/onboardingStateService.ts

import { supabase } from '../components/Lib/supabaseClient';

// ============================================
// TYPES
// ============================================

export interface UserOnboardingState {
  user_id: string;
  status: string; // ✅ SINGLE SOURCE OF TRUTH
  updated_at: string;
}

// ============================================
// GET STATE
// ============================================

export async function getOnboardingState(userId: string): Promise<UserOnboardingState | null> {
  if (!userId) return null;

  const { data, error } = await supabase
    .from('user_onboarding_state')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[onboardingState] ❌ Fetch error:', error);
    return null;
  }

  if (!data) {
    console.warn('[onboardingState] ⚠️ No row found for user:', userId);
  }

  return data ? {
  ...data,
  status: data.status ?? 'not_started',
  updated_at: data.updated_at ?? new Date().toISOString()
  } : null;
 }

// ============================================
// UPSERT STATE (FIXED)
// ============================================

export async function upsertOnboardingState(
  userId: string,
  status: string
): Promise<UserOnboardingState | null> {
  if (!userId) return null;

  console.log('[onboardingState] 🔄 Upserting state:', { userId, status });

  const { data, error } = await supabase
    .from('user_onboarding_state')
    .upsert(
      {
        user_id: userId,
        status,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id', // ✅ ensures update if exists
      }
    )
    .select()
    .maybeSingle();

  if (error) {
    console.error('[onboardingState] ❌ Upsert error:', error);
    return null;
  }

  console.log('[onboardingState] ✅ State saved:', data);

  return data ? {
  ...data,
  status: data.status ?? 'not_started',
  updated_at: data.updated_at ?? new Date().toISOString()
 } : null;
}

// ============================================
// MAIN SYNC FUNCTION (USE THIS EVERYWHERE)
// ============================================

export async function syncOnboardingStatus(
  userId: string,
  status: string
): Promise<void> {
  if (!userId || !status) {
    console.warn('[onboardingState] ⚠️ Invalid sync call:', { userId, status });
    return;
  }

  await upsertOnboardingState(userId, status);
}
