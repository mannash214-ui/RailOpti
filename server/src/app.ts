import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { requestLogger } from './middleware/logger';
import { errorHandler, AppError } from './middleware/error';
import apiRouter from './routes';

const app: Express = express();

// 1) Global Middlewares
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : '*';

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());

// Enable custom request logging
app.use(requestLogger);

// 2) API Routes Gateway Mount (handles both /api/route and /route rewrites on serverless)
app.use('/api', apiRouter);
app.use('/', apiRouter);

// 3) Fallback Route for undefined endpoints
app.use('*', (req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Cannot find requested route ${req.originalUrl} on this server.`, 404));
});

// 4) Centralized Error Middleware (must be registered last)
app.use(errorHandler);

export default app;
