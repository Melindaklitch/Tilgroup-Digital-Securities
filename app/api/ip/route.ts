import { NextRequest, NextResponse } from 'next/server';

// ============================================
// TYPES & INTERFACES
// ============================================

interface IPResponse {
  ip: string;
  isLocal: boolean;
  isPrivate: boolean;
  source: 'cloudflare' | 'nginx' | 'direct' | 'unknown';
  timestamp: string;
}

interface IPInfo {
  ip: string;
  source: IPResponse['source'];
}

// ============================================
// CONSTANTS
// ============================================

// Private IP ranges (RFC 1918, RFC 4193, RFC 3927)
const PRIVATE_IP_RANGES = [
  { start: '10.0.0.0', end: '10.255.255.255' },
  { start: '172.16.0.0', end: '172.31.255.255' },
  { start: '192.168.0.0', end: '192.168.255.255' },
  { start: '127.0.0.0', end: '127.255.255.255' },
  { start: '169.254.0.0', end: '169.254.255.255' },
  { start: 'fd00::', end: 'fdff:ffff:ffff:ffff:ffff:ffff:ffff:ffff' }, // IPv6 Unique Local
  { start: 'fe80::', end: 'febf:ffff:ffff:ffff:ffff:ffff:ffff:ffff' }, // IPv6 Link Local
];

// Known proxy headers in order of trust
const PROXY_HEADERS = [
  'cf-connecting-ip',      // Cloudflare
  'x-forwarded-for',       // Standard proxy
  'x-real-ip',             // Nginx real IP
  'true-client-ip',        // Akamai
  'x-client-ip',           // Generic
  'x-cluster-client-ip',   // Kubernetes
  'forwarded',             // RFC 7239
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Convert IP string to number for comparison
 */
function ipToNumber(ip: string): number {
  // Handle IPv6
  if (ip.includes(':')) {
    // Simple IPv6 check - for full implementation would need bigint
    return 0;
  }
  
  // Handle IPv4
  const parts = ip.split('.');
  if (parts.length !== 4) return 0;
  
  return (parseInt(parts[0]) << 24) +
         (parseInt(parts[1]) << 16) +
         (parseInt(parts[2]) << 8) +
         parseInt(parts[3]);
}

/**
 * Check if IP is in private range
 */
function isPrivateIP(ip: string): boolean {
  // Localhost
  if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
    return true;
  }
  
  // Check IPv4 private ranges
  if (!ip.includes(':')) {
    const num = ipToNumber(ip);
    if (num === 0) return false;
    
    // Check 10.0.0.0/8
    if ((num & 0xFF000000) === 0x0A000000) return true;
    // Check 172.16.0.0/12
    if ((num & 0xFFF00000) === 0xAC100000) return true;
    // Check 192.168.0.0/16
    if ((num & 0xFFFF0000) === 0xC0A80000) return true;
  }
  
  return false;
}

/**
 * Validate IPv4 address format
 */
function isValidIPv4(ip: string): boolean {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipv4Regex.test(ip);
}

/**
 * Validate IPv6 address format (basic check)
 */
function isValidIPv6(ip: string): boolean {
  // Basic IPv6 validation - excludes loopback
  if (ip === '::1') return true;
  
  const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
  return ipv6Regex.test(ip);
}

/**
 * Normalize IPv6 localhost
 */
function normalizeIPv6(ip: string): string {
  if (ip === '::1') return '127.0.0.1';
  return ip;
}

/**
 * Extract IP from forwarded header (handles multiple proxies)
 */
function extractFromForwardedFor(header: string | null): string | null {
  if (!header) return null;
  
  // Get the first IP (client IP before any proxies)
  const ips = header.split(',');
  const firstIp = ips[0]?.trim();
  
  if (firstIp && (isValidIPv4(firstIp) || isValidIPv6(firstIp))) {
    return firstIp;
  }
  
  return null;
}

/**
 * Extract IP from RFC 7239 Forwarded header
 */
function extractFromForwarded(header: string | null): string | null {
  if (!header) return null;
  
  // Parse Forwarded header: for=192.0.2.60;proto=http;by=203.0.113.43
  const forMatch = header.match(/for=([^;]+)/);
  if (forMatch) {
    let ip = forMatch[1].replace(/["']/g, '');
    // Remove port if present
    ip = ip.split(':')[0];
    if (isValidIPv4(ip) || isValidIPv6(ip)) {
      return ip;
    }
  }
  
  return null;
}

/**
 * Get client IP from request headers
 */
function getClientIP(request: NextRequest): IPInfo {
  const headers = request.headers;
  
  // Check proxy headers in order of trust
  for (const headerName of PROXY_HEADERS) {
    const headerValue = headers.get(headerName);
    
    if (headerValue) {
      let ip: string | null = null;
      
      if (headerName === 'forwarded') {
        ip = extractFromForwarded(headerValue);
      } else if (headerName === 'x-forwarded-for') {
        ip = extractFromForwardedFor(headerValue);
      } else {
        ip = headerValue.split(',')[0]?.trim();
      }
      
      if (ip && (isValidIPv4(ip) || isValidIPv6(ip))) {
        const source = 
          headerName === 'cf-connecting-ip' ? 'cloudflare' :
          headerName === 'x-real-ip' ? 'nginx' :
          headerName === 'x-forwarded-for' ? 'nginx' : 'unknown';
        
        return { ip: normalizeIPv6(ip), source };
      }
    }
  }
  
  // Fallback to remote address
  const remoteIp = request.ip || headers.get('x-real-ip') || '127.0.0.1';
  return { ip: normalizeIPv6(remoteIp), source: 'direct' };
}

/**
 * Get IP geolocation hint (for logging, not exact)
 */
function getGeolocationHint(ip: string): string {
  if (isPrivateIP(ip)) return 'private/local';
  
  // Basic country detection from IP ranges (simplified)
  if (ip.startsWith('1.') || ip.startsWith('2.') || ip.startsWith('3.') || ip.startsWith('4.') || ip.startsWith('5.')) {
    return 'asia-pacific';
  }
  if (ip.startsWith('6.') || ip.startsWith('7.') || ip.startsWith('8.') || ip.startsWith('9.')) {
    return 'north-america';
  }
  if (ip.startsWith('10.') || ip.startsWith('11.')) {
    return 'europe';
  }
  
  return 'unknown';
}

// ============================================
// MAIN API ROUTE HANDLER
// ============================================

export async function GET(request: NextRequest): Promise<NextResponse<IPResponse>> {
  const startTime = Date.now();
  
  try {
    // Get client IP with source detection
    const { ip: rawIp, source } = getClientIP(request);
    
    // Normalize localhost
    let ip = rawIp;
    if (ip === '::1') ip = '127.0.0.1';
    
    // Validate IP format
    const isValid = isValidIPv4(ip) || isValidIPv6(ip);
    if (!isValid) {
      console.warn(`[IP API] Invalid IP format detected: ${ip}`);
      ip = '127.0.0.1';
    }
    
    // Check if private IP
    const isPrivate = isPrivateIP(ip);
    const isLocal = ip === '127.0.0.1' || ip === 'localhost';
    
    // Log IP access (for analytics - without storing full IP in production)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[IP API] Request from: ${ip} (${source}) | Private: ${isPrivate} | Duration: ${Date.now() - startTime}ms`);
    }
    
    // Return IP information
    return NextResponse.json({
      ip,
      isLocal,
      isPrivate,
      source,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('[IP API] Error:', error);
    
    // Return safe fallback
    return NextResponse.json({
      ip: '127.0.0.1',
      isLocal: true,
      isPrivate: true,
      source: 'unknown',
      timestamp: new Date().toISOString(),
    });
  }
}

// ============================================
// OPTIONAL: POST endpoint for IP validation
// ============================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { ip } = body;
    
    if (!ip) {
      return NextResponse.json(
        { error: 'IP address required' },
        { status: 400 }
      );
    }
    
    const isValid = isValidIPv4(ip) || isValidIPv6(ip);
    const isPrivate = isPrivateIP(ip);
    
    return NextResponse.json({
      ip,
      isValid,
      isPrivate,
      isLocal: ip === '127.0.0.1' || ip === '::1' || ip === 'localhost',
    });
    
  } catch (error) {
    console.error('[IP API POST] Error:', error);
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}

// ============================================
// OPTIONAL: Rate limiting headers
// ============================================

export const dynamic = 'force-dynamic';
export const runtime = 'edge'; // Use edge runtime for better performance on IP detection
