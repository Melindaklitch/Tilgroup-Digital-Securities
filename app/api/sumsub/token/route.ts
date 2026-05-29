// app/api/sumsub/token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createApplicant, getAccessToken } from '@/lib/sumsub';

// ============================================
// TYPES & INTERFACES
// ============================================

interface SumSubTokenRequest {
  userId: string;
  email?: string;
  levelName?: string;
}

interface SumSubTokenResponse {
  token: string;
  applicantId?: string;
  expiresAt?: string;
}

interface ErrorResponse {
  error: string;
  code?: string;
  details?: string;
}

// ============================================
// CONSTANTS
// ============================================

const DEFAULT_LEVEL_NAME = 'basic-kyc-level';
const TOKEN_EXPIRY_SECONDS = 600; // 10 minutes

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Validate request payload
 */
function validatePayload(payload: Partial<SumSubTokenRequest>): { isValid: boolean; error?: string } {
  if (!payload.userId) {
    return { isValid: false, error: 'User ID is required' };
  }
  
  if (typeof payload.userId !== 'string') {
    return { isValid: false, error: 'User ID must be a string' };
  }
  
  if (payload.userId.trim() === '') {
    return { isValid: false, error: 'User ID cannot be empty' };
  }
  
  return { isValid: true };
}

/**
 * Log SumSub API activity
 */
async function logSumSubActivity(
  userId: string,
  action: 'create_applicant' | 'get_token' | 'error',
  success: boolean,
  details?: Record<string, any>
): Promise<void> {
  // Only log in development or if explicitly configured
  if (process.env.NODE_ENV === 'development') {
    console.log(`[SumSub API] ${action}: ${success ? 'SUCCESS' : 'FAILED'}`, {
      userId,
      ...details,
      timestamp: new Date().toISOString(),
    });
  }
  
  // In production, you might want to store in a database
  // await supabase.from('sumsub_logs').insert({ user_id: userId, action, success, details });
}

/**
 * Format error response
 */
function formatErrorResponse(error: unknown): ErrorResponse {
  if (error instanceof Error) {
    // Check for specific SumSub error codes
    if (error.message.includes('already exists')) {
      return {
        error: 'Applicant already exists',
        code: 'APPLICANT_EXISTS',
        details: error.message,
      };
    }
    
    if (error.message.includes('rate limit')) {
      return {
        error: 'Rate limit exceeded. Please try again later.',
        code: 'RATE_LIMIT',
        details: error.message,
      };
    }
    
    if (error.message.includes('invalid')) {
      return {
        error: 'Invalid request parameters',
        code: 'INVALID_REQUEST',
        details: error.message,
      };
    }
    
    return {
      error: 'Failed to process KYC verification',
      code: 'INTERNAL_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    };
  }
  
  return {
    error: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
  };
}

// ============================================
// MAIN API ROUTE HANDLER
// ============================================

export async function POST(req: NextRequest): Promise<NextResponse<SumSubTokenResponse | ErrorResponse>> {
  const startTime = Date.now();
  let userId: string | undefined;
  
  try {
    // Parse request body
    const body = await req.json() as SumSubTokenRequest;
    userId = body.userId;
    const email = body.email;
    const levelName = body.levelName || DEFAULT_LEVEL_NAME;
    
    console.log(`[SumSub API] Processing request for user: ${userId}`);
    
    // Validate payload
    const validation = validatePayload(body);
    if (!validation.isValid) {
      console.error(`[SumSub API] Validation failed: ${validation.error}`);
      return NextResponse.json(
        { error: validation.error || 'Invalid request' },
        { status: 400 }
      );
    }
    
    // Check for required environment variables
    if (!process.env.SUMSUB_API_TOKEN || !process.env.SUMSUB_SECRET_KEY) {
      console.error('[SumSub API] Missing SumSub configuration');
      await logSumSubActivity(userId, 'error', false, { error: 'Missing configuration' });
      return NextResponse.json(
        { error: 'KYC service not configured' },
        { status: 500 }
      );
    }
    
    // Step 1: Create applicant in SumSub
    console.log(`[SumSub API] Creating applicant for user: ${userId}`);
    let applicantId: string;
    
    try {
      applicantId = await createApplicant(userId, email);
      await logSumSubActivity(userId, 'create_applicant', true, { applicantId });
      console.log(`[SumSub API] Applicant created: ${applicantId}`);
    } catch (createError: any) {
      console.error(`[SumSub API] Failed to create applicant:`, createError.message);
      await logSumSubActivity(userId, 'create_applicant', false, { error: createError.message });
      
      // Check if applicant already exists - we might still be able to get a token
      if (createError.message?.includes('already exists')) {
        // Try to get existing applicant ID or continue with error
        console.log(`[SumSub API] Applicant may already exist, attempting to get token anyway`);
        // You might want to fetch existing applicant ID here
        applicantId = userId; // Fallback - in production, fetch from DB
      } else {
        throw createError;
      }
    }
    
    // Step 2: Generate access token
    console.log(`[SumSub API] Generating access token for applicant: ${applicantId}`);
    const token = await getAccessToken(applicantId, levelName);
    
    await logSumSubActivity(userId, 'get_token', true, { applicantId });
    
    const duration = Date.now() - startTime;
    console.log(`[SumSub API] Token generated successfully in ${duration}ms`);
    
    // Calculate token expiry time
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_SECONDS * 1000).toISOString();
    
    // Return token with metadata
    return NextResponse.json({
      token,
      applicantId,
      expiresAt,
    });
    
  } catch (error: any) {
    console.error('[SumSub API] Fatal error:', error);
    
    if (userId) {
      await logSumSubActivity(userId, 'error', false, { error: error.message });
    }
    
    const errorResponse = formatErrorResponse(error);
    const statusCode = errorResponse.code === 'RATE_LIMIT' ? 429 :
                      errorResponse.code === 'INVALID_REQUEST' ? 400 : 500;
    
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

// ============================================
// OPTIONAL: GET endpoint for token status
// ============================================

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const applicantId = searchParams.get('applicantId');
  
  if (!applicantId) {
    return NextResponse.json(
      { error: 'Applicant ID is required' },
      { status: 400 }
    );
  }
  
  try {
    // You could check token status or applicant status here
    // This would require additional SumSub API methods
    
    return NextResponse.json({
      applicantId,
      status: 'active',
      message: 'Token status check endpoint - implement as needed',
    });
    
  } catch (error: any) {
    console.error('[SumSub API GET] Error:', error);
    return NextResponse.json(
      { error: error.message },
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
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// ============================================
// CONFIGURATION
// ============================================

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // SumSub SDK may need Node.js runtime
