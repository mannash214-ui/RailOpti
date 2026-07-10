import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

export async function connectDB(): Promise<void> {
  if (!MONGODB_URI) {
    console.error('[Database] Fatal Error: MONGODB_URI environment variable is missing.');
    throw new Error('MONGODB_URI environment variable is missing');
  }

  try {
    mongoose.set('strictQuery', true);
    
    console.log('[Database] Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    
    console.log('[Database] MongoDB connection established successfully.');
  } catch (error) {
    console.error('[Database] MongoDB connection failed:', error);
    throw error;
  }
}

// Connection event logging
mongoose.connection.on('disconnected', () => {
  console.warn('[Database] MongoDB connection lost. Attempting reconnection...');
});

mongoose.connection.on('error', (err) => {
  console.error('[Database] Runtime mongoose connection error:', err);
});
