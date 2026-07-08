"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
const error_1 = require("../middleware/error");
class AuthService {
    static signToken(id, email) {
        const secret = process.env.JWT_SECRET || 'super_secret_optirail_jwt_signature_key_2026';
        const expires = process.env.JWT_EXPIRES_IN || '7d';
        return jsonwebtoken_1.default.sign({ id, email }, secret, { expiresIn: expires });
    }
    static async register(userData) {
        const { name, email, password } = userData;
        // Check if user already exists
        const existingUser = await user_model_1.User.findOne({ email });
        if (existingUser) {
            throw new error_1.AppError('An account with this email address already exists.', 400);
        }
        // Create user in DB
        const newUser = await user_model_1.User.create({
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
    static async login(credentials) {
        const { email, password } = credentials;
        if (!email || !password) {
            throw new error_1.AppError('Please provide both email and password.', 400);
        }
        // Find user and explicitly select password field
        const user = await user_model_1.User.findOne({ email }).select('+password');
        if (!user) {
            throw new error_1.AppError('Incorrect email or password.', 401);
        }
        // Verify password matching
        const isCorrect = await user.comparePassword(password);
        if (!isCorrect) {
            throw new error_1.AppError('Incorrect email or password.', 401);
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
exports.AuthService = AuthService;
