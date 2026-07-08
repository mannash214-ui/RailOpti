"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.errorHandler = errorHandler;
// Custom Application Error class mapping HTTP Status Codes
class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
// Centralized Express Error handling middleware
function errorHandler(err, _req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_next) {
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
        message: 'An unexpected internal server error occurred.',
        ...(isProd ? {} : { stack: err.stack, details: err.message }),
    });
}
