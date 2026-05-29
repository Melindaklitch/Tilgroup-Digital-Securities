import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/components/Lib/supabaseClient';
import { Resend } from 'resend';

// ============================================
// TYPES & INTERFACES
// ============================================

interface DocumentRequestPayload {
  userId: string;
  userEmail: string;
  userName: string;
  documentType: string;
  documentTitle: string;
  requestedLanguage: string;
  reason?: string;
  requestedAt: string;
}

interface DocumentRequestResponse {
  success: boolean;
  message: string;
  requestId?: string;
  error?: string;
}

interface AdminUser {
  users: {
    email: string;
  };
}

// ============================================
// CONSTANTS
// ============================================

const FROM_EMAIL = 'TILGroup Documents <documents@tilgroupport.com>';
const SUPPORT_EMAIL = 'investor-relations@tilgroupport.com';

// Email templates
const emailTemplates = {
  adminNotification: (data: DocumentRequestPayload & { requestId: string }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0f2a3f 0%, #0a1f2f 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px; }
        .details { background: white; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #10b981; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .label { color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
        .value { font-size: 16px; font-weight: 600; margin-bottom: 16px; color: #1f2937; }
        .button { background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; transition: transform 0.2s; }
        .button:hover { transform: translateY(-2px); }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px; }
        @media (max-width: 600px) {
          .container { padding: 10px; }
          .content { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">📄 Document Request Notification</h2>
        </div>
        <div class="content">
          <p>A user has requested access to a document that is not currently available in their preferred language.</p>
          
          <div class="details">
            <h3 style="margin-top: 0; color: #0f2a3f;">Request Details</h3>
            
            <div class="label">User</div>
            <div class="value">${escapeHtml(data.userName)} (${escapeHtml(data.userEmail)})</div>
            
            <div class="label">Document</div>
            <div class="value">${escapeHtml(data.documentTitle)}</div>
            
            <div class="label">Document Type</div>
            <div class="value">${escapeHtml(data.documentType)}</div>
            
            <div class="label">Requested Language</div>
            <div class="value">${escapeHtml(data.requestedLanguage)}</div>
            
            ${data.reason ? `
              <div class="label">Reason</div>
              <div class="value">${escapeHtml(data.reason)}</div>
            ` : ''}
            
            <div class="label">Requested At</div>
            <div class="value">${new Date(data.requestedAt).toLocaleString()}</div>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/documents/requests/${data.requestId}" class="button">
              View Request Details
            </a>
          </div>
        </div>
        <div class="footer">
          <p>TILGroup Port Investment Platform</p>
        </div>
      </div>
    </body>
    </html>
  `,

  userConfirmation: (data: DocumentRequestPayload) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0f2a3f 0%, #0a1f2f 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px; }
        .info-box { background: #e8f4f8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px; }
        @media (max-width: 600px) {
          .container { padding: 10px; }
          .content { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">✅ Document Request Received</h2>
        </div>
        <div class="content">
          <p>Dear ${escapeHtml(data.userName)},</p>
          
          <p>Thank you for your document request. We have received your request for the following document:</p>
          
          <div class="info-box">
            <p style="margin: 0 0 8px 0;"><strong>📄 Document:</strong> ${escapeHtml(data.documentTitle)}</p>
            <p style="margin: 0;"><strong>🌐 Language:</strong> ${escapeHtml(data.requestedLanguage)}</p>
          </div>
          
          <p>Our team has been notified and will work on making this document available in your preferred language. You will receive another email when it becomes accessible.</p>
          
          <p>If you have any questions, please contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color: #10b981;">${SUPPORT_EMAIL}</a></p>
          
          <p style="margin-top: 30px;">
            Best regards,<br>
            <strong>The TILGroup Team</strong>
          </p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} TILGroup Port Investment. All rights reserved.</p>
          <p style="font-size: 11px;">This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Escape HTML special characters to prevent XSS
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
 * Validate request payload
 */
function validatePayload(payload: Partial<DocumentRequestPayload>): { isValid: boolean; error?: string } {
  if (!payload.userId) return { isValid: false, error: 'User ID is required' };
  if (!payload.userEmail) return { isValid: false, error: 'User email is required' };
  if (!payload.userName) return { isValid: false, error: 'User name is required' };
  if (!payload.documentType) return { isValid: false, error: 'Document type is required' };
  if (!payload.documentTitle) return { isValid: false, error: 'Document title is required' };
  if (!payload.requestedLanguage) return { isValid: false, error: 'Requested language is required' };
  if (!payload.requestedAt) return { isValid: false, error: 'Request timestamp is required' };
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(payload.userEmail)) {
    return { isValid: false, error: 'Invalid email format' };
  }
  
  return { isValid: true };
}

/**
 * Get admin emails from database
 */
async function getAdminEmails(): Promise<string[]> {
  try {
    const { data: admins, error } = await supabase
      .from('user_roles')
      .select('users(email)')
      .eq('role', 'admin');
    
    if (error) {
      console.error('[Admin Emails] Fetch error:', error);
      return [];
    }
    
    const emails = admins
      ?.map((a: AdminUser) => a.users?.email)
      .filter(Boolean) || [];
    
    console.log(`[Admin Emails] Found ${emails.length} admin(s)`);
    return emails;
    
  } catch (error) {
    console.error('[Admin Emails] Exception:', error);
    return [];
  }
}

/**
 * Send email with retry logic
 */
async function sendEmailWithRetry(
  resend: Resend,
  options: Parameters<typeof resend.emails.send>[0],
  maxRetries: number = 3
): Promise<boolean> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await resend.emails.send(options);
      console.log(`[Email] Sent successfully (attempt ${attempt})`);
      return true;
    } catch (error) {
      console.error(`[Email] Attempt ${attempt} failed:`, error);
      if (attempt === maxRetries) {
        return false;
      }
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
    }
  }
  return false;
}

// ============================================
// API ROUTE HANDLER
// ============================================

export async function POST(request: NextRequest): Promise<NextResponse<DocumentRequestResponse>> {
  try {
    // Parse request body
    const payload = await request.json() as DocumentRequestPayload;
    
    console.log('[Document Request] Received request for:', payload.documentTitle);
    
    // Validate payload
    const validation = validatePayload(payload);
    if (!validation.isValid) {
      console.error('[Document Request] Validation failed:', validation.error);
      return NextResponse.json(
        { success: false, message: 'Invalid request', error: validation.error },
        { status: 400 }
      );
    }
    
    // Store request in database
    const { data: requestData, error: dbError } = await supabase
      .from('document_requests')
      .insert({
        user_id: payload.userId,
        document_type: payload.documentType,
        document_title: payload.documentTitle,
        requested_language: payload.requestedLanguage,
        reason: payload.reason || null,
        requested_at: payload.requestedAt,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (dbError) {
      console.error('[Document Request] Database error:', dbError);
      return NextResponse.json(
        { success: false, message: 'Failed to save request', error: dbError.message },
        { status: 500 }
      );
    }
    
    console.log('[Document Request] Saved request with ID:', requestData.id);
    
    // Initialize Resend
    if (!process.env.RESEND_API_KEY) {
      console.warn('[Document Request] RESEND_API_KEY not configured');
      return NextResponse.json({
        success: true,
        message: 'Document request submitted, but email notifications are disabled',
        requestId: requestData.id,
      });
    }
    
    // Get admin emails
    const adminEmails = await getAdminEmails();
    
    // Send notifications in parallel
    const emailPromises = [];
    
    // Send admin notification
    if (adminEmails.length > 0) {
      emailPromises.push(
        sendEmailWithRetry(resend, {
          from: FROM_EMAIL,
          to: adminEmails,
          subject: `📄 Document Request: ${payload.documentTitle}`,
          html: emailTemplates.adminNotification({ ...payload, requestId: requestData.id }),
        })
      );
    }
    
    // Send user confirmation
    emailPromises.push(
      sendEmailWithRetry(resend, {
        from: FROM_EMAIL,
        to: [payload.userEmail],
        subject: 'Document Request Received',
        html: emailTemplates.userConfirmation(payload),
      })
    );
    
    // Wait for all emails to send (don't fail if emails fail)
    const emailResults = await Promise.allSettled(emailPromises);
    const successfulEmails = emailResults.filter(r => r.status === 'fulfilled' && r.value).length;
    const failedEmails = emailResults.length - successfulEmails;
    
    if (failedEmails > 0) {
      console.warn(`[Document Request] ${failedEmails} email(s) failed to send`);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Document request submitted successfully',
      requestId: requestData.id,
    });
    
  } catch (error: any) {
    console.error('[Document Request] Fatal error:', error);
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON payload', error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to process document request',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// ============================================
// OPTIONAL: GET endpoint to check request status
// ============================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const requestId = searchParams.get('id');
  const userId = searchParams.get('userId');
  
  if (!requestId && !userId) {
    return NextResponse.json(
      { success: false, message: 'Request ID or User ID required' },
      { status: 400 }
    );
  }
  
  try {
    let query = supabase.from('document_requests').select('*');
    
    if (requestId) {
      query = query.eq('id', requestId);
    } else if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query.order('requested_at', { ascending: false });
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      data: requestId ? data?.[0] : data,
    });
    
  } catch (error: any) {
    console.error('[Document Request GET] Error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
