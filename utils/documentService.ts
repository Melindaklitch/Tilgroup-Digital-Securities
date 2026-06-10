// utils/documentService.ts - PROFESSIONAL REFACTORED VERSION
import { supabase } from "../app/components/Lib/supabaseClient";

// ============================================
// TYPES & INTERFACES
// ============================================

export type DocumentType = 
  | 'welcome_package'
  | 'token_purchase_agreement'
  | 'risk_disclosure'
  | 'accredited_investor_questionnaire'
  | 'asset_specific_disclosure'
  | 'country_compliance_guide'
  | 'investment_summary';

export type DeliveryMethod = 'email' | 'platform' | 'both';
export type DeliveryStatus = 'pending' | 'sent' | 'opened' | 'acknowledged' | 'failed';

export interface DocumentMetadata {
  asset_type?: string;
  investment_amount?: number;
  country?: string;
  version?: string;
  expires_at?: string;
  requires_signature?: boolean;
  document_url?: string;
  [key: string]: any;
}

export interface DocumentDelivery {
  userId: string;
  documentType: DocumentType;
  deliveryMethod: DeliveryMethod;
  metadata?: DocumentMetadata;
  url?: string;
}

export interface DocumentDeliveryLog {
  id?: string;
  user_id: string;
  document_type: DocumentType;
  delivery_method: DeliveryMethod;
  delivery_status: DeliveryStatus;
  sent_at: string;
  opened_at?: string;
  acknowledged_at?: string;
  metadata: DocumentMetadata;
  created_at: string;
  updated_at?: string;
}

export interface DocumentDeliveryResult {
  success: boolean;
  error?: string;
  logId?: string;
}

export interface PendingDocument extends DocumentDelivery {
  logId: string;
  sentAt: string;
}

// ============================================
// CONSTANTS
// ============================================

const DEFAULT_BASE_URL = '';

// Document URL mapping with dynamic parameters
const DOCUMENT_URL_MAP: Record<DocumentType, (userId: string, metadata?: DocumentMetadata) => string> = {
  'welcome_package': () => '/legal/documents/welcome-guide.pdf',
  'token_purchase_agreement': () => '/legal/documents/token-purchase-agreement.pdf',
  'risk_disclosure': () => '/legal/documents/risk-disclosure.pdf',
  'accredited_investor_questionnaire': () => '/questionnaire',
  'asset_specific_disclosure': (_, metadata) => `/legal/documents/asset-disclosure-${metadata?.asset_type || 'general'}.pdf`,
  'country_compliance_guide': (_, metadata) => `/legal/documents/compliance-${metadata?.country?.toLowerCase() || 'general'}.pdf`,
  'investment_summary': (userId) => `/api/documents/investment-summary?userId=${userId}`,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get base URL for document generation
 */
  function getBaseUrl(): string {
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    console.warn('[DocumentService] NEXT_PUBLIC_APP_URL missing');
  }

    return process.env.NEXT_PUBLIC_APP_URL || '';
  }

/**
 * Validate document type
 */
function isValidDocumentType(type: string): type is DocumentType {
  const validTypes: DocumentType[] = [
    'welcome_package',
    'token_purchase_agreement',
    'risk_disclosure',
    'accredited_investor_questionnaire',
    'asset_specific_disclosure',
    'country_compliance_guide',
    'investment_summary'
  ];
  return validTypes.includes(type as DocumentType);
}

/**
 * Generate document URL from path
 */
function getFullUrl(path: string): string {
  const baseUrl = getBaseUrl();
  if (path.startsWith('http')) return path;
  return `${baseUrl}${path}`;
}

// ============================================
// DOCUMENT SERVICE
// ============================================

export const documentService = {
  /**
   * Log document delivery for tracking
   * @param delivery - Document delivery information
   * @returns Promise with result
   */
  async logDocumentDelivery(delivery: DocumentDelivery): Promise<DocumentDeliveryResult> {
    try {
      // Validate required fields
      if (!delivery.userId) {
        throw new Error('User ID is required');
      }
      if (!delivery.documentType || !isValidDocumentType(delivery.documentType)) {
        throw new Error(`Invalid document type: ${delivery.documentType}`);
      }

      const logData: Omit<DocumentDeliveryLog, 'id' | 'created_at'> = {
        user_id: delivery.userId,
        document_type: delivery.documentType,
        delivery_method: delivery.deliveryMethod,
        delivery_status: 'sent',
        sent_at: new Date().toISOString(),
        metadata: delivery.metadata || {},
      };

      const { data, error } = await supabase
        .from('document_delivery_logs')
        .insert([logData] as any)
        .select()
        .single();

      if (error) throw error;

      console.log(`✅ Document delivery logged: ${delivery.documentType} for user ${delivery.userId}`);
      return { success: true, logId: data?.id };

    } catch (error) {
      console.error('❌ Failed to log document delivery:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },

  /**
   * Update document status when user opens/acknowledges
   * @param userId - User ID
   * @param documentType - Document type
   * @param status - New status
   * @param action - Action performed
   */
  async updateDocumentStatus(
    userId: string,
    documentType: DocumentType,
    status: DeliveryStatus,
    action: 'opened' | 'acknowledged'
  ): Promise<DocumentDeliveryResult> {
    try {
      if (!userId) throw new Error('User ID is required');
      if (!documentType) throw new Error('Document type is required');

      const updateData: Partial<DocumentDeliveryLog> = {
        delivery_status: status,
        updated_at: new Date().toISOString(),
      };

      if (action === 'opened') {
        updateData.opened_at = new Date().toISOString();
      } else if (action === 'acknowledged') {
        updateData.acknowledged_at = new Date().toISOString();
      }

      // Get the most recent log for this document
      const { data: latestLog, error: fetchError } = await supabase
        .from('document_delivery_logs')
        .select('id')
        .eq('user_id', userId)
        .eq('document_type', documentType)
        .order('sent_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError) throw fetchError;

      const { error: updateError } = await supabase
        .from('document_delivery_logs')
        .update(updateData)
        .eq('id', latestLog.id);

      if (updateError) throw updateError;

      console.log(`✅ Document status updated: ${documentType} -> ${status}`);
      return { success: true, logId: latestLog.id };

    } catch (error) {
      console.error('❌ Failed to update document status:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },

  /**
   * Generate document URL based on type and user context
   * @param documentType - Type of document
   * @param userId - User ID
   * @param metadata - Optional metadata
   * @returns Document URL
   */
  async generateDocumentUrl(
    documentType: DocumentType,
    userId: string,
    metadata?: DocumentMetadata
  ): Promise<string> {
    const urlGenerator = DOCUMENT_URL_MAP[documentType];
    
    if (!urlGenerator) {
      console.warn(`No URL mapping for document type: ${documentType}`);
      return getFullUrl('/legal/documents/general.pdf');
    }

    const path = urlGenerator(userId, metadata);
    return getFullUrl(path);
  },

  /**
   * Get pending documents for a user
   * @param userId - User ID
   * @returns Array of pending documents
   */
  async getPendingDocuments(userId: string): Promise<PendingDocument[]> {
    try {
      if (!userId) {
        console.error('User ID is required');
        return [];
      }

      const { data, error } = await supabase
        .from('document_delivery_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('delivery_status', 'sent')
        .is('acknowledged_at', null)
        .order('sent_at', { ascending: true });

      if (error) throw error;

      const pendingDocuments: PendingDocument[] = [];
      
      for (const log of data || []) {
        const url = await this.generateDocumentUrl(
          log.document_type as DocumentType, 
          userId, 
          log.metadata as any
        );
        
        pendingDocuments.push({
          userId: log.user_id,
          documentType: log.document_type as DocumentType,
          deliveryMethod: log.delivery_method as DeliveryMethod,
          metadata: (log.metadata as any),
          url: url,
          logId: log.id,
          sentAt: log.sent_at ?? new Date().toISOString(),
        });
      }

      console.log(`📄 Found ${pendingDocuments.length} pending documents for user ${userId}`);
      return pendingDocuments;

    } catch (error) {
      console.error('Error fetching pending documents:', error);
      return [];
    }
  },

  /**
   * Check if user has acknowledged a specific document
   * @param userId - User ID
   * @param documentType - Document type
   * @returns Boolean indicating if acknowledged
   */
  async hasUserAcknowledged(userId: string, documentType: DocumentType): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('document_delivery_logs')
        .select('acknowledged_at')
        .eq('user_id', userId)
        .eq('document_type', documentType)
        .not('acknowledged_at', 'is', null)
        .order('sent_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return !!data?.acknowledged_at;

    } catch (error) {
      console.error('Error checking document acknowledgment:', error);
      return false;
    }
  },

  /**
   * Get document delivery history for a user
   * @param userId - User ID
   * @param limit - Maximum number of records
   * @returns Array of delivery logs
   */
  async getDocumentHistory(userId: string, limit: number = 50): Promise<DocumentDeliveryLog[]> {
    try {
      const { data, error } = await supabase
        .from('document_delivery_logs')
        .select('*')
        .eq('user_id', userId)
        .order('sent_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []).map(log => ({
      ...log,
      document_type: log.document_type as any
      })) as any;


    } catch (error) {
      console.error('Error fetching document history:', error);
      return [];
    }
  },

  /**
   * Bulk log multiple document deliveries
   * @param deliveries - Array of document deliveries
   * @returns Array of results
   */
  async bulkLogDeliveries(deliveries: DocumentDelivery[]): Promise<DocumentDeliveryResult[]> {
    const results: DocumentDeliveryResult[] = [];
    
    for (const delivery of deliveries) {
      const result = await this.logDocumentDelivery(delivery);
      results.push(result);
    }
    
    return results;
  },

  /**
   * Retry failed document deliveries
   * @param userId - User ID
   * @param documentType - Document type
   * @returns Result of retry
   */
  async retryFailedDelivery(userId: string, documentType: DocumentType): Promise<DocumentDeliveryResult> {
    try {
      const { data, error } = await supabase
        .from('document_delivery_logs')
        .update({ 
          delivery_status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('document_type', documentType)
        .eq('delivery_status', 'failed')
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        console.log(`🔄 Retried delivery for ${documentType} to user ${userId}`);
        return { success: true, logId: data[0].id };
      }

      return { success: false, error: 'No failed delivery found' };

    } catch (error) {
      console.error('Error retrying delivery:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },
};

