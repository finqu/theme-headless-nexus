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
 * Extract token from finqu_editor_token query parameter
 */
export function extractQueryToken(request: NextRequest): string | null {
  return request.nextUrl.searchParams.get('finqu_editor_token');
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
  | { authenticated: true; payload: EditorTokenPayload }
  | { authenticated: false; error: string };

/**
 * Authenticate an editor API request
 * Requires a valid JWT token (from Authorization header or finqu_editor_token query param)
 */
export async function authenticateEditorRequest(request: NextRequest): Promise<AuthResult> {
  // Extract JWT token
  // Check Authorization header first, then fall back to finqu_editor_token query param
  const token = extractBearerToken(request) || extractQueryToken(request);

  if (!token) {
    return { authenticated: false, error: 'Missing authorization token' };
  }

  const payload = await verifyEditorToken(token);

  if (!payload) {
    return { authenticated: false, error: 'Invalid or expired token' };
  }

  return { authenticated: true, payload };
}
