import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { requestLogger } from './middleware/logger';
import { errorHandler, AppError } from './middleware/error';
import apiRouter from './routes';

const app: Express = express();

// 1) Global Middlewares
app.use(cors());
app.use(express.json());

// Enable custom request logging
app.use(requestLogger);

// 2) API Routes Gateway Mount
app.use('/api', apiRouter);

// 3) Fallback Route for undefined endpoints
app.use('*', (req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Cannot find requested route ${req.originalUrl} on this server.`, 404));
});

// 4) Centralized Error Middleware (must be registered last)
app.use(errorHandler);

export default app;
