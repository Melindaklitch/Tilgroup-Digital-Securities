// app/api/sumsub/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from "@/components/Lib/supabaseClient";
import crypto from 'crypto';

// ============================================
// TYPES & INTERFACES
// ============================================

interface SumSubWebhookPayload {
  reviewStatus?: 'completed' | 'rejected' | 'pending' | 'onHold';
  externalUserId?: string;
  applicantId?: string;
  inspectionId?: string;
  levelName?: string;
  createdDate?: string;
  reviewResult?: {
    reviewAnswer?: 'GREEN' | 'RED' | 'UNKNOWN';
    moderationComment?: string;
    clientComment?: string;
    rejectLabels?: string[];
  };
  videoIdentReviewStatus?: string;
  applicantType?: string;
  email?: string;
  phone?: string;
  fixedInfo?: {
    firstName?: string;
    lastName?: string;
    country?: string;
    dob?: string;
  };
  [key: string]: any;
}

interface WebhookResponse {
  received: boolean;
  processed?: boolean;
  message?: string;
  error?: string;
}

interface KYCUpdateData {
  kyc_status: 'verified' | 'rejected' | 'pending';
  provider: string;
  verified_at?: string;
  reviewed_at?: string;
  review_notes?: string;
  reject_reason?: string;
  applicant_id?: string;
  inspection_id?: string;
}

// ============================================
// CONSTANTS
// ============================================

const WEBHOOK_SECRET = process.env.SUMSUB_WEBHOOK_SECRET_KEY;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Verify webhook signature (security)
 */
function verifySignature(payload: string, signature: string | null): boolean {
  if (!WEBHOOK_SECRET) {
    console.warn('[SumSub Webhook] WEBHOOK_SECRET not configured, skipping signature verification');
    return true; // Allow in development, but warn
  }
  
  if (!signature) {
    console.error('[SumSub Webhook] Missing signature header');
    return false;
  }
  
  try {
    const expectedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('[SumSub Webhook] Signature verification error:', error);
    return false;
  }
}

/**
 * Validate webhook payload
 */
function validatePayload(payload: Partial<SumSubWebhookPayload>): { isValid: boolean; error?: string } {
  if (!payload.externalUserId && !payload.applicantId) {
    return { isValid: false, error: 'Missing user identifier (externalUserId or applicantId)' };
  }
  
  if (!payload.reviewStatus) {
    return { isValid: false, error: 'Missing reviewStatus' };
  }
  
  const validStatuses = ['completed', 'rejected', 'pending', 'onHold'];
  if (!validStatuses.includes(payload.reviewStatus)) {
    return { isValid: false, error: `Invalid reviewStatus: ${payload.reviewStatus}` };
  }
  
  return { isValid: true };
}

/**
 * Map SumSub review status to KYC status
 */
function mapKYCStatus(reviewStatus: string): KYCUpdateData['kyc_status'] {
  switch (reviewStatus) {
    case 'completed':
      return 'verified';
    case 'rejected':
      return 'rejected';
    case 'pending':
    case 'onHold':
      return 'pending';
    default:
      return 'pending';
  }
}

/**
 * Get rejection reason from payload
 */
function getRejectionReason(payload: SumSubWebhookPayload): string | undefined {
  if (payload.reviewResult?.rejectLabels && payload.reviewResult.rejectLabels.length > 0) {
    return payload.reviewResult.rejectLabels.join(', ');
  }
  
  if (payload.reviewResult?.moderationComment) {
    return payload.reviewResult.moderationComment;
  }
  
  if (payload.reviewResult?.clientComment) {
    return payload.reviewResult.clientComment;
  }
  
  return undefined;
}

/**
 * Update KYC status in database with retry
 */
async function updateKYCStatusWithRetry(
  userId: string,
  updateData: KYCUpdateData,
  retries: number = MAX_RETRIES
): Promise<{ success: boolean; error?: string }> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const { error } = await supabase
        .from('user_kyc_status')
        .upsert(
          {
            user_id: userId,
            ...updateData,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );
      
      if (error) {
        console.error(`[SumSub Webhook] DB update attempt ${attempt} failed:`, error);
        if (attempt === retries) {
          return { success: false, error: error.message };
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * attempt));
      } else {
        console.log(`[SumSub Webhook] KYC status updated for user ${userId}: ${updateData.kyc_status}`);
        return { success: true };
      }
    } catch (error: any) {
      console.error(`[SumSub Webhook] DB exception attempt ${attempt}:`, error);
      if (attempt === retries) {
        return { success: false, error: error.message };
      }
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * attempt));
    }
  }
  
  return { success: false, error: 'Max retries exceeded' };
}

/**
 * Update executive protocol status based on KYC result
 */
async function updateExecutiveProtocolStatus(
  userId: string,
  kycStatus: KYCUpdateData['kyc_status']
): Promise<void> {
  try {
    if (kycStatus === 'verified') {
      // Update protocol status to completed if it's pending
      const { error } = await supabase
        .from('executive_presale_protocols')
        .update({
          kyc_verified: true,
          kyc_verified_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
      
      if (error) {
        console.error('[SumSub Webhook] Failed to update protocol status:', error);
      }
    }
  } catch (error) {
    console.error('[SumSub Webhook] Error updating protocol status:', error);
  }
}

/**
 * Send notification to user about KYC status
 */
async function sendKYCNotification(
  userId: string,
  email: string | undefined,
  status: KYCUpdateData['kyc_status'],
  reason?: string
): Promise<void> {
  // This would call your email API
  // Implementation depends on your notification system
  console.log(`[SumSub Webhook] Would send ${status} notification to ${email || userId}`);
  
  // Example implementation (commented):
  // await fetch('/api/email/kyc-status', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ userId, email, status, reason }),
  // });
}

/**
 * Log webhook for auditing
 */
async function logWebhook(
  userId: string,
  eventType: string,
  status: string,
  success: boolean,
  details?: Record<string, any>
): Promise<void> {
  try {
    const { error } = await supabase.from('sumsub_webhook_logs').insert({
      user_id: userId,
      event_type: eventType,
      status,
      success,
      details,
      received_at: new Date().toISOString(),
    });
    
    if (error) {
      console.error('[SumSub Webhook] Failed to log webhook:', error);
    }
  } catch (error) {
    console.error('[SumSub Webhook] Exception logging webhook:', error);
  }
}

// ============================================
// MAIN API ROUTE HANDLER
// ============================================

export async function POST(req: NextRequest): Promise<NextResponse<WebhookResponse>> {
  const startTime = Date.now();
  
  try {
    // Get raw body for signature verification
    const rawBody = await req.text();
    const payload = JSON.parse(rawBody) as SumSubWebhookPayload;
    
    // Verify signature (if configured)
    const signature = req.headers.get('x-payload-digest') || req.headers.get('x-signature');
    const isValidSignature = verifySignature(rawBody, signature);
    
    if (!isValidSignature) {
      console.error('[SumSub Webhook] Invalid signature, rejecting webhook');
      return NextResponse.json(
        { received: false, error: 'Invalid signature' },
        { status: 401 }
      );
    }
    
    console.log('[SumSub Webhook] Received webhook:', {
      reviewStatus: payload.reviewStatus,
      externalUserId: payload.externalUserId,
      applicantId: payload.applicantId,
    });
    
    // Validate payload
    const validation = validatePayload(payload);
    if (!validation.isValid) {
      console.error('[SumSub Webhook] Invalid payload:', validation.error);
      return NextResponse.json(
        { received: false, error: validation.error },
        { status: 400 }
      );
    }
    
    const userId = payload.externalUserId || payload.applicantId;
    const kycStatus = mapKYCStatus(payload.reviewStatus || 'pending');
    const rejectionReason = getRejectionReason(payload);
    
    // Prepare update data
    const updateData: KYCUpdateData = {
      kyc_status: kycStatus,
      provider: 'sumsub',
      applicant_id: payload.applicantId,
      inspection_id: payload.inspectionId,
    };
    
    if (kycStatus === 'verified') {
      updateData.verified_at = new Date().toISOString();
    }
    
    if (kycStatus === 'rejected') {
      updateData.reviewed_at = new Date().toISOString();
      updateData.reject_reason = rejectionReason;
    }
    
    if (kycStatus === 'pending') {
      updateData.reviewed_at = new Date().toISOString();
      updateData.review_notes = payload.reviewResult?.moderationComment;
    }
    
    // Update KYC status in database
    const dbResult = await updateKYCStatusWithRetry(userId!, updateData);
    
    if (!dbResult.success) {
      console.error('[SumSub Webhook] Failed to update KYC status after retries');
      // Still return 200 to SumSub to prevent retries, but log error
      await logWebhook(userId!, 'kyc_update', kycStatus, false, { error: dbResult.error });
      return NextResponse.json({
        received: true,
        processed: false,
        message: 'Webhook received but processing failed',
        error: dbResult.error,
      });
    }
    
    // Update executive protocol status
    await updateExecutiveProtocolStatus(userId!, kycStatus);
    
    // Send notification to user
    await sendKYCNotification(userId!, payload.email, kycStatus, rejectionReason);
    
    // Log successful webhook
    await logWebhook(userId!, 'kyc_update', kycStatus, true, {
      reviewStatus: payload.reviewStatus,
      processingTime: Date.now() - startTime,
    });
    
    const duration = Date.now() - startTime;
    console.log(`[SumSub Webhook] Processed successfully in ${duration}ms`);
    
    return NextResponse.json({
      received: true,
      processed: true,
      message: `KYC status updated to ${kycStatus}`,
    });
    
  } catch (error: any) {
    console.error('[SumSub Webhook] Fatal error:', error);
    
    // Parse JSON errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { received: false, error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        received: false, 
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// ============================================
// OPTIONS: CORS preflight
// ============================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-payload-digest, x-signature',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// ============================================
// CONFIGURATION
// ============================================

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
