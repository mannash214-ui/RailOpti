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
function errorHandler(err, _req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_next) {
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
