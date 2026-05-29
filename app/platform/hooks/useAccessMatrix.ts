import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../../components/Lib/supabaseClient';

export interface AccessMatrix {
  user_id: string;
  onboarding_status: string | null;
  wallet_connected: boolean;
  pof_verified: boolean;
  fully_compliant: boolean;
  presale_access_level: string | null;
  questionnaire_status: string | null;
  kyc_verified: boolean;
  all_legal_docs_acknowledged: boolean;
  can_access_dashboard: boolean;
  is_legally_compliant: boolean;
  can_invest: boolean;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export function useAccessMatrix(userId: string | undefined): AccessMatrix {
  const [state, setState] = useState<AccessMatrix>({
    user_id: '',
    onboarding_status: null,
    wallet_connected: false,
    pof_verified: false,
    fully_compliant: false,
    presale_access_level: null,
    questionnaire_status: null,
    kyc_verified: false,
    all_legal_docs_acknowledged: false,
    can_access_dashboard: false,
    is_legally_compliant: false,
    can_invest: false,
    isLoading: true,
    refresh: async () => {},
  });

 const latestFetchRef = useRef(0);

const fetchMatrix = useCallback(async () => {
  const fetchId = ++latestFetchRef.current;

  console.log(`[AccessMatrix] FETCH START ${fetchId}`);

  if (!userId) {
    setState(prev => ({ ...prev, isLoading: false }));
    return;
  }

  const { data, error } = await supabase
    .from('user_access_matrix')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  console.log(`[AccessMatrix] FETCH END ${fetchId}`, data);

  if (fetchId !== latestFetchRef.current) {
    console.log(`[AccessMatrix] IGNORE STALE FETCH ${fetchId}`);
    return;
  }

  if (error || !data) {
    console.error('[AccessMatrix] fetch error', error);
    setState(prev => ({ ...prev, isLoading: false }));
    return;
  }

  setState({
    ...data,
    isLoading: false,
    refresh: fetchMatrix,
  });

  console.log(`[AccessMatrix] APPLIED FETCH ${fetchId}`, {
    can_invest: data.can_invest,
    legal: data.is_legally_compliant,
    wallet: data.wallet_connected,
    pof: data.pof_verified
  });

}, [userId]);

  useEffect(() => {
    fetchMatrix();

    return () => {};
  }, [userId, fetchMatrix]);

  return state;
}
