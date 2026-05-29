// /lib/sumsub.ts

// ============================================
// TYPES & INTERFACES
// ============================================

export interface SumSubApplicantData {
  externalUserId: string;
  email?: string;
  levelName?: string;
  fixedInfo?: {
    firstName?: string;
    lastName?: string;
    country?: string;
    dob?: string;
  };
}

export interface SumSubTokenResponse {
  token: string;
  applicantId: string;
  expiresAt: string;
}

export interface SumSubErrorResponse {
  error: string;
  code?: string;
  details?: string;
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Create applicant in SumSub
 * @param userId - User ID
 * @param email - User email (optional)
 * @returns Applicant ID
 */
export async function createApplicant(
  userId: string, 
  email?: string
): Promise<string> {
  const response = await fetch('/api/sumsub/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      userId,
      email,
      levelName: 'basic-kyc-level'
    }),
  });
  
  if (!response.ok) {
    const error = await response.json() as SumSubErrorResponse;
    throw new Error(error.error || 'Failed to create applicant');
  }
  
  const data = await response.json() as SumSubTokenResponse;
  return data.applicantId;
}

/**
 * Get access token for SumSub SDK
 * @param applicantId - SumSub applicant ID
 * @param levelName - KYC level name (optional)
 * @returns Access token
 */
export async function getAccessToken(
  applicantId: string, 
  levelName: string = 'basic-kyc-level'
): Promise<string> {
  const response = await fetch('/api/sumsub/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      applicantId,
      levelName,
      externalUserId: applicantId
    }),
  });
  
  if (!response.ok) {
    const error = await response.json() as SumSubErrorResponse;
    throw new Error(error.error || 'Failed to get access token');
  }
  
  const data = await response.json() as SumSubTokenResponse;
  return data.token;
}

/**
 * Get both applicant ID and access token
 * @param userId - User ID
 * @param email - User email (optional)
 * @returns Token response
 */
export async function getSumSubToken(
  userId: string, 
  email?: string
): Promise<SumSubTokenResponse> {
  const response = await fetch('/api/sumsub/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, email }),
  });
  
  if (!response.ok) {
    const error = await response.json() as SumSubErrorResponse;
    throw new Error(error.error || 'Failed to get SumSub token');
  }
  
  return response.json() as Promise<SumSubTokenResponse>;
}

/**
 * Check applicant status
 * @param applicantId - SumSub applicant ID
 * @returns Applicant status
 */
export async function getApplicantStatus(applicantId: string): Promise<{
  status: string;
  reviewStatus: string;
}> {
  const response = await fetch(`/api/sumsub/applicant?applicantId=${applicantId}`);
  
  if (!response.ok) {
    throw new Error('Failed to get applicant status');
  }
  
  return response.json();
}

// ============================================
// EXPORTS
// ============================================

export default {
  createApplicant,
  getAccessToken,
  getSumSubToken,
  getApplicantStatus,
};
