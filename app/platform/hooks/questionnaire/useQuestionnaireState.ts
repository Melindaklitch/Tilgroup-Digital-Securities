// useQuestionnaireState.ts (COMPLETE REPLACEMENT)
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { supabase } from '../../../components/Lib/supabaseClient';
import { getOnboardingState, syncOnboardingStatus } from '../../../services/onboardingStateService';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAuth } from "../../../components/Context/AuthContext";
import { KYCService } from '../../services/kycService';

// ============================================
// TYPES & INTERFACES
// ============================================

export type QuestionnaireStatus =
  | 'not_started'
  | 'completed'
  | 'qualified'
  | 'priority'
  | 'rejected'
  | 'pending_review' 
  | 'kyc_pending'     
  | 'wallet_pending'
  | 'pof_pending';

export interface QuestionnaireState {
  status: QuestionnaireStatus;
  protocolStatus: string | null;
  submittedAt: string | null;
  completedAt: string | null;
  isCompleted: boolean;
  isPending: boolean;
  isRejected: boolean;
  isNotStarted: boolean;
}

export interface QuestionnaireStateReturn {
  // State
  questionnaireStatus: QuestionnaireStatus;
  setQuestionnaireStatus: (status: QuestionnaireStatus) => void;
  questionnaireCompleted: boolean;
  setQuestionnaireCompleted: (completed: boolean) => void;
  userQuestionnaireCompleted: boolean;
  setUserQuestionnaireCompleted: (completed: boolean) => void;
  showQuestionnaire: boolean;
  setShowQuestionnaire: (show: boolean) => void;
  userQuestionnaireStatus: any;
  isCheckingQuestionnaire: boolean;
  hasShownQuestionnaire: boolean;
  setHasShownQuestionnaire: (hasShown: boolean) => void;
  isSubmittingKYC: boolean;
  isInitialLoading: boolean;
  
  // Actions
  checkQuestionnaireStatus: () => Promise<void>;
  submitKYC: (formData: any) => Promise<boolean>;
  refreshStatus: () => Promise<void>;
  resetState: () => void;
  
  // Computed
  questionnaireState: QuestionnaireState;
  canProceedToInvestment: boolean;
  statusColor: string;
  statusLabel: string;
}

// ============================================
// CONSTANTS
// ============================================

const POLLING_INTERVAL_MS = 30000;
const COMPLETED_STATUSES: QuestionnaireStatus[] = ['completed', 'qualified', 'priority'];
const PENDING_STATUSES: QuestionnaireStatus[] = ['pending'];
const REJECTED_STATUSES: QuestionnaireStatus[] = ['rejected'];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if a status is completed
 */
export function isCompletedStatus(status: QuestionnaireStatus | string): boolean {
  return COMPLETED_STATUSES.includes(status as QuestionnaireStatus);
}

/**
 * Check if a status is pending
 */
export function isPendingStatus(status: QuestionnaireStatus | string): boolean {
  return PENDING_STATUSES.includes(status as QuestionnaireStatus);
}

/**
 * Check if a status is rejected
 */
export function isRejectedStatus(status: QuestionnaireStatus | string): boolean {
  return REJECTED_STATUSES.includes(status as QuestionnaireStatus);
}

/**
 * Get status color for UI
 */
export function getQuestionnaireStatusColor(status: QuestionnaireStatus): string {
  switch (status) {
    case 'completed':
    case 'qualified':
    case 'priority':
      return 'text-emerald-400 bg-emerald-500/10';
    case 'pending':
      return 'text-yellow-400 bg-yellow-500/10';
    case 'rejected':
      return 'text-red-400 bg-red-500/10';
    default:
      return 'text-slate-400 bg-slate-500/10';
  }
}

/**
 * Get status label for UI
 */
export function getQuestionnaireStatusLabel(status: QuestionnaireStatus): string {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'qualified':
      return 'Qualified';
    case 'priority':
      return 'Priority Access';
    case 'pending':
      return 'Pending Review';
    case 'rejected':
      return 'Rejected';
    default:
      return 'Not Started';
  }
}

/**
 * Get status badge variant
 */
export function getQuestionnaireStatusBadge(status: QuestionnaireStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'completed':
    case 'qualified':
    case 'priority':
      return 'default';
    case 'pending':
      return 'outline';
    case 'rejected':
      return 'destructive';
    default:
      return 'secondary';
  }
}

// ============================================
// MAIN HOOK
// ============================================

export function useQuestionnaireState(): QuestionnaireStateReturn {
  const { connected, publicKey } = useWallet();
  const { session } = useAuth();
  const userId = session?.user?.id;

  // State
  const [questionnaireStatus, setQuestionnaireStatus] = useState<QuestionnaireStatus>('not_started');
  const [questionnaireCompleted, setQuestionnaireCompleted] = useState(false);
  const [userQuestionnaireCompleted, setUserQuestionnaireCompleted] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [userQuestionnaireStatus, setUserQuestionnaireStatus] = useState<any>(null);
  const [isCheckingQuestionnaire, setIsCheckingQuestionnaire] = useState(false);
  const [hasShownQuestionnaire, setHasShownQuestionnaire] = useState(false);
  const [isSubmittingKYC, setIsSubmittingKYC] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const finalStateReached = useRef(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const hasFetchedOnce = useRef(false);

  // ============================================
  // FETCH STATUS FROM DB (MASTER TABLE FIRST)
  // ============================================
  
  const fetchStatus = useCallback(async () => {
    if (!userId) {
      if (isMountedRef.current) {
        setIsInitialLoading(false);
      }
      return;
    }

    if (finalStateReached.current) {
      if (isMountedRef.current) {
        setIsInitialLoading(false);
      }
      return;
    }

    // Prevent duplicate fetches
    if (hasFetchedOnce.current && !finalStateReached.current) {
      // Allow polling after initial fetch
    }
    hasFetchedOnce.current = true;

    try {
      setIsCheckingQuestionnaire(true);
      setError(null);
      
      console.log('[Questionnaire] Fetching status for user:', userId);
      
      // STEP 1: Try master table first
      const masterState = await getOnboardingState(userId);
      
      let status: QuestionnaireStatus = 'not_started';
      let protocolStatus: string | null = null;
      let legacyData: any = null;
      
      if (masterState) {
      status = masterState.status as QuestionnaireStatus;
      console.log('[Questionnaire] Using master table ONLY:', { status });
     }
      
      const isCompleted = isCompletedStatus(status);
      
      console.log('[Questionnaire] Status check:', { 
        dbStatus: status,
        computedStatus: status, 
        isCompleted,
        fromMaster: !!masterState
      });

      if (isMountedRef.current) {
        // Never downgrade from completed status
        setQuestionnaireStatus(prev => {
          if (isCompletedStatus(prev)) return prev;
          return status;
        });

        setUserQuestionnaireCompleted(isCompleted);
        setQuestionnaireCompleted(isCompleted);
        setUserQuestionnaireStatus(legacyData || { questionnaire_status: status, protocol_status: protocolStatus });

        if (isCompleted) {
          finalStateReached.current = true;
          setShowQuestionnaire(false);
          
          // Clear polling if we've reached final state
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        }
        
        setIsInitialLoading(false);
      }
      
    } catch (err: any) {
      console.error('[Questionnaire] Exception:', err);
      if (isMountedRef.current) {
        setError(err.message);
        setIsInitialLoading(false);
      }
    } finally {
      if (isMountedRef.current) {
        setIsCheckingQuestionnaire(false);
      }
    }
  }, [userId]);

  // ============================================
  // INITIAL FETCH & POLLING
  // ============================================
  
  useEffect(() => {
    isMountedRef.current = true;
    
    if (!userId) {
      console.log('[Questionnaire] Waiting for userId...');
      setIsInitialLoading(false);
      return;
    }

    // Initial fetch
    fetchStatus();

    // Set up polling for pending status
   // Poll ONLY during pending_review states
  pollingIntervalRef.current = setInterval(() => {
   if (
      !finalStateReached.current &&
      isMountedRef.current &&
      questionnaireStatus === 'pending_review'
    ) {
    fetchStatus();
  }
  }, POLLING_INTERVAL_MS);

    return () => {
      isMountedRef.current = false;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [userId, fetchStatus]);

       // ============================================
    // AUTO-ADVANCE FROM PENDING_REVIEW (time-based)
    // ============================================
    useEffect(() => {
      if (!userId) return;
      if (questionnaireStatus !== 'pending_review') return;

      const checkAndAdvance = async () => {
        const { data, error } = await supabase
          .from('user_onboarding_state')
          .select('updated_at')
          .eq('user_id', userId)
          .single();

        if (error || !data?.updated_at) return;

        const updatedAt = new Date(data.updated_at);
        const minutesElapsed = (Date.now() - updatedAt.getTime()) / 60000;

        if (minutesElapsed >= 15) {
          console.log('[Questionnaire] Auto-advancing from pending_review to kyc_pending');
          await supabase
            .from('user_onboarding_state')
            .update({ status: 'kyc_pending', updated_at: new Date().toISOString() })
            .eq('user_id', userId);
          
          // Refresh status to trigger redirect
          await fetchStatus();
        }
      };

      checkAndAdvance();
    }, [userId, questionnaireStatus, fetchStatus]);

  // ============================================
  // MANUAL CHECK
  // ============================================
  
  const checkQuestionnaireStatus = useCallback(async () => {
    if (isCheckingQuestionnaire || finalStateReached.current) {
      console.log('[Questionnaire] Skipping check - already checking or completed');
      return;
    }
    await fetchStatus();
  }, [isCheckingQuestionnaire, fetchStatus]);

  // ============================================
  // REFRESH STATUS
  // ============================================
  
  const refreshStatus = useCallback(async () => {
    console.log('[Questionnaire] Manual refresh requested');
    await fetchStatus();
  }, [fetchStatus]);

  // ============================================
  // RESET STATE
  // ============================================
  
  const resetState = useCallback(() => {
    console.log('[Questionnaire] Resetting state');
    finalStateReached.current = false;
    hasFetchedOnce.current = false;
    setQuestionnaireStatus('not_started');
    setQuestionnaireCompleted(false);
    setUserQuestionnaireCompleted(false);
    setShowQuestionnaire(false);
    setUserQuestionnaireStatus(null);
    setHasShownQuestionnaire(false);
    setError(null);
    setIsInitialLoading(true);
    
    // Re-fetch status
    fetchStatus();
  }, [fetchStatus]);

  // ============================================
  // SUBMIT KYC COMPLETION
  // ============================================
  
  const submitKYC = useCallback(async (formData: any): Promise<boolean> => {
    if (!userId) {
      console.error('[Questionnaire] No user ID');
      setError('No user ID available');
      return false;
    }
    
    setIsSubmittingKYC(true);
    setError(null);
    
    try {
      console.log('[Questionnaire] Submitting KYC for user:', userId);
      
      const result = await KYCService.submitKYC(userId, formData);
      
      if (result.success) {
        console.log('[Questionnaire] Submission successful');
        
        // Sync to master table after successful submission
        await syncOnboardingStatus(userId, 'kyc_pending');   // or 'completed' if KYC finishes the flow
        
        // Wait a moment for DB to update
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Refresh status
        await fetchStatus();
        setShowQuestionnaire(false);
        
        return true;
      } else {
        console.error('[Questionnaire] Submission failed:', result.error);
        setError(result.error || 'Submission failed');
        return false;
      }
    } catch (err: any) {
      console.error('[Questionnaire] Submission error:', err);
      setError(err.message || 'Submission failed');
      return false;
    } finally {
      setIsSubmittingKYC(false);
    }
  }, [userId, fetchStatus]);

  // ============================================
  // COMPUTED VALUES
  // ============================================
  
  const questionnaireState: QuestionnaireState = useMemo(() => ({
    status: questionnaireStatus,
    protocolStatus: userQuestionnaireStatus?.protocol_status || null,
    submittedAt: userQuestionnaireStatus?.submitted_at || null,
    completedAt: userQuestionnaireStatus?.questionnaire_completed_at || null,
    isCompleted: isCompletedStatus(questionnaireStatus),
    isPending: isPendingStatus(questionnaireStatus),
    isRejected: isRejectedStatus(questionnaireStatus),
    isNotStarted: questionnaireStatus === 'not_started',
  }), [questionnaireStatus, userQuestionnaireStatus]);

  const canProceedToInvestment = useMemo(() => {
    return questionnaireState.isCompleted;
  }, [questionnaireState.isCompleted]);

  const statusColor = useMemo(() => {
    return getQuestionnaireStatusColor(questionnaireStatus);
  }, [questionnaireStatus]);

  const statusLabel = useMemo(() => {
    return getQuestionnaireStatusLabel(questionnaireStatus);
  }, [questionnaireStatus]);

  // ============================================
  // RETURN
  // ============================================
  
  return {
    // State
    questionnaireStatus,
    setQuestionnaireStatus,
    questionnaireCompleted,
    setQuestionnaireCompleted,
    userQuestionnaireCompleted,
    setUserQuestionnaireCompleted,
    showQuestionnaire,
    setShowQuestionnaire,
    userQuestionnaireStatus,
    isCheckingQuestionnaire,
    hasShownQuestionnaire,
    setHasShownQuestionnaire,
    isSubmittingKYC,
    isInitialLoading,
    
    // Actions
    checkQuestionnaireStatus,
    submitKYC,
    refreshStatus,
    resetState,
    
    // Computed
    questionnaireState,
    canProceedToInvestment,
    statusColor,
    statusLabel,
  };
}

// ============================================
// ADDITIONAL HOOKS
// ============================================

/*
 * Hook for questionnaire statistics (admin use)
 */
export function useQuestionnaireStatistics() {
  const [stats, setStats] = useState<{
    total: number;
    completed: number;
    pending: number;
    rejected: number;
    notStarted: number;
    priority: number;
    qualified: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('executive_presale_protocols')
        .select('questionnaire_status');
      
      if (fetchError) throw new Error(fetchError.message);
      
      const statsData = {
        total: data.length,
        completed: data.filter(d => isCompletedStatus(d.questionnaire_status)).length,
        pending: data.filter(d => d.questionnaire_status === 'pending').length,
        rejected: data.filter(d => d.questionnaire_status === 'rejected').length,
        priority: data.filter(d => d.questionnaire_status === 'priority').length,
        qualified: data.filter(d => d.questionnaire_status === 'qualified').length,
      };
      
      setStats(statsData);
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
