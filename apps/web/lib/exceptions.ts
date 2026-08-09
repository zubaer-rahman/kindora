export class ApiError extends Error {
  statusCode: number;
  override stack?: string;

  constructor(statusCode: number, message: string, stack = '') {
    super(message);
    this.statusCode = statusCode;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Custom Authentication Error class extending ApiError
export class AuthError extends ApiError {
  constructor(message = 'Authentication error') {
    super(401, message);
    this.name = 'AuthError';
  }
}
