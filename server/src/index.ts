import app from './app';
import { connectDB } from './config/db';
import dotenv from 'dotenv';

// Load environmental parameters
dotenv.config();

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  console.log('[System] Initializing OptiRail Backend Server bootstrap...');
  
  // 1) Initialize DB Connection
  await connectDB();
  
  // 2) Listen on Port
  app.listen(PORT, () => {
    console.log(`[Server] Listening on http://localhost:${PORT}`);
    console.log(`[Server] Mode: ${process.env.NODE_ENV || 'development'}`);
  });
}

bootstrap().catch((error) => {
  console.error('[System] Fatal error during startup:', error);
  process.exit(1);
});
