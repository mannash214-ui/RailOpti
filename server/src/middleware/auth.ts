import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './error';

// Custom Request Interface incorporating user details
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}

export function protect(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  // 1) Checking for token presence in headers
  let token: string | undefined;
  
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please log in to gain access.', 401));
  }

  try {
    // 2) Verifying JWT signature
    const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_optirail_jwt_signature_key_2026';
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role?: string;
    };

    // 3) Appending decoded token payload to request context
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return next(new AppError('Authentication failed: Invalid or expired token.', 401));
  }
}
