import { supabase } from '@/app/components/Lib/supabaseClient';

// ============================================
// TYPES & INTERFACES
// ============================================

export type ActivityEventType = 
  | 'login'
  | 'logout'
  | 'investment_made'
  | 'kyc_completed'
  | 'kyc_error'
  | 'document_viewed'
  | 'questionnaire_started'
  | 'questionnaire_completed'
  | 'wallet_connected'
  | 'wallet_disconnected';

export interface ActivityEventData {
  [key: string]: any;
}

export interface ActivityLogOptions {
  timeout?: number;
  skipIpFetch?: boolean;
}

export interface IPInfo {
  ip: string;
  isLocal: boolean;
  isPrivate: boolean;
  source: string;
  timestamp: string;
}

// ============================================
// CONSTANTS
// ============================================

const DEFAULT_FETCH_TIMEOUT_MS = 2000;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Fetch client IP address (non-blocking)
 */
async function fetchClientIP(timeout: number = DEFAULT_FETCH_TIMEOUT_MS): Promise<IPInfo | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch('/api/ip', { 
      signal: controller.signal,
      headers: { 'Cache-Control': 'no-cache' }
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.warn('[Analytics] IP fetch failed (non-critical):', error);
    return null;
  }
}

/**
 * Get user agent safely
 */
function getUserAgent(): string {
  if (typeof navigator === 'undefined') return 'server-side';
  return navigator.userAgent;
}

/**
 * Validate event type
 */
function isValidEventType(eventType: string): eventType is ActivityEventType {
  const validEvents: ActivityEventType[] = [
    'login', 'logout', 'investment_made', 'kyc_completed', 'kyc_error',
    'document_viewed', 'questionnaire_started', 'questionnaire_completed',
    'wallet_connected', 'wallet_disconnected'
  ];
  return validEvents.includes(eventType as ActivityEventType);
}

// ============================================
// MAIN FUNCTION
// ============================================

/**
 * Log user activity to the database
 * @param userId - User ID from auth session
 * @param walletAddress - User's wallet address
 * @param eventType - Type of activity event
 * @param eventData - Additional event metadata
 * @param options - Configuration options
 */
export async function logUserActivity(
  userId: string | null,
  walletAddress: string | null,
  eventType: ActivityEventType | string,
  eventData: ActivityEventData = {},
  options: ActivityLogOptions = {}
): Promise<void> {
  // Don't run during critical auth flows or missing data
  if (!userId || !walletAddress) {
    console.log('[Analytics] Skipped - missing userId or walletAddress');
    return;
  }
  
  // Validate event type
  if (!isValidEventType(eventType)) {
    console.warn(`[Analytics] Unknown event type: ${eventType}`);
  }
  
  const { timeout = DEFAULT_FETCH_TIMEOUT_MS, skipIpFetch = false } = options;
  
  try {
    // Fetch IP information (non-blocking, optional)
    let ipInfo = null;
    if (!skipIpFetch) {
      ipInfo = await fetchClientIP(timeout);
    }
    
    // Prepare log data
    const logData = {
      user_id: userId,
      wallet_address: walletAddress,
      event_type: eventType,
      event_data: eventData,
      user_agent: getUserAgent(),
      ip_address: ipInfo?.ip || null,
      ip_metadata: ipInfo ? (ipInfo as any) : null,
      created_at: new Date().toISOString(),
    };
    
    // Insert into database
    const { error } = await supabase
      .from('user_activity_logs')
      .insert(logData);
    
    if (error) {
      console.error('[Analytics] Database error:', error);
      return;
    }
    
    // Log in development only
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] Logged: ${eventType} for user ${userId}`);
    }
    
  } catch (error) {
    // Never throw - analytics should not block user flow
    console.error('[Analytics] Failed to log activity:', error);
  }
}

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

/**
 * Log login event
 */
export async function logLogin(
  userId: string,
  walletAddress: string,
  metadata?: ActivityEventData
): Promise<void> {
  return logUserActivity(userId, walletAddress, 'login', {
    timestamp: new Date().toISOString(),
    ...metadata,
  });
}

/**
 * Log logout event
 */
export async function logLogout(
  userId: string,
  walletAddress: string
): Promise<void> {
  return logUserActivity(userId, walletAddress, 'logout', {
    timestamp: new Date().toISOString(),
  });
}

/**
 * Log investment event
 */
export async function logInvestment(
  userId: string,
  walletAddress: string,
  amount: number,
  asset: string,
  quantity: number,
  txSignature?: string
): Promise<void> {
  return logUserActivity(userId, walletAddress, 'investment_made', {
    amount,
    asset,
    quantity,
    txSignature,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Log KYC completion event
 */
export async function logKYCCompleted(
  userId: string,
  walletAddress: string,
  status: 'verified' | 'rejected' | 'pending'
): Promise<void> {
  return logUserActivity(userId, walletAddress, 'kyc_completed', {
    status,
    completedAt: new Date().toISOString(),
  });
}

/**
 * Log document view event
 */
export async function logDocumentView(
  userId: string,
  walletAddress: string,
  documentType: string,
  documentTitle: string
): Promise<void> {
  return logUserActivity(userId, walletAddress, 'document_viewed', {
    documentType,
    documentTitle,
    timestamp: new Date().toISOString(),
  });
}

// ============================================
// BATCH LOGGING (for multiple events)
// ============================================

interface BatchLogEntry {
  userId: string;
  walletAddress: string;
  eventType: ActivityEventType | string;
  eventData?: ActivityEventData;
}

/**
 * Log multiple activities in batch
 */
export async function logBatchActivities(entries: BatchLogEntry[]): Promise<void> {
  if (!entries.length) return;
  
  const ipInfo = await fetchClientIP();
  const userAgent = getUserAgent();
  
  const logs = entries.map(entry => ({
    user_id: entry.userId,
    wallet_address: entry.walletAddress,
    event_type: entry.eventType,
    event_data: entry.eventData || {},
    user_agent: userAgent,
    ip_address: ipInfo?.ip || null,
    ip_metadata: ipInfo ? (ipInfo as any) : null,
    created_at: new Date().toISOString(),
  }));
  
  try {
    const { error } = await supabase
      .from('user_activity_logs')
      .insert(logs);
    
    if (error) {
      console.error('[Analytics] Batch insert error:', error);
    }
  } catch (error) {
    console.error('[Analytics] Batch insert failed:', error);
  }
}
