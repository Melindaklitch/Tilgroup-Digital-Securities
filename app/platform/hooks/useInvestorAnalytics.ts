// app/platform/hooks/useInvestorAnalytics.ts
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { supabase } from '../../components/Lib/supabaseClient';

// ============================================
// TYPES & INTERFACES
// ============================================

export type InvestorTier = 'BASIC' | 'ENGAGED' | 'SERIOUS' | 'EXECUTIVE';

export interface InvestorMetrics {
  totalTimeSeconds: number;
  sectionsVisited: Set<string>;
  legalDocsViewed: Set<string>;
  returnVisits: number;
  seriousnessScore: number;
  investorTier: InvestorTier;
}

export interface InvestorAnalyticsData {
  user_id: string;
  seriousness_score: number;
  investor_tier: InvestorTier;
  total_time_seconds: number;
  sections_visited: string[];
  legal_docs_viewed: string[];
  return_visits: number;
  last_active_at: string;
  updated_at: string;
  created_at?: string;
}

export interface InvestorAnalyticsReturn {
  // State
  metrics: InvestorMetrics;
  isLoading: boolean;
  error: string | null;
  lastSaved: Date | null;
  
  // Tracking methods
  trackSectionVisit: (sectionId: string) => void;
  trackLegalDocView: (docId: string) => void;
  trackMultipleSections: (sectionIds: string[]) => void;
  trackMultipleDocs: (docIds: string[]) => void;
  
  // Actions
  saveAnalytics: () => Promise<boolean>;
  incrementReturnVisits: () => void;
  resetAnalytics: () => void;
  refreshAnalytics: () => Promise<void>;
  
  // Computed
  isSerious: boolean;
  isExecutive: boolean;
  isEngaged: boolean;
  progressToNextTier: number;
  recommendedActions: string[];
}

// ============================================
// CONSTANTS
// ============================================

const UPDATE_INTERVAL_MS = 10000; // 10 seconds
const AUTO_SAVE_INTERVAL_MS = 30000; // 30 seconds

const TIER_THRESHOLDS = {
  EXECUTIVE: 70,
  SERIOUS: 50,
  ENGAGED: 20,
  BASIC: 0,
};

const SCORING_WEIGHTS = {
  TIME: { maxPoints: 40, pointsPerMinute: 1 },
  SECTIONS: { maxPoints: 20, pointsPerSection: 4 },
  LEGAL_DOCS: { maxPoints: 30, pointsPerDoc: 10 },
  RETURN_VISITS: { maxPoints: 10, pointsPerVisit: 2 },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate seriousness score based on metrics
 */
export function calculateSeriousnessScore(metrics: Omit<InvestorMetrics, 'seriousnessScore' | 'investorTier'>): number {
  let score = 0;
  
  // Time weight: up to 40 points (1 point per minute)
  score += Math.min(metrics.totalTimeSeconds / 60, SCORING_WEIGHTS.TIME.maxPoints);
  
  // Sections visited weight: up to 20 points (4 points per section)
  score += Math.min(metrics.sectionsVisited.size * SCORING_WEIGHTS.SECTIONS.pointsPerSection, SCORING_WEIGHTS.SECTIONS.maxPoints);
  
  // Legal docs weight: up to 30 points (10 points per doc)
  score += Math.min(metrics.legalDocsViewed.size * SCORING_WEIGHTS.LEGAL_DOCS.pointsPerDoc, SCORING_WEIGHTS.LEGAL_DOCS.maxPoints);
  
  // Return visits weight: up to 10 points (2 points per visit)
  score += Math.min(metrics.returnVisits * SCORING_WEIGHTS.RETURN_VISITS.pointsPerVisit, SCORING_WEIGHTS.RETURN_VISITS.maxPoints);
  
  return Math.min(Math.round(score), 100);
}

/**
 * Determine investor tier based on score
 */
export function determineInvestorTier(score: number): InvestorTier {
  if (score >= TIER_THRESHOLDS.EXECUTIVE) return 'EXECUTIVE';
  if (score >= TIER_THRESHOLDS.SERIOUS) return 'SERIOUS';
  if (score >= TIER_THRESHOLDS.ENGAGED) return 'ENGAGED';
  return 'BASIC';
}

/**
 * Get tier display name
 */
export function getTierDisplayName(tier: InvestorTier): string {
  const names: Record<InvestorTier, string> = {
    'BASIC': 'Basic Investor',
    'ENGAGED': 'Engaged Investor',
    'SERIOUS': 'Serious Investor',
    'EXECUTIVE': 'Executive Partner',
  };
  return names[tier];
}

/**
 * Get tier color for UI
 */
export function getTierColor(tier: InvestorTier): string {
  const colors: Record<InvestorTier, string> = {
    'BASIC': 'text-slate-400 bg-slate-500/10',
    'ENGAGED': 'text-blue-400 bg-blue-500/10',
    'SERIOUS': 'text-cyan-400 bg-cyan-500/10',
    'EXECUTIVE': 'text-emerald-400 bg-emerald-500/10',
  };
  return colors[tier];
}

/**
 * Get tier icon name
 */
export function getTierIcon(tier: InvestorTier): string {
  const icons: Record<InvestorTier, string> = {
    'BASIC': '🌱',
    'ENGAGED': '📊',
    'SERIOUS': '🔥',
    'EXECUTIVE': '👑',
  };
  return icons[tier];
}

/**
 * Get recommended actions based on metrics
 */
export function getRecommendedActions(metrics: InvestorMetrics): string[] {
  const actions: string[] = [];
  
  if (metrics.sectionsVisited.size < 3) {
    actions.push('Explore more investment opportunities');
  }
  
  if (metrics.legalDocsViewed.size < 2) {
    actions.push('Review legal documentation for compliance');
  }
  
  if (metrics.totalTimeSeconds < 300) {
    actions.push('Spend more time reviewing investment details');
  }
  
  if (metrics.investorTier === 'BASIC' && metrics.returnVisits === 0) {
    actions.push('Return to platform for priority access');
  }
  
  return actions;
}

// ============================================
// MAIN HOOK
// ============================================

export const useInvestorAnalytics = (userId?: string): InvestorAnalyticsReturn => {
  const [metrics, setMetrics] = useState<InvestorMetrics>({
    totalTimeSeconds: 0,
    sectionsVisited: new Set(),
    legalDocsViewed: new Set(),
    returnVisits: 0,
    seriousnessScore: 0,
    investorTier: 'BASIC'
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const startTime = useRef<number>(Date.now());
  const autoSaveInterval = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  
  // ============================================
  // UPDATE SCORE FUNCTION
  // ============================================
  
  const updateScore = useCallback(() => {
    setMetrics(prev => {
      const score = calculateSeriousnessScore(prev);
      const tier = determineInvestorTier(score);
      
      return { ...prev, seriousnessScore: score, investorTier: tier };
    });
  }, []);
  
  // ============================================
  // TIME TRACKING
  // ============================================
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isMountedRef.current) return;
      
      const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
      setMetrics(prev => ({ ...prev, totalTimeSeconds: elapsed }));
      updateScore();
    }, UPDATE_INTERVAL_MS);
    
    return () => clearInterval(interval);
  }, [updateScore]);
  
  // ============================================
  // TRACKING METHODS
  // ============================================
  
  const trackSectionVisit = useCallback((sectionId: string) => {
    setMetrics(prev => {
      if (prev.sectionsVisited.has(sectionId)) return prev;
      
      const newSections = new Set(prev.sectionsVisited);
      newSections.add(sectionId);
      console.log('[Analytics] Section visited:', sectionId);
      
      return { ...prev, sectionsVisited: newSections };
    });
    updateScore();
  }, [updateScore]);
  
  const trackLegalDocView = useCallback((docId: string) => {
    setMetrics(prev => {
      if (prev.legalDocsViewed.has(docId)) return prev;
      
      const newDocs = new Set(prev.legalDocsViewed);
      newDocs.add(docId);
      console.log('[Analytics] Legal doc viewed:', docId);
      
      return { ...prev, legalDocsViewed: newDocs };
    });
    updateScore();
  }, [updateScore]);
  
  const trackMultipleSections = useCallback((sectionIds: string[]) => {
    setMetrics(prev => {
      const newSections = new Set(prev.sectionsVisited);
      let added = 0;
      
      sectionIds.forEach(id => {
        if (!newSections.has(id)) {
          newSections.add(id);
          added++;
        }
      });
      
      if (added > 0) {
        console.log('[Analytics] Multiple sections tracked:', added);
      }
      
      return { ...prev, sectionsVisited: newSections };
    });
    updateScore();
  }, [updateScore]);
  
  const trackMultipleDocs = useCallback((docIds: string[]) => {
    setMetrics(prev => {
      const newDocs = new Set(prev.legalDocsViewed);
      let added = 0;
      
      docIds.forEach(id => {
        if (!newDocs.has(id)) {
          newDocs.add(id);
          added++;
        }
      });
      
      if (added > 0) {
        console.log('[Analytics] Multiple docs tracked:', added);
      }
      
      return { ...prev, legalDocsViewed: newDocs };
    });
    updateScore();
  }, [updateScore]);
  
  // ============================================
  // INCREMENT RETURN VISITS
  // ============================================
  
  const incrementReturnVisits = useCallback(() => {
    setMetrics(prev => {
      const newCount = prev.returnVisits + 1;
      console.log('[Analytics] Return visit count:', newCount);
      return { ...prev, returnVisits: newCount };
    });
    updateScore();
  }, [updateScore]);
  
  // ============================================
  // SAVE ANALYTICS TO DATABASE
  // ============================================
  
  const saveAnalytics = useCallback(async (): Promise<boolean> => {
    if (!userId) {
      console.log('[Analytics] No user ID, skipping save');
      return false;
    }
    
    try {
      const analyticsData: Omit<InvestorAnalyticsData, 'created_at'> = {
        user_id: userId,
        seriousness_score: metrics.seriousnessScore,
        investor_tier: metrics.investorTier,
        total_time_seconds: metrics.totalTimeSeconds,
        sections_visited: Array.from(metrics.sectionsVisited),
        legal_docs_viewed: Array.from(metrics.legalDocsViewed),
        return_visits: metrics.returnVisits,
        last_active_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const { error: saveError } = await supabase
        .from('investor_tracking')
        .upsert(analyticsData, { onConflict: 'user_id' });
      
      if (saveError) throw saveError;
      
      setLastSaved(new Date());
      console.log('[Analytics] Saved successfully, tier:', metrics.investorTier);
      return true;
      
    } catch (err: any) {
      console.error('[Analytics] Save error:', err);
      setError(err.message);
      return false;
    }
  }, [userId, metrics]);
  
  // ============================================
  // LOAD EXISTING ANALYTICS
  // ============================================
  
  const loadAnalytics = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('investor_tracking')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (fetchError) throw fetchError;
      
      if (data) {
        setMetrics({
          totalTimeSeconds: data.total_time_seconds || 0,
          sectionsVisited: new Set(data.sections_visited || []),
          legalDocsViewed: new Set(data.legal_docs_viewed || []),
          returnVisits: data.return_visits || 0,
          seriousnessScore: data.seriousness_score || 0,
          investorTier: data.investor_tier || 'BASIC'
        });
        
        console.log('[Analytics] Loaded existing data, tier:', data.investor_tier);
      }
      
    } catch (err: any) {
      console.error('[Analytics] Load error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);
  
  // ============================================
  // REFRESH ANALYTICS
  // ============================================
  
  const refreshAnalytics = useCallback(async () => {
    await loadAnalytics();
  }, [loadAnalytics]);
  
  // ============================================
  // RESET ANALYTICS
  // ============================================
  
  const resetAnalytics = useCallback(() => {
    setMetrics({
      totalTimeSeconds: 0,
      sectionsVisited: new Set(),
      legalDocsViewed: new Set(),
      returnVisits: 0,
      seriousnessScore: 0,
      investorTier: 'BASIC'
    });
    startTime.current = Date.now();
    console.log('[Analytics] Reset complete');
  }, []);
  
  // ============================================
  // AUTO-SAVE INTERVAL
  // ============================================
  
  useEffect(() => {
    if (!userId) return;
    
    autoSaveInterval.current = setInterval(() => {
      if (isMountedRef.current) {
        saveAnalytics();
      }
    }, AUTO_SAVE_INTERVAL_MS);
    
    return () => {
      if (autoSaveInterval.current) {
        clearInterval(autoSaveInterval.current);
      }
    };
  }, [userId, saveAnalytics]);
  
  // ============================================
  // SAVE ON UNMOUNT
  // ============================================
  
  useEffect(() => {
    return () => {
      if (userId && isMountedRef.current) {
        saveAnalytics();
      }
      isMountedRef.current = false;
    };
  }, [userId, saveAnalytics]);
  
  // ============================================
  // INITIAL LOAD
  // ============================================
  
  useEffect(() => {
    isMountedRef.current = true;
    loadAnalytics();
  }, [loadAnalytics]);
  
  // ============================================
  // COMPUTED VALUES
  // ============================================
  
  const isSerious = metrics.investorTier === 'SERIOUS' || metrics.investorTier === 'EXECUTIVE';
  const isExecutive = metrics.investorTier === 'EXECUTIVE';
  const isEngaged = metrics.investorTier === 'ENGAGED' || isSerious;
  
  const progressToNextTier = useMemo(() => {
    const currentThreshold = TIER_THRESHOLDS[metrics.investorTier];
    let nextThreshold: number;
    
    switch (metrics.investorTier) {
      case 'BASIC':
        nextThreshold = TIER_THRESHOLDS.ENGAGED;
        break;
      case 'ENGAGED':
        nextThreshold = TIER_THRESHOLDS.SERIOUS;
        break;
      case 'SERIOUS':
        nextThreshold = TIER_THRESHOLDS.EXECUTIVE;
        break;
      default:
        return 100;
    }
    
    const progress = ((metrics.seriousnessScore - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    return Math.min(Math.max(Math.round(progress), 0), 100);
  }, [metrics.seriousnessScore, metrics.investorTier]);
  
  const recommendedActions = useMemo(() => {
    return getRecommendedActions(metrics);
  }, [metrics]);
  
  // ============================================
  // RETURN
  // ============================================
  
  return {
    // State
    metrics,
    isLoading,
    error,
    lastSaved,
    
    // Tracking methods
    trackSectionVisit,
    trackLegalDocView,
    trackMultipleSections,
    trackMultipleDocs,
    
    // Actions
    saveAnalytics,
    incrementReturnVisits,
    resetAnalytics,
    refreshAnalytics,
    
    // Computed
    isSerious,
    isExecutive,
    isEngaged,
    progressToNextTier,
    recommendedActions,
  };
};

// ============================================
// ADDITIONAL HOOKS
// ============================================

/**
 * Hook for real-time investor analytics updates
 */
export function useRealtimeInvestorAnalytics(userId?: string) {
  const [realtimeMetrics, setRealtimeMetrics] = useState<InvestorMetrics | null>(null);
  
  useEffect(() => {
    if (!userId) return;
    
    const subscription = supabase
      .channel(`investor-analytics-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'investor_tracking',
          filter: `user_id=eq.${userId}`
        },
        (payload: any) => {
          const data = payload.new;
          setRealtimeMetrics({
            totalTimeSeconds: data.total_time_seconds || 0,
            sectionsVisited: new Set(data.sections_visited || []),
            legalDocsViewed: new Set(data.legal_docs_viewed || []),
            returnVisits: data.return_visits || 0,
            seriousnessScore: data.seriousness_score || 0,
            investorTier: data.investor_tier || 'BASIC'
          });
          console.log('[Realtime Analytics] Metrics updated');
        }
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);
  
  return { realtimeMetrics };
}

/**
 * Hook for analytics dashboard (admin use)
 */
export function useAnalyticsDashboard() {
  const [summary, setSummary] = useState<{
    totalInvestors: number;
    averageScore: number;
    tierDistribution: Record<InvestorTier, number>;
    averageTimeSpent: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('investor_tracking')
        .select('investor_tier, seriousness_score, total_time_seconds');
      
      if (fetchError) throw fetchError;
      
      const tierDistribution: Record<InvestorTier, number> = {
        'BASIC': 0,
        'ENGAGED': 0,
        'SERIOUS': 0,
        'EXECUTIVE': 0,
      };
      
      let totalScore = 0;
      let totalTime = 0;
      
      data.forEach(record => {
        tierDistribution[record.investor_tier as InvestorTier]++;
        totalScore += record.seriousness_score || 0;
        totalTime += record.total_time_seconds || 0;
      });
      
      setSummary({
        totalInvestors: data.length,
        averageScore: data.length > 0 ? Math.round(totalScore / data.length) : 0,
        tierDistribution,
        averageTimeSpent: data.length > 0 ? Math.round(totalTime / data.length / 60) : 0,
      });
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);
  
  return { summary, loading, error, refreshSummary: fetchSummary };
}
