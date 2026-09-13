import app from '../server/src/app';
import { connectDB } from '../server/src/config/db';

export default async function handler(req: any, res: any) {
  try {
    await connectDB();
    return app(req, res);
  } catch (error: any) {
    console.error('[Vercel Serverless Error]:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal Server Error during backend request execution.',
    });
  }
}
