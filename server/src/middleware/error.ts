import { Request, Response, NextFunction } from 'express';

// Custom Application Error class mapping HTTP Status Codes
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Centralized Express Error handling middleware
export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const isProd = process.env.NODE_ENV === 'production';
  
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      ...(isProd ? {} : { stack: err.stack }),
    });
    return;
  }

  // Log unknown/system errors internally
  console.error('[Unhandled Exception Error]:', err);
  
  res.status(500).json({
    status: 'error',
    message: err.message || 'An unexpected internal server error occurred.',
    details: err.message,
    stack: err.stack,
  });
}
