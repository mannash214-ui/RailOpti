"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const logger_1 = require("./middleware/logger");
const error_1 = require("./middleware/error");
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
// 1) Global Middlewares
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : '*';
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true,
}));
app.use(express_1.default.json());
// Enable custom request logging
app.use(logger_1.requestLogger);
// 2) API Routes Gateway Mount (handles both /api/route and /route rewrites on serverless)
app.use('/api', routes_1.default);
app.use('/', routes_1.default);
// 3) Fallback Route for undefined endpoints
app.use('*', (req, _res, next) => {
    next(new error_1.AppError(`Cannot find requested route ${req.originalUrl} on this server.`, 404));
});
// 4) Centralized Error Middleware (must be registered last)
app.use(error_1.errorHandler);
exports.default = app;
