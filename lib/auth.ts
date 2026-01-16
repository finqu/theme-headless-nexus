import { jwtVerify, type JWTPayload } from 'jose';
import { NextRequest } from 'next/server';

/**
 * Payload structure for Finqu editor JWT tokens
 */
export interface EditorTokenPayload extends JWTPayload {
  storeId?: string;
  permissions?: string[];
}

/**
 * Check if the request is from localhost
 * Localhost requests bypass JWT authentication for development convenience
 */
export function isLocalhost(request: NextRequest): boolean {
  const host = request.headers.get('host') || '';
  const forwardedHost = request.headers.get('x-forwarded-host') || '';

  const hostToCheck = forwardedHost || host;

  return (
    hostToCheck.startsWith('localhost') ||
    hostToCheck.startsWith('127.0.0.1') ||
    hostToCheck.startsWith('[::1]')
  );
}

/**
 * Extract Bearer token from Authorization header
 */
export function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}

/**
 * Verify a Finqu editor JWT token
 * @returns The decoded payload if valid, null otherwise
 */
export async function verifyEditorToken(token: string): Promise<EditorTokenPayload | null> {
  const secretKey = process.env.FINQU_HEADLESS_SECRET_KEY;

  if (!secretKey) {
    console.error('FINQU_HEADLESS_SECRET_KEY is not configured');
    return null;
  }

  try {
    const secret = new TextEncoder().encode(secretKey);
    const { payload } = await jwtVerify(token, secret);
    return payload as EditorTokenPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Authentication result type
 */
export type AuthResult =
  | { authenticated: true; payload: EditorTokenPayload | null; isLocal: boolean }
  | { authenticated: false; error: string };

/**
 * Authenticate an editor API request
 * - Localhost requests are always allowed (returns payload: null, isLocal: true)
 * - Production requests require a valid JWT token
 */
export async function authenticateEditorRequest(request: NextRequest): Promise<AuthResult> {
  // Allow localhost without authentication
  if (isLocalhost(request)) {
    return { authenticated: true, payload: null, isLocal: true };
  }

  // Extract and verify JWT token for non-localhost requests
  const token = extractBearerToken(request);

  if (!token) {
    return { authenticated: false, error: 'Missing authorization token' };
  }

  const payload = await verifyEditorToken(token);

  if (!payload) {
    return { authenticated: false, error: 'Invalid or expired token' };
  }

  return { authenticated: true, payload, isLocal: false };
}
