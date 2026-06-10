import { supabase } from '../app/components/Lib/supabaseClient';

// ============================================
// TYPES & INTERFACES
// ============================================

export type EmailType = 
  | 'legal_package'
  | 'reminder'
  | 'welcome_package'
  | 'smart_reminder'
  | `legal_doc_${string}`;

export interface EmailResult {
  success: boolean;
  data?: any;
  error?: any;
}

export interface WelcomeEmailData {
  firstName: string;
  userId: string;
  country: string;
}

export interface LegalDocumentEmailData {
  documentType: string;
  documentUrl: string;
  firstName: string;
}

export interface SmartReminderData {
  firstName: string;
  hasWallet: boolean;
  hasLoggedIn: boolean;
  hasCompletedQuestionnaire: boolean;
  nextAction: string;
}

export interface LegalDocument {
  name: string;
  url: string;
}

// ============================================
// CONSTANTS
// ============================================

const LEGAL_DOCUMENTS: LegalDocument[] = [
  { name: 'Token Purchase Agreement', url: '/legal/documents/token-purchase-agreement.pdf' },
  { name: 'Risk Disclosure Statement', url: '/legal/documents/risk-disclosure.pdf' },
  { name: 'Terms of Service', url: '/legal/documents/terms-of-service.pdf' }
];

const DOCUMENT_NAMES: Record<string, string> = {
  'token_purchase_agreement': 'Token Purchase Agreement',
  'risk_disclosure': 'Risk Disclosure Document',
  'accredited_investor_questionnaire': 'Accredited Investor Questionnaire',
  'asset_specific_disclosure': 'Asset-Specific Risk Disclosure'
};

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://tilgroup.live';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get base URL for links
 */
function getBaseUrl(): string {
  return BASE_URL;
}

/**
 * Generate full URL from path
 */
function getFullUrl(path: string): string {
  if (path.startsWith('http')) return path;
  return `${getBaseUrl()}${path}`;
}

/**
 * Get document display name
 */
function getDocumentDisplayName(documentType: string): string {
  return DOCUMENT_NAMES[documentType] || 'Important Legal Document';
}

/**
 * Log email for manual sending when automated fails
 */
async function logEmailFallback(email: string, type: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('pending_emails')
      .insert({
        email: email,
        type: type,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to log email for manual sending:', error);
    } else {
      console.log(`📧 Logged email for manual sending: ${type} to ${email}`);
    }
  } catch (error) {
    console.error('Exception logging email for manual sending:', error);
  }
}

/**
 * Invoke email sending via Supabase Edge Function
 */
async function invokeEmail(to: string, subject: string, html: string): Promise<EmailResult> {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: { to, subject, html }
    });

    if (error) {
      console.error(`Email sending failed (${subject}):`, error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error(`Email service error (${subject}):`, error);
    return { success: false, error };
  }
}

// ============================================
// EMAIL SERVICE
// ============================================

export const emailService = {
  /**
   * Send legal documentation package
   * @param userEmail - Recipient email
   * @param userId - User ID for tracking
   */
  async sendLegalPackage(userEmail: string, userId: string): Promise<EmailResult> {
    const legalDocsHtml = LEGAL_DOCUMENTS.map(doc => 
      `<li><a href="${getFullUrl(doc.url)}">${doc.name}</a></li>`
    ).join('');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0f2a3f 0%, #072532 100%); 
                    color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">MSCPortX Legal Documentation Package</h2>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
          <p style="color: #333;">Please review these required legal documents:</p>
          <ul style="color: #333; line-height: 1.8;">
            ${legalDocsHtml}
          </ul>
          <p style="color: #d97706;"><strong>You must acknowledge these documents in your dashboard before investing.</strong></p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${getFullUrl('/platform')}" 
               style="background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); 
                      color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; 
                      display: inline-block;">
              Go to Dashboard
            </a>
          </div>
        </div>
      </div>
    `;

    const result = await invokeEmail(userEmail, 'Your MSCPortX Legal Documentation Package', html);
    
    if (!result.success) {
      await logEmailFallback(userEmail, 'legal_package');
    }
    
    return result;
  },

  /**
   * Send reminder email
   * @param userEmail - Recipient email
   */
  async sendReminder(userEmail: string): Promise<EmailResult> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0f2a3f 0%, #072532 100%); 
                    color: white; padding: 25px; text-align: center; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">Legal Documentation Reminder</h2>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
          <p style="color: #333;">You still need to complete your legal documentation to start investing.</p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${getFullUrl('/platform')}" 
               style="background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); 
                      color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; 
                      display: inline-block;">
              Complete Now
            </a>
          </div>
        </div>
      </div>
    `;

    const result = await invokeEmail(userEmail, 'Reminder: Complete Your MSCPortX Legal Requirements', html);
    
    if (!result.success) {
      await logEmailFallback(userEmail, 'reminder');
    }
    
    return result;
  },

  /**
   * Send welcome package email
   * @param userEmail - Recipient email
   * @param data - Welcome email data
   */
  async sendWelcomePackage(userEmail: string, data: WelcomeEmailData): Promise<EmailResult> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0f2a3f 0%, #072532 100%); 
                    color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to MSCPortX</h1>
          <p style="opacity: 0.9; margin: 10px 0 0;">Tokenizing Global Maritime Infrastructure</p>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #0f2a3f;">Hello ${escapeHtml(data.firstName)},</h2>
          <p style="color: #333; line-height: 1.6;">
            Thank you for joining MSCPortX. You've taken the first step toward investing in 
            global maritime infrastructure assets including port concessions, strait passage rights, 
            and logistics operations.
          </p>
          
          <div style="background: white; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3 style="color: #0f2a3f; margin-top: 0;">Your Next Steps:</h3>
            <ol style="color: #333; line-height: 1.8;">
              <li><strong>Complete Accredited Investor Questionnaire</strong><br>
              Verify your eligibility for maritime infrastructure investments</li>
              <li><strong>Connect Your Wallet</strong><br>
              Link your Solana wallet to access the platform</li>
              <li><strong>Review Investment Opportunities</strong><br>
              Explore port concessions, docking fees, and other maritime assets</li>
            </ol>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${getFullUrl('/platform/questionnaire')}" 
               style="background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); 
                      color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; 
                      font-weight: bold; display: inline-block;">
              Start Your Questionnaire
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px;">
            <strong>Important:</strong> You will receive your legal documentation package in a separate email.
            All documents must be acknowledged before you can invest.
          </p>
          
          <p style="color: #333;">
            Best regards,<br>
            <strong>The MSCPortX Team</strong>
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #888; font-size: 12px;">
          <p>MSCPortX Maritime Capital LLC • SEC Registered • FINRA Member</p>
          <p>Questions? <a href="mailto:support@mscportx.com" style="color: #10b981;">support@mscportx.com</a></p>
        </div>
      </div>
    `;

    const result = await invokeEmail(
      userEmail, 
      `Welcome to MSCPortX, ${data.firstName}! Start Your Maritime Investment Journey`, 
      html
    );
    
    if (!result.success) {
      await logEmailFallback(userEmail, 'welcome_package');
    } else {
      console.log('✅ Welcome email sent to:', userEmail);
    }
    
    return result;
  },

  /**
   * Send legal document email
   * @param userEmail - Recipient email
   * @param data - Legal document email data
   */
  async sendLegalDocument(userEmail: string, data: LegalDocumentEmailData): Promise<EmailResult> {
    const documentName = getDocumentDisplayName(data.documentType);
    const subject = `MSCPortX: ${documentName}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0f2a3f 0%, #072532 100%); 
                    color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">MSCPortX Legal Document</h2>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
          <p style="color: #333; font-size: 16px;">Hello ${escapeHtml(data.firstName)},</p>
          
          <div style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #0f2a3f; margin-top: 0;">${escapeHtml(documentName)}</h3>
            <p style="color: #666;">
              Please review this important document as part of your MSCPortX investment process.
            </p>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${getFullUrl(data.documentUrl)}" 
                 style="background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); 
                        color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; 
                        font-weight: bold; display: inline-block;">
                Review Document
              </a>
            </div>
            
            ${data.documentType === 'accredited_investor_questionnaire' ? `
            <div style="background: #fff8e1; border-left: 4px solid #f59e0b; padding: 15px; margin-top: 15px; border-radius: 8px;">
              <p style="color: #333; margin: 0; font-size: 14px;">
                <strong>Required:</strong> You must complete this questionnaire before investing in any maritime assets.
              </p>
            </div>
            ` : ''}
          </div>
          
          <p style="color: #666; font-size: 14px;">
            This document is part of your legal requirements for investing in MSCPortX maritime infrastructure tokens.
          </p>
          
          <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="color: #333; font-size: 14px;">
              <strong>Need assistance?</strong><br>
              Contact our compliance team: <a href="mailto:compliance@mscportx.com" style="color: #10b981;">compliance@mscportx.com</a>
            </p>
          </div>
        </div>
      </div>
    `;

    const result = await invokeEmail(userEmail, subject, html);
    
    if (!result.success) {
      await logEmailFallback(userEmail, `legal_doc_${data.documentType}`);
    } else {
      console.log(`✅ Legal document email sent (${data.documentType}):`, userEmail);
    }
    
    return result;
  },

  /**
   * Send smart reminder email based on user progress
   * @param userEmail - Recipient email
   * @param data - Smart reminder data
   */
  async sendSmartReminder(userEmail: string, data: SmartReminderData): Promise<EmailResult> {
    let subject = 'Action Required: Complete Your MSCPortX Setup';
    let actionButtonText = 'Complete Setup';
    let actionUrl = `${getBaseUrl()}/platform`;

    // Customize based on user progress
    if (!data.hasLoggedIn) {
      subject = 'Welcome Back to MSCPortX';
      actionButtonText = 'Log In to Platform';
    } else if (!data.hasWallet) {
      subject = 'Connect Your Wallet to Access Maritime Investments';
      actionButtonText = 'Connect Wallet';
    } else if (!data.hasCompletedQuestionnaire) {
      subject = 'Complete Your Investor Questionnaire';
      actionButtonText = 'Start Questionnaire';
      actionUrl = `${getBaseUrl()}/platform/questionnaire`;
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0f2a3f 0%, #072532 100%); 
                    color: white; padding: 25px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">MSCPortX Reminder</h1>
          <p style="opacity: 0.9; margin: 5px 0 0;">Your Maritime Investment Journey</p>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #0f2a3f; margin-top: 0;">Hello ${escapeHtml(data.firstName)},</h2>
          
          <div style="background: #fff8e1; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3 style="color: #d97706; margin-top: 0;">🔄 ${escapeHtml(data.nextAction)}</h3>
            <p style="color: #333; margin-bottom: 0;">
              Complete this step to unlock access to maritime infrastructure investments.
            </p>
          </div>
          
          <!-- Progress Indicators -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 25px 0;">
            ${renderProgressStep(1, 'Account Created', data.hasLoggedIn)}
            ${renderProgressStep(2, 'Wallet Connected', data.hasWallet)}
            ${renderProgressStep(3, 'Questionnaire', data.hasCompletedQuestionnaire)}
            ${renderProgressStep(4, 'Start Investing', false)}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${getFullUrl(actionUrl)}" 
               style="background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); 
                      color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; 
                      font-weight: bold; display: inline-block;">
              ${actionButtonText}
            </a>
          </div>
          
          <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 15px; margin-top: 20px;">
            <p style="color: #0369a1; margin: 0; font-size: 14px;">
              <strong>Limited Access:</strong> The current presale phase has limited spots remaining. 
              Complete your setup to secure your position.
            </p>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 25px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            Questions? Reply to this email or contact 
            <a href="mailto:support@mscportx.com" style="color: #10b981;">support@mscportx.com</a>
          </p>
        </div>
      </div>
    `;

    const result = await invokeEmail(userEmail, subject, html);
    
    if (!result.success) {
      await logEmailFallback(userEmail, 'smart_reminder');
    } else {
      console.log('✅ Smart reminder email sent to:', userEmail);
    }
    
    return result;
  },

  /**
   * Log email for manual sending when automated fails
   * @param email - Recipient email
   * @param type - Email type
   */

   async logEmailFallback(email: string, type: string): Promise<void> {
     return await logEmailFallback(email, type);
 }
};

// ============================================
// HELPER FUNCTIONS (Internal)
// ============================================

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderProgressStep(step: number, label: string, isComplete: boolean): string {
  const isActive = isComplete;
  const bgColor = isActive ? '#10b981' : '#e5e7eb';
  const textColor = isActive ? 'white' : '#666';
  
  return `
    <div style="text-align: center;">
      <div style="width: 30px; height: 30px; background: ${bgColor}; 
                  border-radius: 50%; display: inline-flex; align-items: center; 
                  justify-content: center; color: ${textColor}; font-weight: bold;">
        ${isActive ? '✓' : step}
      </div>
      <p style="color: #666; font-size: 12px; margin: 5px 0 0;">${escapeHtml(label)}</p>
    </div>
  `;
 }

