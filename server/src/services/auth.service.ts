import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { AppError } from '../middleware/error';

interface TokenResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export class AuthService {
  private static signToken(id: string, email: string): string {
    const secret = process.env.JWT_SECRET || 'super_secret_optirail_jwt_signature_key_2026';
    const expires = process.env.JWT_EXPIRES_IN || '7d';
    return jwt.sign({ id, email }, secret, { expiresIn: expires as any });
  }

  public static async register(userData: any): Promise<TokenResponse> {
    const { name, email, password } = userData || {};

    if (!name || !email || !password) {
      throw new AppError('Please provide name, email, and password.', 400);
    }

    if (password.length < 8) {
      throw new AppError('Password must be at least 8 characters long.', 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      throw new AppError('An account with this email address already exists.', 400);
    }

    // Create user in DB
    const newUser = await User.create({
      name,
      email,
      password,
    });

    const token = this.signToken(newUser._id.toString(), newUser.email);

    return {
      token,
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
      },
    };
  }

  public static async login(credentials: any): Promise<TokenResponse> {
    const { email, password } = credentials;

    if (!email || !password) {
      throw new AppError('Please provide both email and password.', 400);
    }

    if (password.length < 8) {
      throw new AppError('Password must be at least 8 characters long.', 400);
    }

    // Find user and explicitly select password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError('Incorrect email or password.', 401);
    }

    // Verify password matching
    const isCorrect = await (user as any).comparePassword(password);
    if (!isCorrect) {
      throw new AppError('Incorrect email or password.', 401);
    }

    const token = this.signToken(user._id.toString(), user.email);

    return {
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    };
  }
}
