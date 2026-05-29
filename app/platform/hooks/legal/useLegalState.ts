import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../../components/Lib/supabaseClient';
import { useAccessMatrix } from '../useAccessMatrix';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface UserLegalStatus {
  id?: string;
  user_id: string;
  fully_compliant: boolean;
  executive_protocol_completed?: boolean;
  presale_access_level?: 'pending' | 'qualified' | 'priority' | 'executive';
  accredited_investor_status?: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  updated_at?: string;
}

export interface LegalAcknowledgement {
  id?: string;
  user_id: string;
  document_type: string;
  acknowledged: boolean;
  acknowledged_at?: string;
  document_version?: string;
  ip_address?: string;
  user_agent?: string;
}

export interface LegalComplianceStatus {
  isFullyCompliant: boolean;
  hasAcknowledgedDocuments: boolean;
  hasCompletedKYC: boolean;
  isCompliant: boolean;
  presaleAccessLevel: string | null;
}

export interface LegalStateReturn {
  // State
  userLegalStatus: UserLegalStatus | null;
  showLegalModal: boolean;
  setShowLegalModal: (show: boolean) => void;
  legalAcknowledged: boolean;
  setLegalAcknowledged: (acknowledged: boolean) => void;
  showLegalRequirements: boolean;
  setShowLegalRequirements: (show: boolean) => void;
  userLegalCompliant: boolean;
  setUserLegalCompliant: (compliant: boolean) => void;
  isLoading: boolean;


  // Computed
  hasLegalAccess: boolean;
  complianceStatus: LegalComplianceStatus;
  presaleAccessLevel: string | null;
  
  // Actions
  requireLegal: (onAllowed: () => void) => void;
  refreshLegalStatus: () => Promise<void>;
  checkDocumentAcknowledgement: (documentType: string) => Promise<boolean>;
  acknowledgeDocument: (documentType: string) => Promise<boolean>;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get compliance status color for UI
 */
export function getComplianceStatusColor(isCompliant: boolean): string {
  return isCompliant 
    ? 'text-emerald-400 bg-emerald-500/10'
    : 'text-amber-400 bg-amber-500/10';
}

/**
 * Get compliance status label
 */
export function getComplianceStatusLabel(isCompliant: boolean): string {
  return isCompliant ? 'Compliant' : 'Action Required';
}

/**
 * Get access level badge variant
 */
export function getAccessLevelBadge(level: string | null): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (level) {
    case 'executive':
      return 'default';
    case 'priority':
      return 'default';
    case 'qualified':
      return 'outline';
    case 'pending':
      return 'secondary';
    default:
      return 'secondary';
  }
}

// ============================================
// MAIN HOOK
// ============================================

    export function useLegalState(userId: string | undefined): LegalStateReturn {
  const matrix = useAccessMatrix(userId);
  
  // UI state only (not compliance-related)
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [showLegalRequirements, setShowLegalRequirements] = useState(false);
  
  // All compliance values come DIRECTLY from matrix (no local state, no useEffect)
  const legalAcknowledged = matrix.all_legal_docs_acknowledged;
  const userLegalCompliant = matrix.is_legally_compliant;
  const presaleAccessLevel = matrix.presale_access_level;
  const isLoading = matrix.isLoading;
  const hasCompletedKYC = matrix.kyc_verified;
  
  // userLegalStatus is not used in UI - kept for interface compatibility
  const userLegalStatus: UserLegalStatus | null = null;
  
  // These setters are no-ops because values come from matrix
  const setLegalAcknowledged = useCallback(() => {}, []);
  const setUserLegalCompliant = useCallback(() => {}, []);
  
  const checkDocumentAcknowledgement = useCallback(async (documentType: string): Promise<boolean> => {
    if (!userId) return false;
    try {
      const { data, error } = await supabase
        .from('legal_acknowledgements')
        .select('acknowledged')
        .eq('user_id', userId)
        .eq('document_type', documentType)
        .maybeSingle();
      if (error) return false;
      return data?.acknowledged === true;
    } catch {
      return false;
    }
  }, [userId]);

  const acknowledgeDocument = useCallback(async (documentType: string): Promise<boolean> => {
    if (!userId) return false;
    try {
      const { error } = await supabase
        .from('legal_acknowledgements')
        .upsert({
          user_id: userId,
          document_type: documentType,
          acknowledged: true,
          acknowledged_at: new Date().toISOString(),
          user_agent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
        }, { onConflict: 'user_id,document_type' });
      if (error) return false;
      await matrix.refresh();
      return true;
    } catch {
      return false;
    }
  }, [userId, matrix]);

  const refreshLegalStatus = useCallback(async () => {
    await matrix.refresh();
  }, [matrix]);

  const requireLegal = useCallback((onAllowed: () => void) => {
    if (isLoading || matrix.isLoading) return;
    if (!userLegalCompliant) {
      setShowLegalModal(true);
      return;
    }
    onAllowed();
  }, [userLegalCompliant, isLoading, matrix.isLoading]);

  const hasLegalAccess = userLegalCompliant;
  
  const complianceStatus = useMemo<LegalComplianceStatus>(() => ({
    isFullyCompliant: userLegalCompliant,
    hasAcknowledgedDocuments: legalAcknowledged,
    hasCompletedKYC,
    isCompliant: userLegalCompliant,
    presaleAccessLevel,
  }), [userLegalCompliant, legalAcknowledged, hasCompletedKYC, presaleAccessLevel]);

  return {
    userLegalStatus,
    showLegalModal,
    setShowLegalModal,
    legalAcknowledged,
    setLegalAcknowledged,
    showLegalRequirements,
    setShowLegalRequirements,
    userLegalCompliant,
    setUserLegalCompliant,
    isLoading,
    hasLegalAccess,
    complianceStatus,
    presaleAccessLevel,
    requireLegal,
    refreshLegalStatus,
    checkDocumentAcknowledgement,
    acknowledgeDocument,
  };
}

// ============================================
// ADDITIONAL HOOKS (keep exactly as you had them)
// ============================================

export function useRealtimeLegalStatus(userId: string | undefined, onStatusChange?: (isCompliant: boolean) => void) {
  const [realtimeCompliant, setRealtimeCompliant] = useState<boolean | null>(null);
  
  useEffect(() => {
    if (!userId) return;
    
    const subscription = supabase
      .channel(`legal-status-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_legal_status',
          filter: `user_id=eq.${userId}`
        },
        (payload: any) => {
          const isCompliant = payload.new?.fully_compliant === true;
          setRealtimeCompliant(isCompliant);
          onStatusChange?.(isCompliant);
          console.log('[Realtime Legal] Status updated to:', isCompliant);
        }
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [userId, onStatusChange]);
  
  return { realtimeCompliant };
}

export function useLegalDocuments(userId: string | undefined) {
  const [acknowledgedDocs, setAcknowledgedDocs] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  
  const fetchAcknowledgedDocs = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('legal_acknowledgements')
        .select('document_type, acknowledged')
        .eq('user_id', userId)
        .eq('acknowledged', true);
      
      if (error) throw error;
      
      const docsMap: Record<string, boolean> = {};
      data?.forEach(doc => {
        docsMap[doc.document_type] = true;
      });
      
      setAcknowledgedDocs(docsMap);
    } catch (error) {
      console.error('[Legal Documents] Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);
  
  useEffect(() => {
    fetchAcknowledgedDocs();
  }, [fetchAcknowledgedDocs]);
  
  const isDocumentAcknowledged = useCallback((documentType: string): boolean => {
    return acknowledgedDocs[documentType] === true;
  }, [acknowledgedDocs]);
  
  return {
    acknowledgedDocs,
    loading,
    isDocumentAcknowledged,
    refresh: fetchAcknowledgedDocs,
  };
}
