// app/api/email/executive-approval/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// ============================================
// TYPES & INTERFACES
// ============================================

interface ExecutiveApprovalPayload {
  email: string;
  name?: string;
  userId: string;
  status?: 'qualified' | 'priority' | 'qualified';
  approvedAt?: string;
}

interface EmailResponse {
  success: boolean;
  data?: any;
  error?: string;
  messageId?: string;
}

// ============================================
// CONSTANTS
// ============================================

const SUPPORT_EMAIL = 'executive-relations@tilgroup.live';
const PLATFORM_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Email template versions
const EMAIL_TEMPLATES = {
  approved: (data: ExecutiveApprovalPayload) => ({
    subject: '✅ Executive Presale Protocol Approved',
    preview: 'Your executive presale protocol has been approved',
  }),
  priority: (data: ExecutiveApprovalPayload) => ({
    subject: '⭐ Priority Access Granted - Executive Presale',
    preview: 'You have been granted priority access to the presale',
  }),
  qualified: (data: ExecutiveApprovalPayload) => ({
    subject: '📋 Executive Presale Protocol - Qualified Status',
    preview: 'Your executive protocol has been reviewed and qualified',
  }),
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Validate request payload
 */
function validatePayload(payload: Partial<ExecutiveApprovalPayload>): { isValid: boolean; error?: string } {
  if (!payload.email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  if (!payload.userId) {
    return { isValid: false, error: 'User ID is required' };
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(payload.email)) {
    return { isValid: false, error: 'Invalid email format' };
  }
  
  return { isValid: true };
}

/**
 * Get status display name
 */
function getStatusDisplayName(status: string): string {
  const statusMap: Record<string, string> = {
    approved: 'Approved',
    priority: 'Priority Access',
    qualified: 'Qualified',
  };
  return statusMap[status] || 'Approved';
}

/**
 * Get status color
 */
function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    approved: '#10b981',
    priority: '#8b5cf6',
    qualified: '#06b6d4',
  };
  return colorMap[status] || '#10b981';
}

/**
 * Generate HTML email content
 */
function generateEmailHtml(data: ExecutiveApprovalPayload): string {
  const status = data.status || 'approved';
  const statusName = getStatusDisplayName(status);
  const statusColor = getStatusColor(status);
  const approvedDate = data.approvedAt ? new Date(data.approvedAt).toLocaleDateString() : new Date().toLocaleDateString();
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Executive Presale Protocol ${statusName}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
          line-height: 1.6; 
          color: #1f2937;
          background: #f0f4f8;
          margin: 0;
          padding: 20px;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
        }
        .header { 
          background: linear-gradient(135deg, #0a1f2f 0%, #071526 100%);
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 { 
          color: #06b6d4; 
          margin: 0 0 8px 0;
          font-size: 28px;
          letter-spacing: -0.5px;
        }
        .header p { 
          color: #94a3b8; 
          margin: 0;
          font-size: 14px;
        }
        .status-badge {
          display: inline-block;
          background: ${statusColor};
          color: white;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          margin-top: 16px;
        }
        .content { 
          padding: 40px 30px;
          background: white;
        }
        .greeting {
          font-size: 18px;
          margin-bottom: 20px;
          color: #1f2937;
        }
        .greeting strong {
          color: #0a1f2f;
        }
        .message {
          margin-bottom: 24px;
          color: #4b5563;
        }
        .benefits {
          background: #f0fdf4;
          border-left: 4px solid #10b981;
          padding: 20px;
          margin: 24px 0;
          border-radius: 8px;
        }
        .benefits h3 {
          color: #065f46;
          margin-bottom: 12px;
          font-size: 16px;
        }
        .benefits ul {
          margin: 0;
          padding-left: 20px;
        }
        .benefits li {
          margin: 8px 0;
          color: #065f46;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
          color: white;
          padding: 14px 32px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          margin: 24px 0;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .contact-box {
          background: #f3f4f6;
          padding: 20px;
          border-radius: 8px;
          margin: 24px 0;
          text-align: center;
        }
        .contact-box p {
          margin: 4px 0;
          font-size: 14px;
        }
        .footer {
          background: #f9fafb;
          padding: 24px 30px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
          font-size: 12px;
          color: #6b7280;
        }
        .footer a {
          color: #06b6d4;
          text-decoration: none;
        }
        .divider {
          height: 1px;
          background: #e5e7eb;
          margin: 20px 0;
        }
        @media (max-width: 600px) {
          body { padding: 10px; }
          .header { padding: 30px 20px; }
          .content { padding: 30px 20px; }
          .button { display: block; text-align: center; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Can Gio Port Investment</h1>
          <p>$5.5B Infrastructure Opportunity • Ho Chi Minh City, Vietnam</p>
          <div class="status-badge">${statusName}</div>
        </div>
        
        <div class="content">
          <div class="greeting">
            Dear <strong>${escapeHtml(data.name || 'Executive Partner')}</strong>,
          </div>
          
          <div class="message">
            <p>We are pleased to inform you that your <strong>Executive Presale Protocol</strong> has been reviewed and <strong style="color: ${statusColor};">${statusName.toUpperCase()}</strong>.</p>
            <p style="margin-top: 12px;">You now have immediate access to the Can Gio Port Investment Platform with enhanced privileges.</p>
          </div>
          
          <div class="benefits">
            <h3>🎯 Your Executive Access Includes:</h3>
            <ul>
              <li>📄 Full investment prospectus and offering memorandum</li>
              <li>🔧 Technical due diligence package</li>
              <li>🏗️ Port infrastructure blueprints and engineering specifications</li>
              <li>📊 Financial models and revenue projections</li>
              <li>🤝 Direct channel to the executive deal team</li>
              <li>⭐ Priority allocation in the presale</li>
            </ul>
          </div>
          
          <div style="text-align: center;">
            <a href="${PLATFORM_URL}/platform" class="button">
              Access Investment Portal →
            </a>
          </div>
          
          <div class="contact-box">
            <p><strong>📞 Executive Briefing Scheduled</strong></p>
            <p>Our executive team will contact you within <strong>24 hours</strong> to schedule a private briefing.</p>
            <p style="margin-top: 8px; font-size: 12px;">
              For immediate assistance: <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>
            </p>
          </div>
          
          <div class="divider"></div>
          
          <div style="font-size: 13px; color: #6b7280;">
            <p><strong>📅 Approval Date:</strong> ${approvedDate}</p>
            <p><strong>🆔 Reference ID:</strong> ${data.userId.slice(0, 8)}...${data.userId.slice(-4)}</p>
          </div>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} TILGroup Digital Securities. All rights reserved.</p>
          <p>This is a confidential communication. If you received this email in error, please contact us immediately.</p>
          <p style="margin-top: 8px;">
            <a href="${PLATFORM_URL}/legal/terms">Terms</a> • 
            <a href="${PLATFORM_URL}/legal/privacy">Privacy</a> • 
            <a href="mailto:${SUPPORT_EMAIL}">Support</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
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
 * Send email with retry logic
 */
async function sendEmailWithRetry(
  resend: Resend,
  options: Parameters<typeof resend.emails.send>[0],
  maxRetries: number = 3
): Promise<{ success: boolean; data?: any; error?: string }> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await resend.emails.send(options);
      console.log(`[Email] Sent successfully (attempt ${attempt})`);
      return { success: true, data: result };
    } catch (error: any) {
      console.error(`[Email] Attempt ${attempt} failed:`, error.message);
      if (attempt === maxRetries) {
        return { success: false, error: error.message };
      }
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
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

    const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || `TILGroup Digital Securities <noreply@${process.env.RESEND_DOMAIN}>`;

    // Parse request body
    const payload = await request.json() as ExecutiveApprovalPayload;
    
    console.log(`[ExecutiveApproval] Processing request for: ${payload.email}`);
    
    // Validate payload
    const validation = validatePayload(payload);
    if (!validation.isValid) {
      console.error(`[ExecutiveApproval] Validation failed: ${validation.error}`);
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }
    
    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('[ExecutiveApproval] RESEND_API_KEY not configured');
      return NextResponse.json(
        { success: false, error: 'Email service not configured' },
        { status: 500 }
      );
    }
    
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Prepare email options
    const emailHtml = generateEmailHtml(payload);
    const template = EMAIL_TEMPLATES[payload.status || 'approved'](payload);
    
    const emailOptions = {
      from: FROM_EMAIL,
      to: payload.email,
      subject: template.subject,
      html: emailHtml,
      replyTo: SUPPORT_EMAIL,
      headers: {
        'X-Entity-Ref-ID': `executive-approval-${payload.userId}-${Date.now()}`,
        'X-Priority': 'normal',
      },
    };
    
    // Send email with retry
    const result = await sendEmailWithRetry(resend, emailOptions);
    
    const duration = Date.now() - startTime;
    
    if (!result.success) {
      console.error(`[ExecutiveApproval] Email failed after ${duration}ms:`, result.error);
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to send email' },
        { status: 500 }
      );
    }
    
    console.log(`[ExecutiveApproval] Email sent successfully to ${payload.email} (${duration}ms)`);
    
    return NextResponse.json({
      success: true,
      data: result.data,
      messageId: result.data?.id,
    });
    
  } catch (error: any) {
    console.error('[ExecutiveApproval] Fatal error:', error);
    
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
        error: process.env.NODE_ENV === 'development' ? error.message : 'Failed to send approval email'
      },
      { status: 500 }
    );
  }
}

// ============================================
// OPTIONAL: GET endpoint for email status
// ============================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const messageId = searchParams.get('messageId');
  
  if (!messageId) {
    return NextResponse.json(
      { error: 'Message ID required' },
      { status: 400 }
    );
  }
  
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }
    
    // Note: Resend doesn't have a native get email status endpoint
    // This is a placeholder for potential future implementation
    return NextResponse.json({
      messageId,
      status: 'sent',
      timestamp: new Date().toISOString(),
    });
    
  } catch (error: any) {
    console.error('[ExecutiveApproval] Status check error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
