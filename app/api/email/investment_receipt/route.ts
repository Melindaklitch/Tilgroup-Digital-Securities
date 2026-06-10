import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabase } from '@/app/components/Lib/supabaseClient';

// ============================================
// TYPES & INTERFACES
// ============================================

interface InvestmentReceiptPayload {
  to: string;
  firstName: string;
  userId: string;
  assetName: string;
  quantity: number;
  pricePerUnit: number;
  totalUSD: number;
  paymentToken: string;
  transactionId: string;
  investmentDate: string;
  userTier?: string;
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
  metadata?: Record<string, any>;
}

// ============================================
// CONSTANTS
// ============================================

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || `TILGroup Digital Securities <noreply@${process.env.RESEND_DOMAIN}>`;
const SUPPORT_EMAIL = 'legaloffice@tilgroup.live';
const PLATFORM_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

// Asset icon mapping
const ASSET_ICONS: Record<string, string> = {
  'tilTerminalx': '🚀',
  'portConcessions': '⚓',
  'dockingFees': '🛳️',
  'containerHandling': '📦',
  'logisticsInfrastructure': '🚚',
  'straitPassageRights': '🌊',
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Validate request payload
 */
function validatePayload(payload: Partial<InvestmentReceiptPayload>): { isValid: boolean; error?: string } {
  if (!payload.to) return { isValid: false, error: 'Recipient email is required' };
  if (!payload.firstName) return { isValid: false, error: 'First name is required' };
  if (!payload.userId) return { isValid: false, error: 'User ID is required' };
  if (!payload.assetName) return { isValid: false, error: 'Asset name is required' };
  if (!payload.quantity || payload.quantity <= 0) return { isValid: false, error: 'Valid quantity is required' };
  if (!payload.pricePerUnit || payload.pricePerUnit <= 0) return { isValid: false, error: 'Valid price per unit is required' };
  if (!payload.totalUSD || payload.totalUSD <= 0) return { isValid: false, error: 'Valid total amount is required' };
  if (!payload.transactionId) return { isValid: false, error: 'Transaction ID is required' };
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(payload.to)) {
    return { isValid: false, error: 'Invalid email format' };
  }
  
  return { isValid: true };
}

/**
 * Get asset icon
 */
function getAssetIcon(assetName: string): string {
  for (const [key, icon] of Object.entries(ASSET_ICONS)) {
    if (assetName.toLowerCase().includes(key.toLowerCase())) {
      return icon;
    }
  }
  return '📄';
}

/**
 * Format currency
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date
 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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
 * Generate HTML email content
 */
function generateEmailHtml(data: InvestmentReceiptPayload): string {
  const assetIcon = getAssetIcon(data.assetName);
  const formattedTotal = formatCurrency(data.totalUSD);
  const formattedPrice = formatCurrency(data.pricePerUnit);
  const formattedDate = formatDate(data.investmentDate);
  const userTier = data.userTier || 'Accredited Investor';
  const tierColor = userTier === 'Executive' ? '#8b5cf6' : '#10b981';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Investment Confirmation: ${escapeHtml(data.assetName)}</title>
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
    }
    .logo-text {
      font-size: 32px;
      font-weight: bold;
      letter-spacing: -0.5px;
    }
    .logo-text span { color: #00ff88; }
    .tagline { color: #94a3b8; font-size: 13px; margin-top: 8px; letter-spacing: 1px; }
    .success-badge { 
      background: rgba(0, 255, 136, 0.1); 
      color: #00ff88; 
      padding: 8px 20px; 
      border-radius: 50px; 
      display: inline-block; 
      font-size: 14px; 
      font-weight: 600; 
      margin: 20px 0; 
      border: 1px solid rgba(0, 255, 136, 0.3);
    }
    .content { padding: 40px 30px; background: #0f2a3f; }
    .greeting { font-size: 24px; font-weight: 600; margin-bottom: 16px; color: white; }
    .receipt-card { 
      background: #072532; 
      border-radius: 16px; 
      padding: 25px; 
      margin: 25px 0; 
      border: 1px solid rgba(0, 255, 136, 0.15);
    }
    .receipt-row { 
      display: flex; 
      justify-content: space-between; 
      padding: 12px 0; 
      border-bottom: 1px solid #1e2f3f; 
    }
    .receipt-row:last-child { border-bottom: none; }
    .receipt-label { color: #94a3b8; font-size: 14px; }
    .receipt-value { color: white; font-weight: 600; font-size: 15px; }
    .total-row { 
      margin-top: 8px; 
      padding-top: 16px; 
      border-top: 2px solid #00ff88; 
    }
    .total-row .receipt-value { color: #00ff88; font-size: 22px; font-weight: 700; }
    .tier-badge {
      display: inline-block;
      background: ${tierColor}20;
      color: ${tierColor};
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
    .next-steps {
      background: #0a1f2f;
      padding: 20px;
      border-radius: 12px;
      margin: 25px 0;
      border-left: 4px solid #00ff88;
    }
    .next-steps h4 { color: #00ff88; margin-bottom: 12px; font-size: 16px; }
    .next-steps ul { margin: 0; padding-left: 20px; color: #94a3b8; }
    .next-steps li { margin: 8px 0; }
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
    .tx-hash { 
      font-family: 'Courier New', monospace; 
      background: #0a1f2f; 
      padding: 10px; 
      border-radius: 8px; 
      font-size: 11px; 
      color: #94a3b8; 
      word-break: break-all;
      border: 1px solid #1e2f3f;
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
    @media (max-width: 600px) {
      body { padding: 10px; }
      .header { padding: 30px 20px; }
      .content { padding: 30px 20px; }
      .greeting { font-size: 20px; }
      .button { display: block; text-align: center; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-container">
        <div class="logo-img" style="display: flex; align-items: center; justify-content: center; font-size: 40px;">
          ${assetIcon}
        </div>
      </div>
      <div class="logo-text">TIL<span>Group</span></div>
      <div class="tagline">Port Investment • Tokenized • Compliant</div>
    </div>
    
    <div class="content">
      <div class="success-badge">✅ Investment Confirmed</div>
      
      <div class="greeting">Thank You, ${escapeHtml(data.firstName)}!</div>
      <p style="color: #94a3b8;">Your investment in <strong style="color: white;">${escapeHtml(data.assetName)}</strong> has been successfully processed and recorded on the blockchain.</p>

      <div class="receipt-card">
        <h3 style="color: #00ff88; margin-top: 0; margin-bottom: 20px;">Investment Receipt</h3>
        
        <div class="receipt-row">
          <span class="receipt-label">Asset</span>
          <span class="receipt-value">${escapeHtml(data.assetName)}</span>
        </div>
        
        <div class="receipt-row">
          <span class="receipt-label">Quantity</span>
          <span class="receipt-value">${data.quantity} unit${data.quantity > 1 ? 's' : ''}</span>
        </div>
        
        <div class="receipt-row">
          <span class="receipt-label">Price Per Unit</span>
          <span class="receipt-value">${formattedPrice}</span>
        </div>
        
        <div class="receipt-row">
          <span class="receipt-label">Payment Token</span>
          <span class="receipt-value">${escapeHtml(data.paymentToken)}</span>
        </div>
        
        <div class="receipt-row">
          <span class="receipt-label">Investment Date</span>
          <span class="receipt-value">${formattedDate}</span>
        </div>
        
        <div class="receipt-row">
          <span class="receipt-label">Investor Tier</span>
          <span class="receipt-value"><span class="tier-badge">${escapeHtml(userTier)}</span></span>
        </div>
        
        <div class="receipt-row total-row">
          <span class="receipt-label">Total Investment</span>
          <span class="receipt-value">${formattedTotal}</span>
        </div>
        
        <div style="margin-top: 20px;">
          <div class="receipt-label" style="margin-bottom: 8px;">Transaction ID</div>
          <div class="tx-hash">${escapeHtml(data.transactionId)}</div>
        </div>
      </div>

      <div class="next-steps">
        <h4>📋 Next Steps</h4>
        <ul>
          <li>Your investment will appear in your dashboard within minutes</li>
          <li>Legal documents and digital ownership certificates will be sent within 24 hours</li>
          <li>You'll receive quarterly performance updates and financial reports</li>
          <li>Executive briefings are available upon request</li>
        </ul>
      </div>

      <div style="text-align: center;">
        <a href="${PLATFORM_URL}/platform" class="button">View Your Portfolio →</a>
      </div>

      <div style="background: linear-gradient(135deg, #0a1f2f 0%, #071526 100%); padding: 20px; border-radius: 12px; margin: 25px 0; text-align: center;">
        <p style="color: #94a3b8; font-size: 13px; margin: 0;">
          🌏 This investment contributes to the <strong>$5.5B Can Gio International Transshipment Port</strong> development in Ho Chi Minh City, Vietnam — the deepest port in Southern Vietnam.
        </p>
      </div>
      
      <p style="color: #94a3b8; margin-top: 30px;">
        Best regards,<br>
        <strong style="color: #00ff88;">The TILGroup Digital Securities Team</strong>
      </p>
      
      <div style="margin-top: 30px; font-size: 11px; color: #475569; border-top: 1px solid #1e2f3f; padding-top: 20px;">
        <p>This is an official investment confirmation receipt. Please retain for your records. The Can Gio Port project is developed by TILGroup (Terminal Investment Limited), a subsidiary of Mediterranean Shipping Company (MSC), the world's largest container shipping line.</p>
      </div>
    </div>
    
    <div class="footer">
      <p>TILGroup Digital Securities • Ho Chi Minh City, Vietnam</p>
      <p>📧 <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a> • 🌐 <a href="${PLATFORM_URL}">${PLATFORM_URL.replace('https://', '')}</a></p>
      <p style="margin-top: 10px;">© ${new Date().getFullYear()} TILGroup. All rights reserved.</p>
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
  metadata?: Record<string, any>,
  emailId?: string,
  errorMessage?: string
): Promise<void> {
  try {
    const logData: DeliveryLog = {
      user_id: userId,
      document_type: 'investment_receipt',
      status,
      recipient_email: recipientEmail,
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
      console.error('[InvestmentReceipt] Failed to log delivery:', error);
    } else {
      console.log(`[InvestmentReceipt] Logged delivery status: ${status}`);
    }
  } catch (error) {
    console.error('[InvestmentReceipt] Exception logging delivery:', error);
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
      console.log(`[InvestmentReceipt] Email sent successfully (attempt ${attempt})`);
      return { success: true, data: result };
    } catch (error: any) {
      console.error(`[InvestmentReceipt] Attempt ${attempt} failed:`, error.message);
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
    const payload = await request.json() as InvestmentReceiptPayload;
    
    console.log(`[InvestmentReceipt] Processing for: ${payload.to}, Asset: ${payload.assetName}`);
    
    // Validate payload
    const validation = validatePayload(payload);
    if (!validation.isValid) {
      console.error(`[InvestmentReceipt] Validation failed: ${validation.error}`);
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }
    
    // Log pending delivery
    await logDelivery(payload.userId, payload.to, 'pending', {
      asset: payload.assetName,
      amount: payload.totalUSD,
      transaction_id: payload.transactionId,
    });
    
    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('[InvestmentReceipt] RESEND_API_KEY not configured');
      await logDelivery(payload.userId, payload.to, 'failed', undefined, undefined, 'Email service not configured');
      return NextResponse.json(
        { success: false, error: 'Email service not configured' },
        { status: 500 }
      );
    }
    
     const resend = new Resend(process.env.RESEND_API_KEY);

    // Generate email HTML
    const emailHtml = generateEmailHtml(payload);
    
    // Prepare email options
    const emailOptions = {
      from: FROM_EMAIL,
      to: [payload.to],
      subject: `🎉 Investment Confirmed: ${payload.assetName} - TILGroup Digital Securities`,
      html: emailHtml,
      replyTo: SUPPORT_EMAIL,
      headers: {
        'X-Investment-ID': payload.transactionId,
        'X-User-ID': payload.userId,
        'X-Priority': 'high',
      },
    };
    
    // Send email with retry
    const result = await sendEmailWithRetry(resend, emailOptions);
    
    const duration = Date.now() - startTime;
    
    if (!result.success) {
      console.error(`[InvestmentReceipt] Email failed after ${duration}ms:`, result.error);
      await logDelivery(payload.userId, payload.to, 'failed', undefined, undefined, result.error);
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to send investment receipt' },
        { status: 500 }
      );
    }
    
    // Log successful delivery
    await logDelivery(
      payload.userId,
      payload.to,
      'delivered',
      {
        asset: payload.assetName,
        amount: payload.totalUSD,
        transaction_id: payload.transactionId,
        duration_ms: duration,
      },
      result.data?.id
    );
    
    console.log(`[InvestmentReceipt] Successfully sent to ${payload.to} (${duration}ms)`);
    
    return NextResponse.json({
      success: true,
      message: 'Investment receipt sent successfully',
      emailId: result.data?.id,
    });
    
  } catch (error: any) {
    console.error('[InvestmentReceipt] Fatal error:', error);
    
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
        error: process.env.NODE_ENV === 'development' ? error.message : 'Failed to send investment receipt'
      },
      { status: 500 }
    );
  }
}

// ============================================
// OPTIONAL: GET endpoint for receipt status
// ============================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const transactionId = searchParams.get('transactionId');
  const userId = searchParams.get('userId');
  
  if (!transactionId && !userId) {
    return NextResponse.json(
      { error: 'Transaction ID or User ID required' },
      { status: 400 }
    );
  }
  
  try {
    let query = supabase.from('document_delivery_logs').select('*').eq('document_type', 'investment_receipt');
    
    if (transactionId) {
      query = query.filter('metadata->>transaction_id', 'eq', transactionId);
    } else if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query.order('sent_at', { ascending: false });
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      data: data?.[0] || null,
    });
    
  } catch (error: any) {
    console.error('[InvestmentReceipt] Status check error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
