// app/components/Lib/supabaseClient.ts
import { createClient, SupabaseClient, SupabaseClientOptions } from "@supabase/supabase-js";

// ============================================
// TYPES & INTERFACES
// ============================================

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          company_name: string | null;
          wallet_address: string | null;
          user_type: string | null;
          onboarding_step: string | null;
          investment_tier: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          company_name?: string | null;
          wallet_address?: string | null;
          user_type?: string | null;
          onboarding_step?: string | null;
          investment_tier?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      presale_purchases: {
        Row: {
          id: string;
          user_id: string;
          wallet_address: string;
          asset_name: string;
          asset_key: string;
          asset_name_key: string | null;
          quantity: number;
          price_usd: number;
          total_usd: number;
          payment_token: string;
          payment_history: any;
          tx_signature: string;
          source: string;
          created_at: string;
          latest_purchase_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['presale_purchases']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['presale_purchases']['Insert']>;
      };
      executive_presale_protocols: {
        Row: {
          id: string;
          user_id: string;
          questionnaire_status: string;
          protocol_status: string;
          submitted_at: string | null;
          questionnaire_completed_at: string | null;
          conviction_level: string | null;
          risk_appetite: string | null;
          expected_roi_timeline: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['executive_presale_protocols']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['executive_presale_protocols']['Insert']>;
      };
      user_legal_status: {
       Row: {
           id: string;
           user_id: string;
           fully_compliant: boolean;
           executive_protocol_completed: boolean;

           accredited_investor_questionnaire_completed: boolean;
           accredited_investor_status: string;

           presale_access_level: string;

           created_at: string;
           updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_legal_status']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['user_legal_status']['Insert']>;
      };
      legal_acknowledgements: {
        Row: {
          id: string;
          user_id: string;
          document_type: string;
          acknowledged: boolean;
          acknowledged_at: string;
          document_version: string;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['legal_acknowledgements']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['legal_acknowledgements']['Insert']>;
      };
      document_requests: {
        Row: {
          id: string;
          user_id: string;
          document_type: string;
          document_title: string;
          requested_language: string;
          reason: string | null;
          requested_at: string;
          processed_at: string | null;
          status: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['document_requests']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['document_requests']['Insert']>;
      };
      presale_sessions: {
        Row: {
          id: string;
          user_id: string;
          presale_start_at: string;
          has_invested: boolean;
          virtual_investors: number;
          total_raised: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['presale_sessions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['presale_sessions']['Insert']>;
      };
    };
    Views: {
      [key: string]: any;
    };
    Functions: {
      [key: string]: any;
    };
    Enums: {
      [key: string]: any;
    };
  };
};

// ============================================
// CONSTANTS
// ============================================

const STORAGE_KEY_PREFIX = 'sb';
const APP_NAME = 'portx-landing';
const DEFAULT_TIMEOUT_MS = 60000; // 30 seconds

// ============================================
// ENVIRONMENT VALIDATION
// ============================================

function validateEnvironment(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is not defined');
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined');
  }
  
  // Validate URL format
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
    } catch {
      errors.push('NEXT_PUBLIC_SUPABASE_URL is not a valid URL');
    }
  }
  
  return { isValid: errors.length === 0, errors };
}

// Log validation results
const envValidation = validateEnvironment();
if (!envValidation.isValid) {
  console.error('[Supabase] Environment validation failed:', envValidation.errors);
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`Supabase configuration error: ${envValidation.errors.join(', ')}`);
  }
} else if (process.env.NODE_ENV === 'development') {
  console.log('[Supabase] Environment validated successfully');
}

// ============================================
// SUPABASE CLIENT OPTIONS
// ============================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Extract project reference for storage key
const projectRef = supabaseUrl.split('//')[1]?.split('.')[0] || 'default';

const clientOptions: SupabaseClientOptions<Database['public']> = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: `${STORAGE_KEY_PREFIX}-${projectRef}-auth-token`,
    flowType: 'pkce',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
    timeout: 30000,
  },
  global: {
    headers: {
      'x-application-name': APP_NAME,
      'x-client-info': `supabase-js/${APP_NAME}`,
    },
    fetch: (url, options) => {
      // Add timeout to fetch requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
      
      const fetchOptions = {
        ...options,
        signal: controller.signal,
      };
      
      return fetch(url, fetchOptions).finally(() => {
        clearTimeout(timeoutId);
      });
    },
  },
  db: {
    schema: 'public',
  },
};

// ============================================
// CREATE SUPABASE CLIENT
// ============================================

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, clientOptions);

// ============================================
// HEALTH CHECK FUNCTION
// ============================================

export async function checkSupabaseHealth(): Promise<{ healthy: boolean; error?: string; latency?: number }> {
  const startTime = Date.now();
  
  try {
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    
    const latency = Date.now() - startTime;
    
    if (error) {
      console.error('[Supabase] Health check failed:', error);
      return { healthy: false, error: error.message, latency };
    }
    
    console.log(`[Supabase] Health check passed (${latency}ms)`);
    return { healthy: true, latency };
  } catch (error: any) {
    console.error('[Supabase] Health check exception:', error);
    return { healthy: false, error: error.message };
  }
}

// ============================================
// CONNECTION STATUS MONITORING
// ============================================

let isConnected = true;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

export function onSupabaseConnectionChange(callback: (connected: boolean) => void): () => void {
  const handleOnline = () => {
    console.log('[Supabase] Network online, attempting reconnect');
    reconnectAttempts = 0;
    checkSupabaseHealth().then(result => {
      if (result.healthy) {
        isConnected = true;
        callback(true);
      }
    });
  };
  
  const handleOffline = () => {
    console.log('[Supabase] Network offline');
    isConnected = false;
    callback(false);
  };
  
  if (typeof window !== 'undefined') {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
  }
  
  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    }
  };
}

// ============================================
// REALTIME CONNECTION MANAGEMENT
// ============================================

let realtimeSubscription: any = null;

export async function initializeRealtimeConnection() {
  if (typeof window === 'undefined') return null;
  
  try {
    // Force a realtime connection by creating a dummy channel
    const channel = supabase.channel('system-heartbeat', {
      config: {
        broadcast: { self: false },
        presence: { key: 'heartbeat' },
      },
    });
    
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('[Supabase] ✅ Realtime connection established');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('[Supabase] ❌ Realtime connection failed');
      } else if (status === 'TIMED_OUT') {
        console.warn('[Supabase] ⚠️ Realtime connection timeout');
      }
    });
    
    realtimeSubscription = channel;
    return channel;
  } catch (error) {
    console.error('[Supabase] Failed to initialize realtime:', error);
    return null;
  }
}

export async function closeRealtimeConnection() {
  if (realtimeSubscription) {
    await realtimeSubscription.unsubscribe();
    realtimeSubscription = null;
    console.log('[Supabase] Realtime connection closed');
  }
}

export function setupRealtimeRetry() {
  let retryCount = 0;
  const maxRetries = 3;
  const retryDelay = 5000;
  
  const attemptConnection = async () => {
    const channel = await initializeRealtimeConnection();
    if (!channel && retryCount < maxRetries) {
      retryCount++;
      console.log(`[Supabase] Retrying realtime connection (${retryCount}/${maxRetries})...`);
      setTimeout(attemptConnection, retryDelay);
    }
  };
  
  attemptConnection();
}

// ============================================
// AUTH HELPER FUNCTIONS
// ============================================

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('[Supabase] Failed to get current user:', error);
    return null;
  }
  return user;
}

export async function getCurrentSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('[Supabase] Failed to get current session:', error);
    return null;
  }
  return session;
}

export async function refreshSession() {
  const { data: { session }, error } = await supabase.auth.refreshSession();
  if (error) {
    console.error('[Supabase] Failed to refresh session:', error);
    return null;
  }
  return session;
}

// ============================================
// SIGN OUT WITH CLEANUP
// ============================================

export async function signOutAndCleanup(): Promise<void> {
  try {
    // Clear any custom storage items
    if (typeof window !== 'undefined') {
      const keysToRemove = [
        `${STORAGE_KEY_PREFIX}-${projectRef}-auth-token`,
        'portx_session_backup',
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
    }
    
    await supabase.auth.signOut();
    console.log('[Supabase] Signed out and cleaned up successfully');
  } catch (error) {
    console.error('[Supabase] Sign out error:', error);
    throw error;
  }
}

// ============================================
// EXPORT TYPES
// ============================================

export type { SupabaseClient };
export type Tables = Database['public']['Tables'];
export type Profile = Tables['profiles']['Row'];
export type PresalePurchase = Tables['presale_purchases']['Row'];
export type ExecutiveProtocol = Tables['executive_presale_protocols']['Row'];
export type UserLegalStatus = Tables['user_legal_status']['Row'];
export type LegalAcknowledgement = Tables['legal_acknowledgements']['Row'];
export type DocumentRequest = Tables['document_requests']['Row'];
export type PresaleSession = Tables['presale_sessions']['Row'];
