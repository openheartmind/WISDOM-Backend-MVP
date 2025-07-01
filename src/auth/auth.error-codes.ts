/**
 * Authentication error codes
 * 
 * These codes are versioned and stable. Client applications should rely on these codes
 * rather than error messages which may change without notice.
 * 
 * Documentation References:
 * - Supabase Auth API: https://supabase.com/docs/reference/javascript/auth-api
 * - Auth Error Codes: https://supabase.com/docs/guides/auth/auth-errors
 * - Admin API: https://supabase.com/docs/reference/javascript/auth-admin-createuser
 */
export enum AuthErrorCode {
  // Essential authentication errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  RATE_LIMITED = 'RATE_LIMITED',
  
  // General fallback
  AUTH_ERROR = 'AUTH_ERROR',
}

/**
 * Error code descriptions for documentation purposes
 * These are not sent to clients but can be used for API documentation
 */
export const AuthErrorDescriptions: Record<AuthErrorCode, string> = {
  [AuthErrorCode.AUTH_ERROR]: 'General authentication error',
  [AuthErrorCode.INVALID_CREDENTIALS]: 'Invalid email or password provided',
  [AuthErrorCode.EMAIL_NOT_VERIFIED]: 'Email address has not been verified',
  [AuthErrorCode.RATE_LIMITED]: 'Too many authentication attempts',
}; 