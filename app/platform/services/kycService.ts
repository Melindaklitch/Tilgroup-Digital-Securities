// app/platform/services/kycService.ts
import { supabase } from '../../components/Lib/supabaseClient';

// ============================================
// TYPES & INTERFACES
// ============================================

export type QuestionnaireStatus = 'pending' | 'completed' | 'qualified' | 'priority' | 'rejected';
export type ProtocolStatus = 'priority' | 'pending' | 'qualified' | 'referred';

export interface KYCSubmissionData {
  // Core status fields
  protocol_status?: ProtocolStatus;
  submitted_at?: string;
  questionnaire_completed_at?: string;
  
  // Business logic fields
  interest_level?: string;
  engagement_level?: string;
  conviction_level?: string;
  risk_appetite?: string;
  expected_roi_timeline?: string;
  minimum_investment_size?: string;
  maximum_investment_size?: string;
  preferred_asset?: string;
  blockchain?: string;
  wallet_address?: string;
  investment_tier?: 'executive' | 'accredited' | 'priority';
  
  // Allow any other form data
  [key: string]: any;
}

export interface KYCStatusResponse {
  status: QuestionnaireStatus | null;
  protocolStatus: ProtocolStatus | null;
  submittedAt: string | null;
  completedAt: string | null;
  isCompleted: boolean;
  isPending: boolean;
  isRejected: boolean;
}

export interface KYCSubmissionResult {
  success: boolean;
  error?: string;
  data?: any;
  status?: string;
}

export interface KYCValidationError {
  field: string;
  message: string;
}

// ============================================
// KYC SERVICE CLASS
// ============================================

export class KYCService {
  
  /**
   * Submit KYC questionnaire completion
   * @param userId - The user's ID
   * @param formData - Form data from questionnaire
   * @returns Promise<KYCSubmissionResult>
   */
  static async submitKYC(userId: string, formData: any): Promise<KYCSubmissionResult> {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    try {
      console.log('[KYC] Submitting for user:', userId);
      console.log('[KYC] Form data keys:', Object.keys(formData));
      
      // Validate required fields
      const validationErrors = this.validateSubmissionData(formData);
      if (validationErrors.length > 0) {
        const errorMessage = validationErrors.map(e => `${e.field}: ${e.message}`).join(', ');
        return { success: false, error: errorMessage };
      }
      
      // Check if record exists
      const existing = await this.getKYCRecord(userId);
      
      // Prepare data for upsert - ONLY include columns that exist in the table
      const kycData: any = {
        user_id: userId,
        protocol_status: this.calculateProtocolStatus(formData),
        submitted_at: new Date().toISOString(),
        questionnaire_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Add optional fields if they exist in formData
      const optionalFields = [
        'interest_level', 'engagement_level', 'conviction_level', 'risk_appetite',
        'expected_roi_timeline', 'minimum_investment_size', 'maximum_investment_size',
        'preferred_asset', 'blockchain', 'wallet_address', 'investment_tier'
      ];
      
      for (const field of optionalFields) {
        if (formData[field] !== undefined && formData[field] !== null && formData[field] !== '') {
          kycData[field] = formData[field];
        }
      }
      
      let result;
      
      if (existing) {
        // UPDATE existing record
        console.log('[KYC] Updating existing record, ID:', existing.id);
        result = await supabase
          .from('executive_presale_protocols')
          .update(kycData)
          .eq('user_id', userId)
          .select();
      } else {
        // INSERT new record
        console.log('[KYC] Creating new record');
        result = await supabase
          .from('executive_presale_protocols')
          .insert([kycData])
          .select();
      }
      
      if (result.error) {
        console.error('[KYC] Save error:', result.error);
        return { success: false, error: result.error.message };
      }
      
      console.log('[KYC] Saved successfully');
      
      // Verify the save
      const verified = await this.getKYCRecord(userId);
      
       if (verified) {
          return {
          success: true,
          data: result.data?.[0] || verified
        };
          } else {
       return {
       success: false,
       error: 'Could not verify saved KYC record'
     };
    }        

    } catch (error: any) {
      console.error('[KYC] Exception:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Validate submission data
   */
  static validateSubmissionData(formData: any): KYCValidationError[] {
    const errors: KYCValidationError[] = [];
    
    // Required fields validation
    if (!formData || typeof formData !== 'object') {
      errors.push({ field: 'formData', message: 'Form data is required' });
      return errors;
    }
    
    // Validate conviction level (if present in form)
    if (formData.conviction_level !== undefined && !formData.conviction_level) {
      errors.push({ field: 'conviction_level', message: 'Conviction level is required' });
    }
    
    // Validate risk appetite (if present in form)
    if (formData.risk_appetite !== undefined && !formData.risk_appetite) {
      errors.push({ field: 'risk_appetite', message: 'Risk appetite is required' });
    }
    
    return errors;
  }
  
  /**
   * Calculate protocol status based on conviction level
   */
  static calculateProtocolStatus(formData: any): ProtocolStatus {
    const convictionLevel = formData?.conviction_level;
    
    if (convictionLevel === 'high_conviction' || convictionLevel === 'anchor') {
      return 'priority';
    } else if (convictionLevel === 'analysis') {
      return 'qualified';
    } else if (convictionLevel === 'exploratory') {
      return 'pending';
    }
    
    return 'pending';
  }
  
  /**
   * Get KYC record for a user
   */
  static async getKYCRecord(userId: string): Promise<any> {
    if (!userId) return null;
    
    const { data, error } = await supabase
      .from('executive_presale_protocols')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('[KYC] Fetch error:', error);
      return null;
    }
    
    return data;
  }
  
  /**
   * Get current KYC status
   */
  static async getKYCStatus(userId: string): Promise<KYCStatusResponse | null> {
    const data = await this.getKYCRecord(userId);
    
    if (!data) {
      return {
        status: null,
        protocolStatus: null,
        submittedAt: null,
        completedAt: null,
        isCompleted: false,
        isPending: false,
        isRejected: false,
      };
    }
    
    const status = data.questionnaire_status as QuestionnaireStatus;
    const isCompleted = ['completed', 'qualified', 'priority'].includes(status);
    const isPending = status === 'pending';
    const isRejected = status === 'rejected';
    
    return {
      status,
      protocolStatus: data.protocol_status as ProtocolStatus,
      submittedAt: data.submitted_at || null,
      completedAt: data.questionnaire_completed_at || null,
      isCompleted,
      isPending,
      isRejected,
    };
  }
  
  /**
   * Check if user has completed KYC
   */
  static async hasCompletedKYC(userId: string): Promise<boolean> {
    const status = await this.getKYCStatus(userId);
    const isCompleted = status?.isCompleted || false;
    console.log('[KYC] Has completed?', isCompleted, 'Status:', status?.status);
    return isCompleted;
  }
  
  /**
   * Check if KYC is pending
   */
  static async isKYCPending(userId: string): Promise<boolean> {
    const status = await this.getKYCStatus(userId);
    return status?.isPending || false;
  }
  
  /**
   * Check if KYC was rejected
   */
  static async isKYCRejected(userId: string): Promise<boolean> {
    const status = await this.getKYCStatus(userId);
    return status?.isRejected || false;
  }
  
  /**
   * Update KYC status
   */
  static async updateKYCStatus(
    userId: string, 
    status: QuestionnaireStatus, 
    metadata?: Record<string, any>
  ): Promise<KYCSubmissionResult> {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }
    
    try {
      const updateData: any = {
         updated_at: new Date().toISOString(),
        ...metadata,
      };
      
     const { error } = await supabase
        .from('executive_presale_protocols')
        .update(updateData)
        .eq('user_id', userId);
      
      if (error) {
        console.error('[KYC] Update status error:', error);
        return { success: false, error: error.message };
      }
      
      console.log('[KYC] Status updated to:', status);
      return { success: true, status };
      
    } catch (error: any) {
      console.error('[KYC] Update status exception:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Delete KYC record (for testing/retry scenarios)
   */
  static async deleteKYCRecord(userId: string): Promise<{ success: boolean; error?: string }> {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }
    
    try {
      const { error } = await supabase
        .from('executive_presale_protocols')
        .delete()
        .eq('user_id', userId);
      
      if (error) {
        console.error('[KYC] Delete error:', error);
        return { success: false, error: error.message };
      }
      
      console.log('[KYC] Record deleted for user:', userId);
      return { success: true };
      
    } catch (error: any) {
      console.error('[KYC] Delete exception:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Get KYC statistics (for admin dashboard)
   */
  static async getKYCStatistics(): Promise<{
    total: number;
    completed: number;
    pending: number;
    rejected: number;
    notStarted: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('executive_presale_protocols')
        .select('questionnaire_status');
      
      if (error) {
        console.error('[KYC] Stats error:', error);
        return { total: 0, completed: 0, pending: 0, rejected: 0, notStarted: 0 };
      }
      
      const stats = {
        total: data.length,
        completed: data.filter(d => ['completed', 'qualified', 'priority'].includes(d.questionnaire_status)).length,
        pending: data.filter(d => d.questionnaire_status === 'pending').length,
        rejected: data.filter(d => d.questionnaire_status === 'rejected').length,
      };
      
      console.log('[KYC] Statistics:', stats);
      return stats;
      
    } catch (error) {
      console.error('[KYC] Stats exception:', error);
      return { total: 0, completed: 0, pending: 0, rejected: 0, notStarted: 0 };
    }
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Format KYC status for display
 */
export function formatKYCStatus(status: QuestionnaireStatus | null): string {
  const statusMap: Record<QuestionnaireStatus, string> = {
    'pending': 'Pending Review',
    'completed': 'Completed',
    'qualified': 'Qualified',
    'priority': 'Priority Access',
    'rejected': 'Rejected',
  };
  
  return status ? statusMap[status] || 'Unknown' : 'Not Started';
}

/**
 * Get status color for UI
 */
export function getKYCStatusColor(status: QuestionnaireStatus | null): string {
  const colorMap: Record<QuestionnaireStatus, string> = {
    'pending': 'text-yellow-400 bg-yellow-500/10',
    'completed': 'text-emerald-400 bg-emerald-500/10',
    'qualified': 'text-cyan-400 bg-cyan-500/10',
    'priority': 'text-purple-400 bg-purple-500/10',
    'rejected': 'text-red-400 bg-red-500/10',
  };
  
  return status ? colorMap[status] : 'text-slate-400 bg-slate-500/10';
}

/**
 * Get status badge variant
 */
export function getKYCStatusBadge(status: QuestionnaireStatus | null): 'default' | 'secondary' | 'destructive' | 'outline' {
  const variantMap: Record<QuestionnaireStatus, any> = {
    'pending': 'outline',
    'completed': 'default',
    'qualified': 'default',
    'priority': 'default',
    'rejected': 'destructive',
  };
  
  return status ? variantMap[status] : 'secondary';
}
