import { jwtVerify, SignJWT, type JWTPayload } from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Cookie name for the editor session
 */
export const EDITOR_SESSION_COOKIE = 'finqu_editor_session';

/**
 * Session expiry time (1 hour)
 */
const SESSION_EXPIRY_SECONDS = 60 * 60;

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
  const secretKey = process.env.FINQU_EDITOR_SIGNING_KEY;

  if (!secretKey) {
    console.error('FINQU_EDITOR_SIGNING_KEY is not configured');
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
 * Get the secret key for signing session tokens
 */
function getSessionSecret(): Uint8Array | null {
  const secretKey = process.env.FINQU_HEADLESS_SECRET_KEY;
  if (!secretKey) {
    console.error('FINQU_HEADLESS_SECRET_KEY is not configured');
    return null;
  }
  return new TextEncoder().encode(secretKey);
}

/**
 * Create a signed session token from the editor token payload
 */
export async function createSessionToken(payload: EditorTokenPayload): Promise<string | null> {
  const secret = getSessionSecret();
  if (!secret) return null;

  try {
    const token = await new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(`${SESSION_EXPIRY_SECONDS}s`)
      .sign(secret);
    return token;
  } catch (error) {
    console.error('Failed to create session token:', error);
    return null;
  }
}

/**
 * Verify a session token and return the payload
 */
export async function verifySessionToken(token: string): Promise<EditorTokenPayload | null> {
  const secret = getSessionSecret();
  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as EditorTokenPayload;
  } catch (error) {
    // Session expired or invalid - this is expected, don't log as error
    return null;
  }
}

/**
 * Get session payload from cookies (for use in server components/API routes)
 */
export async function getSessionFromCookies(): Promise<EditorTokenPayload | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(EDITOR_SESSION_COOKIE);

  if (!sessionCookie?.value) {
    return null;
  }

  return verifySessionToken(sessionCookie.value);
}

/**
 * Create a response with the session cookie set
 */
export function createSessionCookieResponse(
  response: NextResponse,
  sessionToken: string
): NextResponse {
  response.cookies.set(EDITOR_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_EXPIRY_SECONDS,
    path: '/',
  });
  return response;
}

/**
 * Authenticate an editor API request
 * Checks in order:
 * 1. Session cookie (for subsequent requests after initial auth)
 * 2. Authorization header
 * 3. finqu_editor_token query parameter
 */
export async function authenticateEditorRequest(request: NextRequest): Promise<AuthResult> {
  // First, check for a valid session cookie
  const sessionCookie = request.cookies.get(EDITOR_SESSION_COOKIE);
  if (sessionCookie?.value) {
    const sessionPayload = await verifySessionToken(sessionCookie.value);
    if (sessionPayload) {
      return { authenticated: true, payload: sessionPayload };
    }
  }

  // Fall back to JWT token authentication
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
