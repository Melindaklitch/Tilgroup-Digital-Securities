import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabase } from '@/app/components/Lib/supabaseClient';

// ============================================
// TYPES & INTERFACES
// ============================================

interface WelcomeEmailPayload {
  to: string;
  firstName: string;
  userId: string;
  country?: string;
  userTier?: 'executive' | 'accredited' | 'priority';
}

interface TierMessages {
  title: string;
  benefits: string[];
  color: string;
  features: string[];
}

interface EmailResponse {
  success: boolean;
  message?: string;
  error?: string;
  emailId?: string;
}

interface DeliveryLog {
  user_id: string;
  document_type: string;
  status: 'pending' | 'delivered' | 'failed';
  error_message?: string;
  recipient_email: string;
  sent_at?: string;
  email_id?: string;
  country?: string;
  metadata?: Record<string, any>;
}

// ============================================
// CONSTANTS
// ============================================

// Tier-specific content
const TIER_MESSAGES: Record<string, TierMessages> = {
  executive: {
    title: "👑 Executive Tier Access",
    benefits: [
      "Full ROI rates (6-12% annual)",
      "Priority asset allocation",
      "Direct management access",
      "Exclusive executive briefings",
      "First right of refusal on new offerings"
    ],
    color: "#8b5cf6",
    features: ["100% ROI eligibility", "Priority queue position", "Direct deal team access"]
  },
  accredited: {
    title: "⭐ Accredited Investor Access",
    benefits: [
      "85% of base ROI rates",
      "All asset class access",
      "Monthly portfolio updates",
      "Quarterly investor calls",
      "Comprehensive due diligence access"
    ],
    color: "#10b981",
    features: ["85% ROI eligibility", "Full asset access", "Standard support tier"]
  },
  priority: {
    title: "🚀 Priority Access",
    benefits: [
      "75% of base ROI rates",
      "Select asset classes",
      "Managed platform access",
      "Email support priority",
      "Regular project updates"
    ],
    color: "#06b6d4",
    features: ["75% ROI eligibility", "Select asset access", "Priority support"]
  }
};

const DEFAULT_TIER = 'priority';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Validate request payload
 */
function validatePayload(payload: Partial<WelcomeEmailPayload>): { isValid: boolean; error?: string } {
  if (!payload.to) return { isValid: false, error: 'Recipient email is required' };
  if (!payload.firstName) return { isValid: false, error: 'First name is required' };
  if (!payload.userId) return { isValid: false, error: 'User ID is required' };
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(payload.to)) {
    return { isValid: false, error: 'Invalid email format' };
  }
  
  return { isValid: true };
}

/**
 * Escape HTML special characters
 */
function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Format benefits as HTML list
 */
function formatBenefitsList(benefits: string[]): string {
  return benefits.map(benefit => `<li>✓ ${escapeHtml(benefit)}</li>`).join('');
}

/**
 * Get country flag emoji
 */
function getCountryFlag(country?: string): string {
  const flags: Record<string, string> = {
    'Vietnam': '🇻🇳',
    'United States': '🇺🇸',
    'Singapore': '🇸🇬',
    'China': '🇨🇳',
    'Japan': '🇯🇵',
    'South Korea': '🇰🇷',
    'Germany': '🇩🇪',
    'France': '🇫🇷',
    'United Kingdom': '🇬🇧',
    'Australia': '🇦🇺',
  };
  return flags[country || ''] || '🌍';
}

/**
 * Generate HTML email content
 */
function generateEmailHtml(data: WelcomeEmailPayload): string {
  const tier = data.userTier || DEFAULT_TIER;
  const tierInfo = TIER_MESSAGES[tier] || TIER_MESSAGES[DEFAULT_TIER];
  const countryFlag = getCountryFlag(data.country);
  const currentYear = new Date().getFullYear();
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to TILGroup Digital Securities</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
      line-height: 1.6; 
      color: #e2e8f0; 
      margin: 0; 
      padding: 20px; 
      background: #071526;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background: #0f2a3f; 
      border-radius: 20px; 
      overflow: hidden; 
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); 
      border: 1px solid rgba(0, 255, 136, 0.2);
    }
    .header { 
      background: linear-gradient(135deg, #0f2a3f 0%, #072532 100%);
      padding: 40px 30px;
      text-align: center;
      border-bottom: 1px solid rgba(0, 255, 136, 0.2);
    }
    .logo-container {
      display: flex;
      justify-content: center;
      margin-bottom: 20px;
    }
    .logo-img {
      width: 80px;
      height: 80px;
      border-radius: 20px;
      background: linear-gradient(135deg, #0f2a3f 0%, #072532 100%);
      padding: 10px;
      border: 2px solid rgba(0, 255, 136, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
    }
    .logo-text {
      font-size: 32px;
      font-weight: bold;
      letter-spacing: -0.5px;
    }
    .logo-text span { color: #00ff88; }
    .tagline { color: #94a3b8; font-size: 13px; margin-top: 8px; letter-spacing: 1px; }
    .welcome-badge { 
      background: rgba(0, 255, 136, 0.1); 
      color: #00ff88; 
      padding: 8px 20px; 
      border-radius: 50px; 
      display: inline-block; 
      font-size: 14px; 
      font-weight: 600; 
      margin-bottom: 20px; 
      border: 1px solid rgba(0, 255, 136, 0.3);
    }
    .content { padding: 40px 30px; background: #0f2a3f; }
    h2 { color: white; font-size: 24px; margin: 20px 0 10px; }
    h3 { color: #00ff88; font-size: 18px; margin: 30px 0 15px; }
    .tier-card { 
      background: linear-gradient(135deg, #072532 0%, #0a1f2f 100%); 
      padding: 25px; 
      border-radius: 16px; 
      margin: 25px 0; 
      border-left: 4px solid ${tierInfo.color};
    }
    .tier-title { color: ${tierInfo.color}; font-size: 20px; font-weight: bold; margin-bottom: 12px; }
    .tier-benefits { color: #94a3b8; font-size: 14px; line-height: 1.8; }
    .tier-benefits ul { margin: 10px 0 0 20px; }
    .tier-benefits li { margin: 6px 0; }
    .step { 
      background: #072532; 
      padding: 20px; 
      margin: 15px 0; 
      border-radius: 12px; 
      border-left: 4px solid #00ff88;
      transition: transform 0.2s;
    }
    .step strong { color: #00ff88; display: block; margin-bottom: 8px; font-size: 16px; }
    .step p { color: #cbd5e1; margin: 0; font-size: 14px; }
    .stats { 
      display: flex; 
      justify-content: space-between; 
      background: #072532; 
      padding: 20px; 
      border-radius: 12px; 
      margin: 25px 0; 
    }
    .stat-item { text-align: center; flex: 1; }
    .stat-value { color: #00ff88; font-size: 22px; font-weight: bold; }
    .stat-label { color: #94a3b8; font-size: 12px; margin-top: 5px; }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
      color: white;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 10px;
      font-weight: 600;
      margin: 20px 0;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
    }
    .next-steps-card {
      background: #0a1f2f;
      padding: 20px;
      border-radius: 12px;
      margin: 25px 0;
      border: 1px solid rgba(0, 255, 136, 0.15);
    }
    .footer {
      background: #072532;
      padding: 30px;
      text-align: center;
      color: #64748b;
      font-size: 12px;
      border-top: 1px solid rgba(0, 255, 136, 0.1);
    }
    .footer a { color: #00ff88; text-decoration: none; }
    .legal-note { 
      margin-top: 30px; 
      font-size: 11px; 
      color: #475569; 
      padding-top: 20px;
      border-top: 1px solid #1e2f3f;
    }
    @media (max-width: 600px) {
      body { padding: 10px; }
      .header { padding: 30px 20px; }
      .content { padding: 30px 20px; }
      h2 { font-size: 20px; }
      .stats { flex-direction: column; gap: 15px; }
      .button { display: block; text-align: center; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-container">
        <div class="logo-img">🚢</div>
      </div>
      <div class="logo-text">TIL<span>Group</span></div>
      <div class="tagline">Port Investment • Tokenized • Compliant</div>
    </div>
    
    <div class="content">
      <div class="welcome-badge">Welcome Aboard, ${escapeHtml(data.firstName)}! ${countryFlag}</div>
      
      <h2>Your Journey into Port Infrastructure Begins</h2>
      <p style="color: #94a3b8; margin-bottom: 20px;">Thank you for joining TILGroup Digital Securities. You now have access to the <strong>$5.5B Can Gio International Transshipment Port</strong> investment opportunity — the deepest port in Southern Vietnam.</p>

      <div class="tier-card">
        <div class="tier-title">${tierInfo.title}</div>
        <div class="tier-benefits">
          <ul>
            ${formatBenefitsList(tierInfo.benefits)}
          </ul>
        </div>
      </div>

      <h3>📋 Complete Your Onboarding</h3>
      
      <div class="step">
        <strong>Step 1: Complete Executive Protocol</strong>
        <p>Complete the accredited investor questionnaire to verify your status and unlock full investment privileges. This takes approximately 5-10 minutes.</p>
      </div>
      
      <div class="step">
        <strong>Step 2: Connect Your Wallet</strong>
        <p>Link your Solana wallet to the platform. This will be used for investments and receiving digital ownership certificates (SPL tokens).</p>
      </div>
      
      <div class="step">
        <strong>Step 3: Review & Acknowledge Legal Documents</strong>
        <p>Review port concession agreements, regulatory compliance docs, and token purchase agreements before your first investment.</p>
      </div>

      <div class="stats">
        <div class="stat-item">
          <div class="stat-value">$5.5B</div>
          <div class="stat-label">Port Value</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">$150M</div>
          <div class="stat-label">Presale Allocation</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">30yr</div>
          <div class="stat-label">Concession Period</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">8.5M</div>
          <div class="stat-label">Annual TEU</div>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="${PLATFORM_URL}/platform" class="button">Access Your Dashboard →</a>
      </div>

      <div class="next-steps-card">
        <p style="color: #94a3b8; margin: 0; font-size: 14px;">
          <strong style="color: #00ff88;">📌 Next Steps:</strong> Legal documents and the executive protocol questionnaire have been prepared for your review. Complete these steps to begin investing in Can Gio Port's digital securities offering.
        </p>
      </div>

      <p style="color: #94a3b8; font-size: 14px;">If you have any questions, our investor relations team is available to assist you throughout the process.</p>
      
      <p style="color: #94a3b8; margin-top: 20px;">
        Best regards,<br>
        <strong style="color: #00ff88;">The TILGroup Digital Securities Team</strong>
      </p>
      
      <div class="legal-note">
        <p><strong>Legal Disclaimer:</strong> This communication is intended for accredited investors only. The Can Gio International Transshipment Port is a TILGroup development in Ho Chi Minh City, Vietnam, backed by MSC Group. All investments are subject to regulatory compliance and legal documentation. Past performance does not guarantee future results. Digital securities involve risk, including potential loss of principal.</p>
        <p style="margin-top: 10px;">© ${currentYear} TILGroup Digital Securities. All rights reserved.</p>
      </div>
    </div>
    
    <div class="footer">
      <p>📍 Can Gio District, Ho Chi Minh City, Vietnam</p>
      <p>📧 <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a> • 🌐 <a href="${PLATFORM_URL}">${PLATFORM_URL.replace('https://', '')}</a></p>
      <p style="margin-top: 10px;">🚢 $5.5B Infrastructure Development • Backed by MSC Group</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Log email delivery to database
 */
async function logDelivery(
  userId: string,
  recipientEmail: string,
  status: 'pending' | 'delivered' | 'failed',
  country?: string,
  emailId?: string,
  errorMessage?: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    const logData: DeliveryLog = {
      user_id: userId,
      document_type: 'welcome_email',
      status,
      recipient_email: recipientEmail,
      country,
      metadata,
    };
    
    if (status === 'delivered') {
      logData.sent_at = new Date().toISOString();
      logData.email_id = emailId;
    }
    
    if (errorMessage) {
      logData.error_message = errorMessage;
    }
    
    const { error } = await supabase.from('document_delivery_logs').insert(logData);
    
    if (error) {
      console.error('[WelcomeEmail] Failed to log delivery:', error);
    } else {
      console.log(`[WelcomeEmail] Logged delivery status: ${status}`);
    }
  } catch (error) {
    console.error('[WelcomeEmail] Exception logging delivery:', error);
  }
}

/**
 * Log user activity
 */
async function logUserActivity(userId: string, userTier: string, country?: string): Promise<void> {
  try {
  const { error } = await supabase.from('user_activity_logs').insert({
    user_id: userId,
    event_type: 'welcome_email_sent',
    event_data: {
    timestamp: new Date().toISOString(),
    tier: userTier || 'pending',
    country: country || 'unknown'
  }
});
    
    if (error) {
      console.error('[WelcomeEmail] Failed to log user activity:', error);
    }
  } catch (error) {
    console.error('[WelcomeEmail] Exception logging user activity:', error);
  }
}

/**
 * Send email with retry logic
 */
async function sendEmailWithRetry(
  resend: Resend,
  options: Parameters<typeof resend.emails.send>[0],
  maxRetries: number = MAX_RETRY_ATTEMPTS
): Promise<{ success: boolean; data?: any; error?: string }> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await resend.emails.send(options);
      console.log(`[WelcomeEmail] Email sent successfully (attempt ${attempt})`);
      return { success: true, data: result };
    } catch (error: any) {
      console.error(`[WelcomeEmail] Attempt ${attempt} failed:`, error.message);
      if (attempt === maxRetries) {
        return { success: false, error: error.message };
      }
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, attempt - 1)));
    }
  }
  return { success: false, error: 'Max retries exceeded' };
}

// ============================================
// MAIN API ROUTE HANDLER
// ============================================

export async function POST(request: NextRequest): Promise<NextResponse<EmailResponse>> {
  const startTime = Date.now();
  
  try {
    // Parse request body
    const payload = await request.json() as WelcomeEmailPayload;
    
    const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || `TILGroup Digital Securities <noreply@${process.env.RESEND_DOMAIN}>`;
    const SUPPORT_EMAIL = 'investor-relations@tilgroup.live';
    const PLATFORM_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const MAX_RETRY_ATTEMPTS = 3;
    const RETRY_DELAY_MS = 1000;

    console.log(`[WelcomeEmail] Processing for: ${payload.to}, Tier: ${payload.userTier || 'pending'}`);
    
    // Validate payload
    const validation = validatePayload(payload);
    if (!validation.isValid) {
      console.error(`[WelcomeEmail] Validation failed: ${validation.error}`);
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }
    
    // Log pending delivery
    await logDelivery(payload.userId, payload.to, 'pending', payload.country, undefined, undefined, {
      tier: payload.userTier,
      firstName: payload.firstName,
    });
    
    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('[WelcomeEmail] RESEND_API_KEY not configured');
      await logDelivery(payload.userId, payload.to, 'failed', payload.country, undefined, 'Email service not configured');
      return NextResponse.json(
        { success: false, error: 'Email service not configured' },
        { status: 500 }
      );
    }
    
   const resend = new Resend(process.env.RESEND_API_KEY);

    // Generate email HTML
    const emailHtml = generateEmailHtml(payload);
    const userTier = payload.userTier || DEFAULT_TIER;
    const tierInfo = TIER_MESSAGES[userTier] || TIER_MESSAGES[DEFAULT_TIER];
    
    // Prepare email options
    const emailOptions = {
      from: FROM_EMAIL,
      to: [payload.to],
      subject: `🎉 Welcome to TILGroup Digital Securities, ${payload.firstName}!`,
      html: emailHtml,
      replyTo: SUPPORT_EMAIL,
      headers: {
        'X-User-ID': payload.userId,
        'X-User-Tier': userTier,
        'X-Priority': 'normal',
      },
    };
    
    // Send email with retry
    const result = await sendEmailWithRetry(resend, emailOptions);
    
    const duration = Date.now() - startTime;
    
    if (!result.success) {
      console.error(`[WelcomeEmail] Email failed after ${duration}ms:`, result.error);
      await logDelivery(payload.userId, payload.to, 'failed', payload.country, undefined, result.error);
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to send welcome email' },
        { status: 500 }
      );
    }
    
    // Log successful delivery
    await logDelivery(
      payload.userId,
      payload.to,
      'delivered',
      payload.country,
      result.data?.id,
      undefined,
      {
        tier: userTier,
        firstName: payload.firstName,
        duration_ms: duration,
      }
    );
    
    // Log user activity
    await logUserActivity(payload.userId, userTier, payload.country);
    
    console.log(`[WelcomeEmail] Successfully sent to ${payload.to} (${duration}ms)`);
    
    return NextResponse.json({
      success: true,
      message: 'Welcome email sent successfully',
      emailId: result.data?.id,
    });
    
  } catch (error: any) {
    console.error('[WelcomeEmail] Fatal error:', error);
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: process.env.NODE_ENV === 'development' ? error.message : 'Failed to send welcome email'
      },
      { status: 500 }
    );
  }
}

// ============================================
// OPTIONAL: GET endpoint for welcome status
// ============================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const email = searchParams.get('email');
  
  if (!userId && !email) {
    return NextResponse.json(
      { error: 'User ID or Email required' },
      { status: 400 }
    );
  }
  
  try {
    let query = supabase.from('document_delivery_logs').select('*').eq('document_type', 'welcome_email');
    
    if (userId) {
      query = query.eq('user_id', userId);
    } else if (email) {
      query = query.eq('recipient_email', email);
    }
    
    const { data, error } = await query.order('sent_at', { ascending: false });
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      data: data?.[0] || null,
    });
    
  } catch (error: any) {
    console.error('[WelcomeEmail] Status check error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
