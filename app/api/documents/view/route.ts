import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/api/lib/supabaseAdmin';
import { supabase } from '@/app/components/Lib/supabaseClient';
import fs from 'fs/promises';
import path from 'path';
import { normalizeDocumentType } from '@/lib/documentMapping';

// ============================================
// TYPES & INTERFACES
// ============================================

interface DocumentViewPayload {
  type: string;
  lang: string;
  userId: string | null;
}

interface DocumentMapEntry {
  fileName: string;
  description: string;
  requiresAuth?: boolean;
}

type SupportedLanguage = 'en' | 'vi' | 'zh' | 'ja' | 'ko' | 'fr' | 'de' | 'es' | 'ar';

// ============================================
// CONSTANTS
// ============================================

const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['en', 'vi', 'zh', 'ja', 'ko', 'fr', 'de', 'es', 'ar'];
const DEFAULT_LANGUAGE: SupportedLanguage = 'en';
const CACHE_MAX_AGE = 3600; // 1 hour
const CACHE_STALE_WHILE_REVALIDATE = 86400; // 24 hours

// Document type mapping to actual file names
const DOCUMENT_MAP: Record<string, DocumentMapEntry> = {
  'concession-agreement': {
    fileName: 'concession-agreement-full',
    description: 'Port Concession Agreement',
    requiresAuth: true,
  },
  'financial-audits': {
    fileName: 'financial-audits-full',
    description: 'Financial Audits & Statements',
    requiresAuth: true,
  },
  'technical-specs': {
    fileName: 'technical-architecture-full',
    description: 'Technical Architecture Specifications',
    requiresAuth: true,
  },
  'technical-architecture': {
    fileName: 'technical-architecture-full',
    description: 'Technical Architecture Specifications',
    requiresAuth: true,
  },
  'environmental-impact': {
    fileName: 'environmental-assessment-full',
    description: 'Environmental Impact Assessment',
    requiresAuth: true,
  },
  'environmental-assessment': {
    fileName: 'environmental-assessment-full',
    description: 'Environmental Impact Assessment',
    requiresAuth: true,
  },
  'regulatory-compliance': {
    fileName: 'regulatory-compliance-full',
    description: 'Regulatory Compliance Documentation',
    requiresAuth: true,
  },
  'legal-opinion': {
    fileName: 'legal-opinion-full',
    description: 'Legal Opinion on Ownership Structure',
    requiresAuth: true,
  },
  'management-team': {
    fileName: 'management-team-full',
    description: 'Management Team Background',
    requiresAuth: true,
  },
  'construction-timelines': {
    fileName: 'construction-timelines-full',
    description: 'Construction & Development Timelines',
    requiresAuth: true,
  },
  'revenue-projections': {
    fileName: 'revenue-projections-full',
    description: 'Revenue Projections & Modeling',
    requiresAuth: true,
  },
  'market-analysis': {
    fileName: 'market-analysis-full',
    description: 'Market Analysis & Competitive Landscape',
    requiresAuth: true,
  },
  'market-analysis-competitive-landscape': {
    fileName: 'market-analysis-full',
    description: 'Market Analysis & Competitive Landscape',
    requiresAuth: true,
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Validate language parameter
 */
function validateLanguage(lang: string | null): SupportedLanguage {
  if (!lang) return DEFAULT_LANGUAGE;
  if (SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage)) {
    return lang as SupportedLanguage;
  }
  console.warn(`[Document API] Unsupported language: ${lang}, falling back to ${DEFAULT_LANGUAGE}`);
  return DEFAULT_LANGUAGE;
}

/**
 * Validate document type
 */
function validateDocumentType(type: string | null) {
  if (!type) return { isValid: false, error: 'Document type is required' };

  const normalizedType = normalizeDocumentType(type);

  if (!DOCUMENT_MAP[normalizedType]) {
    return { isValid: false, error: `Invalid document type: ${type}` };
  }

  return { isValid: true, normalizedType };
}

  /**
   * Check if user has access to document
   * Access levels:
   * - No legal acknowledgment → No access (show "acknowledge first")
   * - Legal acknowledged, not invested → Preview (150 sentences + blur)
   * - Legal acknowledged + invested → Full document
   */
    async function checkDocumentAccess(userId: string | null, documentType: string): Promise<{ 
      hasAccess: boolean; 
      accessLevel: 'none' | 'preview' | 'full';
      requiresLegal?: boolean;
    }> {
      const documentEntry = DOCUMENT_MAP[documentType];
      
      // If document doesn't require auth, allow full access
      if (!documentEntry?.requiresAuth) {
        return { hasAccess: true, accessLevel: 'full' };
      }
      
      // If no user ID, deny access for auth-required documents
      if (!userId) {
        console.log(`[Document API] Auth required for ${documentType}, but no user ID provided`);
        return { hasAccess: false, accessLevel: 'none', requiresLegal: true };
      }
      
      try {
        // 1. Check LEGAL ACKNOWLEDGMENT
        const { data: legalAcks, error: legalError } = await supabaseAdmin
          .from('legal_acknowledgements')
          .select('document_type')
          .eq('user_id', userId)
          .eq('acknowledged', true);

        if (legalError) {
          console.error('[Document API] Legal acknowledgment check error:', legalError);
        }

        const hasLegalAcknowledgment = legalAcks && legalAcks.length > 0;
        console.log('[Document API] Legal check result', {
        userId,
        legalCount: legalAcks?.length || 0,
        legalAcks,
        });        

        console.log('[Document API] Checking for user:', userId);
        console.log('[Document API] Legal query result:', { data: legalAcks, error: legalError });

        if (!hasLegalAcknowledgment) {
          console.log(`[Document API] User ${userId} denied access - no legal acknowledgment`);
          return { hasAccess: false, accessLevel: 'none', requiresLegal: true };
        }

       // 2. Check if user has INVESTED (made a purchase)
       const { data: purchases, error: purchaseError } = await supabaseAdmin
      .from('presale_purchases')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

       if (purchaseError) {
       console.error('[Document API] Purchase check error:', purchaseError);
      }

       console.log('[Document API] Purchase query result:', { data: purchases, error: purchaseError });

       const hasInvested = purchases && purchases.length > 0;
       console.log('[Document API] Purchase check result', {
       userId,
       purchaseCount: purchases?.length || 0,
       purchases,
      });

        // ✅ If user has invested, grant FULL access (no KYC requirement)
        if (hasInvested) {
          console.log(`[Document API] User ${userId} granted FULL access to ${documentType} (has purchases)`);
          return { hasAccess: true, accessLevel: 'full' };
        }
        
        // Legal acknowledged but NOT invested = PREVIEW mode
        console.log(`[Document API] User ${userId} granted PREVIEW access to ${documentType} (legal ok, not invested)`);
        return { hasAccess: true, accessLevel: 'preview' };
        
      } catch (error) {
        console.error('[Document API] Access check exception:', error);
        return { hasAccess: false, accessLevel: 'none', requiresLegal: true };
      }
    }

/**
 * Log document view to database
 */
async function logDocumentView(userId: string | null, documentType: string, language: string): Promise<void> {
  if (!userId) return;
  
  try {
    const { error } = await supabaseAdmin.from('document_views').insert({
      user_id: userId,
      document_type: documentType,
      language: language,
      viewed_at: new Date().toISOString(),
    });
    
    if (error) {
      console.error('[Document API] Failed to log view:', error);
    } else {
      console.log(`[Document API] Logged view for user ${userId}, document: ${documentType}`);
    }
  } catch (error) {
    console.error('[Document API] Exception logging view:', error);
  }
}

/**
 * Find the correct file path with fallback
 */
async function findDocumentFilePath(baseFileName: string, language: SupportedLanguage): Promise<string | null> {
  const documentsDir = path.join(process.cwd(), 'public', 'legal', 'documents');
  const extensions = ['.html', '.pdf'];
  
  for (const ext of extensions) {
    // Try language-specific file first
    let filePath = path.join(documentsDir, language, `${baseFileName}${ext}`);
    
    try {
      await fs.access(filePath);
      console.log(`[Document API] Found file: ${filePath}`);
      return filePath;
    } catch {
      // File not found, try English fallback
      if (language !== DEFAULT_LANGUAGE) {
        filePath = path.join(documentsDir, DEFAULT_LANGUAGE, `${baseFileName}${ext}`);
        try {
          await fs.access(filePath);
          console.log(`[Document API] Found English fallback: ${filePath}`);
          return filePath;
        } catch {
          // Continue to next extension
        }
      }
    }
  }
  
  return null;
}

/**
 * Generate HTML error page
 */
function generateErrorPage(title: string, message: string, statusCode: number): NextResponse {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${escapeHtml(title)}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
          background: linear-gradient(135deg, #0f2a3f 0%, #0a1f2f 100%);
          color: white; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          min-height: 100vh;
          padding: 20px;
        }
        .container { 
          text-align: center; 
          max-width: 500px; 
          background: rgba(15, 42, 63, 0.8);
          backdrop-filter: blur(10px);
          padding: 40px;
          border-radius: 20px;
          border: 1px solid rgba(0, 255, 136, 0.2);
        }
        h1 { color: #10b981; margin-bottom: 16px; font-size: 28px; }
        p { color: #94a3b8; margin-bottom: 24px; line-height: 1.6; }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
          color: white;
          padding: 12px 28px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          transition: transform 0.2s;
        }
        .button:hover { transform: translateY(-2px); }
        .error-code { font-size: 14px; color: #64748b; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(message)}</p>
        <a href="/platform" class="button">Return to Platform</a>
        <div class="error-code">Error ${statusCode}</div>
      </div>
    </body>
    </html>
  `;
  
  return new NextResponse(html, {
    status: statusCode,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

/**
 * Escape HTML special characters
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ============================================
// MAIN API ROUTE HANDLER
// ============================================

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  
  try {
    // Parse and validate parameters
    const searchParams = request.nextUrl.searchParams;
    const rawType = searchParams.get('type');
    const rawLang = searchParams.get('lang');
    const userId = searchParams.get('userId');
    
console.log('[Document API] RAW PARAMS', {
    rawType,
    rawLang,
    userId,
    userIdType: typeof userId,
 });

    // Validate document type
    const normalizedInput = normalizeDocumentType(rawType ?? '');
    const typeValidation = validateDocumentType(normalizedInput);
    if (!typeValidation.isValid) {
      return generateErrorPage('Invalid Request', typeValidation.error || 'Invalid document type', 400);
    }
    
    const normalizedType = typeValidation.normalizedType!;
    const language = validateLanguage(rawLang);
    const documentEntry = DOCUMENT_MAP[normalizedType];
    
    console.log(`[Document API] Request: type=${normalizedType}, lang=${language}, user=${userId || 'anonymous'}`);
    
     // Check access permissions
     const accessResult = await checkDocumentAccess(userId, normalizedType);
     
     // If no access at all (no legal acknowledgment)
     if (!accessResult.hasAccess && accessResult.accessLevel === 'none') {
       const html = `
         <!DOCTYPE html>
         <html>
         <head>
           <meta charset="UTF-8">
           <title>Legal Acknowledgment Required</title>
           <style>
             * { margin: 0; padding: 0; box-sizing: border-box; }
             body { background: linear-gradient(135deg, #0f2a3f 0%, #0a1f2f 100%); font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 20px; }
             .card { max-width: 550px; background: rgba(15, 42, 63, 0.95); border-radius: 24px; padding: 40px; text-align: center; border: 1px solid rgba(0, 255, 136, 0.3); }
             h2 { color: #f59e0b; margin-bottom: 16px; }
             p { color: #94a3b8; margin-bottom: 24px; }
             button { background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); border: none; padding: 12px 28px; border-radius: 9999px; color: white; font-weight: 600; cursor: pointer; }
             .preview-notice { margin-top: 30px; padding: 16px; background: rgba(0,0,0,0.3); border-radius: 12px; font-size: 12px; }
             .blurred-preview { filter: blur(8px); margin-top: 30px; padding: 20px; background: rgba(0,0,0,0.2); border-radius: 12px; user-select: none; pointer-events: none; }
           </style>
         </head>
         <body>
           <div class="card">
             <h2>📋 Legal Acknowledgment Required</h2>
             <p>You must complete the legal document acknowledgment before accessing this document.</p>
             <button onclick="window.location.href='/dashboard?legal=true&doc=${encodeURIComponent(normalizedType)}'">Go to Dashboard → Acknowledge</button>
             <div class="preview-notice">🔒 Document access restricted until legal acknowledgment.</div>
             <div class="blurred-preview"><p>This document contains confidential information about the Can Gio Port investment opportunity...</p></div>
           </div>
         </body>
         </html>
       `;
       return new NextResponse(html, { status: 200, headers: { 'Content-Type': 'text/html' } });
     }
     
     // If preview mode (legal acknowledged but not invested)
     if (accessResult.accessLevel === 'preview') {
       const filePath = await findDocumentFilePath(documentEntry.fileName, language);
       if (!filePath) {
         return generateErrorPage('Document Not Found', 'The requested document is not available', 404);
       }
       
       let fullContent = await fs.readFile(filePath, 'utf-8');
       const plainText = fullContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
       const sentences = plainText.split(/(?<=[.!?])\s+/);
       const previewSentences = sentences.slice(0, 200);
       
       const html = `
         <!DOCTYPE html>
         <html>
         <head><meta charset="UTF-8"><title>Preview - ${documentEntry.description}</title>
         <style>
           body { background: #0a1f2f; font-family: system-ui, sans-serif; padding: 40px; color: #e2e8f0; }
           .container { max-width: 900px; margin: 0 auto; background: #0f2a3f; border-radius: 16px; padding: 40px; border: 1px solid rgba(0,255,136,0.2); }
           .preview-content { position: relative; max-height: 500px; overflow: hidden; }
           .blur-overlay { position: absolute; bottom: 0; left: 0; right: 0; height: 150px; background: linear-gradient(to bottom, transparent, #0f2a3f); pointer-events: none; }
            .invest-cta {
             margin-top: 48px;
             padding: 40px;
             border-radius: 20px;
             background: linear-gradient(
    180deg,
    rgba(15, 42, 63, 0.95) 0%,
    rgba(10, 31, 47, 0.98) 100%
  );
  border: 1px solid rgba(16, 185, 129, 0.18);
  text-align: left;
}

.cta-divider {
  width: 80px;
  height: 2px;
  background: linear-gradient(90deg, #10b981, transparent);
  margin-bottom: 24px;
}

.invest-cta h3 {
  color: #f8fafc;
  font-size: 24px;
  margin-bottom: 18px;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.invest-cta p {
  color: #94a3b8;
  line-height: 1.8;
  font-size: 15px;
  margin-bottom: 18px;
}

.secondary-text {
  color: #64748b;
  font-size: 14px;
}

.invest-btn {
  margin-top: 12px;
  background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
  border: none;
  padding: 14px 28px;
  border-radius: 9999px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
}

.invest-btn:hover {
  transform: translateY(-2px);
  opacity: 0.95;
}
           .badge { display: inline-block; background: #f59e0b; color: #0a1f2f; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 20px; }
         </style>
         </head>
         <body>
           <div class="container">
             <div class="badge">📄 PREVIEW MODE</div>
             <h1>${documentEntry.description}</h1>
             <div class="preview-content">
               ${previewSentences.map(s => `<p>${s.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`).join('')}
               <div class="blur-overlay"></div>
             </div>
            <div class="invest-cta">
            <div class="cta-divider"></div>

            <h3>Restricted Institutional Access</h3>

          <p>
             You are currently viewing the public preview version of this document.
             Full access to detailed financial schedules, operational disclosures,
             concession structures, and supporting annexures is available to verified
             participants holding at least one qualifying digital infrastructure security
             within the Can Gio Port ecosystem.
          </p>

          <p class="secondary-text">
             Eligible participants may also request selected supporting materials
             directly through investor relations review channels.
         </p>

        <button
             class="invest-btn"
             onclick="window.parent.postMessage('invest-now', '*')"
            >
              View Investment Opportunities
        </button>
           </div>
           </div>
           <script>document.querySelector('.invest-btn')?.addEventListener('click',()=>window.parent.postMessage('invest-now','*'));</script>
         </body>
         </html>
       `;
       await logDocumentView(userId, normalizedType, language);
       return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });
     }
    
    // Find document file
    const filePath = await findDocumentFilePath(documentEntry.fileName, language);
    
    if (!filePath) {
      console.error(`[Document API] File not found: ${documentEntry.fileName} for language ${language}`);
      return generateErrorPage(
        'Document Not Found',
        `The requested document "${documentEntry.description}" is not available in ${language.toUpperCase()}. Please contact support.`,
        404
      );
    }
    
    // Read file
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Log the view asynchronously (don't await)
    logDocumentView(userId, normalizedType, language);
    
    const duration = Date.now() - startTime;
    console.log(`[Document API] Success - ${duration}ms`);
    
    // Return response with caching headers
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': `public, max-age=${CACHE_MAX_AGE}, stale-while-revalidate=${CACHE_STALE_WHILE_REVALIDATE}`,
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'X-Document-Type': normalizedType,
        'X-Document-Language': language,
      },
    });
    
  } catch (error: any) {
    console.error('[Document API] Fatal error:', error);
    
    // Handle specific error types
    if (error.code === 'ENOENT') {
      return generateErrorPage(
        'Document Not Found',
        'The requested document could not be located. Please contact investor relations.',
        404
      );
    }
    
    if (error.code === 'EACCES') {
      return generateErrorPage(
        'Access Error',
        'Unable to access the document. Please contact support.',
        500
      );
    }
    
    return generateErrorPage(
      'Service Unavailable',
      process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred. Please try again later.',
      500
    );
  }
}

// ============================================
// OPTIONAL: HEAD request for document metadata
// ============================================

export async function HEAD(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;
  const rawType = searchParams.get('type');
  
  const typeValidation = validateDocumentType(rawType);
  if (!typeValidation.isValid) {
    return new NextResponse(null, { status: 404 });
  }
  
  const normalizedType = typeValidation.normalizedType!;
  const documentEntry = DOCUMENT_MAP[normalizedType];
  
  return new NextResponse(null, {
    headers: {
      'X-Document-Type': normalizedType,
      'X-Document-Name': documentEntry.description,
      'X-Document-Available-Languages': SUPPORTED_LANGUAGES.join(','),
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
