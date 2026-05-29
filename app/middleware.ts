import { NextRequest, NextResponse } from 'next/server';

// ============================================
// MIDDLEWARE
// ============================================

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for static assets and API routes
  const skipPaths = [
    '/_next',
    '/api',
    '/images',
    '/favicon',
    '/icons',
    '/fonts',
  ];
  
  if (skipPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  const response = NextResponse.next();
  
  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Add CSP in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://*.supabase.co https://api.mainnet-beta.solana.com;"
    );
  }
  
  return response;
}

// ============================================
// CONFIGURATION
// ============================================

export const config = {
  matcher: [
    // Match all paths except static files and API
    '/((?!_next|api|images|favicon|icons|fonts|.*\\..*).*)',
    // Always run for root
    '/',
  ],
};
