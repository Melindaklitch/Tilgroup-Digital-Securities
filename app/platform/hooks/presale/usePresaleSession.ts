import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../components/Lib/supabaseClient';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface PresaleSession {
  id?: string;
  user_id: string;
  presale_start_at: string | null;
  started_at?: string;
  has_invested: boolean;
  virtual_investors: number;
  total_raised?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PresaleSessionState {
  session: PresaleSession | null;
  userPresaleStart: Date | null;
  virtualInvestors: number;
  userHasInvested: boolean;
  presaleEnded: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface PresaleSessionReturn {
  // State
  userPresaleStart: Date | null;
  virtualInvestors: number;
  userHasInvested: boolean;
  setUserHasInvested: (hasInvested: boolean) => void;
  presaleEnded: boolean;
  isLoading: boolean;
  error: string | null;
  session: PresaleSession | null;
  
  // Actions
  refreshSession: () => Promise<void>;
  updateInvestmentStatus: (hasInvested: boolean) => Promise<boolean>;
  incrementVirtualInvestors: () => Promise<void>;
  getTimeRemaining: () => { days: number; hours: number; minutes: number; seconds: number } | null;
  isPresaleActive: () => boolean;
}

// ============================================
// CONSTANTS
// ============================================

const DEFAULT_VIRTUAL_INVESTORS = 196;
const PRESALE_DURATION_DAYS = 30; // Presale lasts 30 days

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate time remaining until presale ends
 */
export function calculateTimeRemaining(startDate: Date | null): { days: number; hours: number; minutes: number; seconds: number } | null {
  if (!startDate) return null;
  
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + PRESALE_DURATION_DAYS);
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();
  
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

/**
 * Format time remaining for display
 */
export function formatTimeRemaining(timeRemaining: { days: number; hours: number; minutes: number; seconds: number } | null): string {
  if (!timeRemaining) return 'Presale ended';
  
  if (timeRemaining.days > 0) {
    return `${timeRemaining.days}d ${timeRemaining.hours}h`;
  }
  if (timeRemaining.hours > 0) {
    return `${timeRemaining.hours}h ${timeRemaining.minutes}m`;
  }
  if (timeRemaining.minutes > 0) {
    return `${timeRemaining.minutes}m ${timeRemaining.seconds}s`;
  }
  return `${timeRemaining.seconds}s`;
}

/**
 * Get presale progress percentage
 */
export function getPresaleProgress(virtualInvestors: number, targetInvestors: number = 1000): number {
  return Math.min((virtualInvestors / targetInvestors) * 100, 100);
}

// ============================================
// MAIN HOOK
// ============================================

export function usePresaleSession(userId: string | undefined): PresaleSessionReturn {
  const [session, setSession] = useState<PresaleSession | null>(null);
  const [userPresaleStart, setUserPresaleStart] = useState<Date | null>(null);
  const [virtualInvestors, setVirtualInvestors] = useState(DEFAULT_VIRTUAL_INVESTORS);
  const [userHasInvested, setUserHasInvested] = useState(false);
  const [presaleEnded, setPresaleEnded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // FETCH OR CREATE SESSION
  // ============================================
  
  const fetchOrCreateSession = useCallback(async () => {
    if (!userId) {
      setError('No user ID provided');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[PresaleSession] Fetching for user:', userId);
      
      // Try to fetch existing session
      const { data, error: fetchError } = await supabase
        .from("presale_sessions")
        .select("*")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error("[PresaleSession] Fetch error:", fetchError);
        setError(fetchError.message);
        setIsLoading(false);
        return;
      }

      // If session exists, use it
      if (data) {
        console.log("[PresaleSession] Existing session found:", data);
        
        const startDate = new Date(data.presale_start_at || data.started_at);
        const hasEnded = startDate ? 
          new Date(startDate.getTime() + PRESALE_DURATION_DAYS * 24 * 60 * 60 * 1000) < new Date() : 
          false;
        
        setSession(data as PresaleSession);
        setUserPresaleStart(startDate);
        setVirtualInvestors(data.virtual_investors || DEFAULT_VIRTUAL_INVESTORS);
        setUserHasInvested(data.has_invested || false);
        setPresaleEnded(hasEnded);
        
        console.log("[PresaleSession] Session loaded:", {
          startDate,
          virtualInvestors: data.virtual_investors,
          hasInvested: data.has_invested,
          presaleEnded: hasEnded
        });
      } else {
        // Create new session
        console.log("[PresaleSession] No session found, creating new...");
        
        const newSession = {
          user_id: userId,
          presale_start_at: new Date().toISOString(),
          has_invested: false,
          virtual_investors: DEFAULT_VIRTUAL_INVESTORS,
          created_at: new Date().toISOString(),
        };
        
        const { data: created, error: upsertError } = await supabase
          .from("presale_sessions")
          .upsert(newSession, {
            onConflict: 'user_id'
          })
          .select()
          .single();

        if (upsertError) {
          console.error("[PresaleSession] Create error:", upsertError);
          setError(upsertError.message);
          setIsLoading(false);
          return;
        }

        console.log("[PresaleSession] Session created:", created);
        
        setSession(created as PresaleSession);
        setUserPresaleStart(new Date());
        setVirtualInvestors(DEFAULT_VIRTUAL_INVESTORS);
        setUserHasInvested(false);
        setPresaleEnded(false);
      }
      
    } catch (err: any) {
      console.error("[PresaleSession] Exception:", err);
      setError(err.message || 'Failed to initialize presale session');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // ============================================
  // INITIAL FETCH
  // ============================================
  
  useEffect(() => {
    fetchOrCreateSession();
  }, [fetchOrCreateSession]);

  // ============================================
  // REFRESH SESSION
  // ============================================
  
  const refreshSession = useCallback(async () => {
    await fetchOrCreateSession();
  }, [fetchOrCreateSession]);

  // ============================================
  // UPDATE INVESTMENT STATUS
  // ============================================
  
  const updateInvestmentStatus = useCallback(async (hasInvested: boolean): Promise<boolean> => {
    if (!userId || !session) {
      console.error('[PresaleSession] Cannot update: No session');
      return false;
    }
    
    try {
      const { error: updateError } = await supabase
        .from("presale_sessions")
        .update({
          has_invested: hasInvested,
        })
        .eq("user_id", userId);
      
      if (updateError) {
        console.error("[PresaleSession] Update error:", updateError);
        return false;
      }
      
      setUserHasInvested(hasInvested);
      setSession(prev => prev ? { ...prev, has_invested: hasInvested } : null);
      
      console.log("[PresaleSession] Investment status updated:", hasInvested);
      return true;
      
    } catch (err) {
      console.error("[PresaleSession] Update exception:", err);
      return false;
    }
  }, [userId, session]);

  // ============================================
  // INCREMENT VIRTUAL INVESTORS
  // ============================================
  
  const incrementVirtualInvestors = useCallback(async () => {
    if (!userId || !session) return;
    
    const newCount = virtualInvestors + 1;
    
    try {
      const { error: updateError } = await supabase
        .from("presale_sessions")
        .update({
          virtual_investors: newCount,
        })
        .eq("user_id", userId);
      
      if (updateError) {
        console.error("[PresaleSession] Increment error:", updateError);
        return;
      }
      
      setVirtualInvestors(newCount);
      setSession(prev => prev ? { ...prev, virtual_investors: newCount } : null);
      
      console.log("[PresaleSession] Virtual investors incremented to:", newCount);
      
    } catch (err) {
      console.error("[PresaleSession] Increment exception:", err);
    }
  }, [userId, session, virtualInvestors]);

  // ============================================
  // CHECK IF PRESALE IS ACTIVE
  // ============================================
  
  const isPresaleActive = useCallback((): boolean => {
    if (!userPresaleStart) return false;
    
    const endDate = new Date(userPresaleStart);
    endDate.setDate(endDate.getDate() + PRESALE_DURATION_DAYS);
    
    return new Date() < endDate && !presaleEnded;
  }, [userPresaleStart, presaleEnded]);

  // ============================================
  // GET TIME REMAINING
  // ============================================
  
  const getTimeRemaining = useCallback(() => {
    if (!userPresaleStart) return null;
    return calculateTimeRemaining(userPresaleStart);
  }, [userPresaleStart]);

  // ============================================
  // DERIVED VALUES
  // ============================================
  
  const timeRemaining = getTimeRemaining();
  const presaleActive = isPresaleActive();
  const progressPercentage = getPresaleProgress(virtualInvestors);

  // ============================================
  // RETURN
  // ============================================
  
  return {
    // State
    userPresaleStart,
    virtualInvestors,
    userHasInvested,
    setUserHasInvested,
    presaleEnded,
    isLoading,
    error,
    session,
    
    // Actions
    refreshSession,
    updateInvestmentStatus,
    incrementVirtualInvestors,
    getTimeRemaining,
    isPresaleActive,
  };
}

// ============================================
// ADDITIONAL HOOKS
// ============================================

/**
 * Hook for real-time presale session updates
 */
export function useRealtimePresaleSession(userId: string | undefined, onUpdate?: (session: PresaleSession) => void) {
  const [realtimeSession, setRealtimeSession] = useState<PresaleSession | null>(null);
  
  useEffect(() => {
    if (!userId) return;
    
    const subscription = supabase
      .channel(`presale-session-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'presale_sessions',
          filter: `user_id=eq.${userId}`
        },
        (payload: any) => {
          const updatedSession = payload.new as PresaleSession;
          setRealtimeSession(updatedSession);
          onUpdate?.(updatedSession);
          console.log('[Realtime Presale] Session updated:', updatedSession);
        }
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [userId, onUpdate]);
  
  return { realtimeSession };
}

/**
 * Hook for presale statistics (admin use)
 */
export function usePresaleStatistics() {
  const [stats, setStats] = useState<{
    totalInvestors: number;
    totalRaised: number;
    activeSessions: number;
    averageInvestment: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from("presale_sessions")
        .select("has_invested, virtual_investors");
      
      if (fetchError) throw new Error(fetchError.message);
      
      const totalInvestors = data.filter(s => s.has_invested).length;
      const totalVirtual = data.reduce((sum, s) => sum + (s.virtual_investors || 0), 0);
      
      setStats({
        totalInvestors,
        totalRaised: totalVirtual * 5000, // Assuming $5k average
        activeSessions: data.length,
        averageInvestment: totalInvestors > 0 ? (totalVirtual * 5000) / totalInvestors : 0,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);
  
  return { stats, loading, error, refreshStats: fetchStats };
}
