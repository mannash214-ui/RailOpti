"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = protect;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const error_1 = require("./error");
function protect(req, _res, next) {
    // 1) Checking for token presence in headers
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(new error_1.AppError('You are not logged in. Please log in to gain access.', 401));
    }
    try {
        // 2) Verifying JWT signature
        const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_optirail_jwt_signature_key_2026';
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // 3) Appending decoded token payload to request context
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
        };
        next();
    }
    catch (error) {
        return next(new error_1.AppError('Authentication failed: Invalid or expired token.', 401));
    }
}
