/**
 * Centralized error handling utilities
 * Provides consistent error types and handling across the application
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message)
    this.name = 'AppError'
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public fields?: Record<string, string>) {
    super(message, 'VALIDATION_ERROR', 400, true)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401, true)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'AUTHORIZATION_ERROR', 403, true)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 'NOT_FOUND', 404, true)
    this.name = 'NotFoundError'
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests', public retryAfter?: number) {
    super(message, 'RATE_LIMIT_ERROR', 429, true)
    this.name = 'RateLimitError'
  }
}

/**
 * Handle errors and return user-friendly messages
 * Never expose internal error details in production
 */
export function handleError(error: unknown): { message: string; code: string; statusCode: number } {
  // Known operational errors
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
    }
  }

  // Validation errors from Zod
  if (error && typeof error === 'object' && 'issues' in error) {
    const zodError = error as { issues: Array<{ path: string[]; message: string }> }
    const messages = zodError.issues.map((issue) => issue.message).join(', ')
    return {
      message: `Validation failed: ${messages}`,
      code: 'VALIDATION_ERROR',
      statusCode: 400,
    }
  }

  // Standard Error objects
  if (error instanceof Error) {
    // Log full error in development, but don't expose to user
    if (process.env.NODE_ENV === 'development') {
      console.error('Error details:', error)
    }
    return {
      message: process.env.NODE_ENV === 'production'
        ? 'An error occurred. Please try again.'
        : error.message,
      code: 'INTERNAL_ERROR',
      statusCode: 500,
    }
  }

  // Unknown error types
  console.error('Unknown error type:', error)
  return {
    message: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : String(error),
    code: 'UNKNOWN_ERROR',
    statusCode: 500,
  }
}

/**
 * Convert error to JSON response format
 */
export function errorToResponse(error: unknown) {
  const handled = handleError(error)
  const response: any = {
    error: handled.message,
    code: handled.code,
  }
  
  // Include validation field errors if available
  if (error instanceof ValidationError && error.fields) {
    response.errors = error.fields
  }
  
  // Include stack trace in development
  if (process.env.NODE_ENV === 'development' && error instanceof Error) {
    response.stack = error.stack
  }
  
  return response
}
