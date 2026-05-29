import { useMemo } from 'react';

// ============================================
// TYPES
// ============================================

export type KYCStatus = 'pending' | 'verified' | 'failed' | null;
export type QuestionnaireStatus =
  | 'not_started'
  | 'pending'
  | 'completed'
  | 'qualified'
  | 'priority'
  | 'rejected';

export interface KYCStateReturn {
  kycStatus: KYCStatus;
  isVerified: boolean;
  isFailed: boolean;
  isPending: boolean;
}

// ============================================
// PURE DERIVED HOOK (NO DB, NO SIDE EFFECTS)
// ============================================

export function useKYCState(
  questionnaireStatus: QuestionnaireStatus | null | undefined
): KYCStateReturn {
  const kycStatus = useMemo<KYCStatus>(() => {
    if (!questionnaireStatus || questionnaireStatus === 'not_started') {
      return null; // ✅ FIX: no fake "pending"
    }

    if (['completed', 'qualified', 'priority'].includes(questionnaireStatus)) {
      return 'verified';
    }

    if (questionnaireStatus === 'rejected') {
      return 'failed';
    }

    if (questionnaireStatus === 'pending') {
      return 'pending';
    }

    return null;
  }, [questionnaireStatus]);

  return {
    kycStatus,
    isVerified: kycStatus === 'verified',
    isFailed: kycStatus === 'failed',
    isPending: kycStatus === 'pending',
  };
}

// ============================================
// UI HELPERS (UNCHANGED)
// ============================================

export function getKYCStatusColor(status: KYCStatus): string {
  switch (status) {
    case 'verified':
      return 'text-emerald-400 bg-emerald-500/10';
    case 'failed':
      return 'text-red-400 bg-red-500/10';
    case 'pending':
      return 'text-yellow-400 bg-yellow-500/10';
    default:
      return 'text-slate-400 bg-slate-500/10';
  }
}

export function getKYCStatusLabel(status: KYCStatus): string {
  switch (status) {
    case 'verified':
      return 'Verified';
    case 'failed':
      return 'Failed';
    case 'pending':
      return 'Pending Review';
    default:
      return 'Not Started';
  }
}

export function getKYCStatusBadge(
  status: KYCStatus
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'verified':
      return 'default';
    case 'failed':
      return 'destructive';
    case 'pending':
      return 'outline';
    default:
      return 'secondary';
  }
}
