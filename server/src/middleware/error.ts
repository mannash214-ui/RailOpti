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

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      stack: err.stack,
    });
    return;
  }

  // Log unknown/system errors internally
  console.error('[Unhandled Exception Error]:', err);
  
  const errMessage = err?.message || (typeof err === 'string' ? err : JSON.stringify(err)) || 'Unknown Error';
  const errStack = err?.stack || new Error().stack;

  res.status(500).json({
    status: 'error',
    message: errMessage,
    details: errMessage,
    stack: errStack,
  });
}
