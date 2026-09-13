import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  const mongodbUri = process.env.MONGODB_URI;

  if (!mongodbUri) {
    console.warn('[Database] MONGODB_URI is not set. Operating in static dataset mode.');
    return;
  }

  try {
    mongoose.set('strictQuery', true);
    
    console.log('[Database] Connecting to MongoDB...');
    const conn = await mongoose.connect(mongodbUri, { serverSelectionTimeoutMS: 5000 });
    isConnected = conn.connections[0].readyState === 1;
    
    console.log('[Database] MongoDB connection established successfully.');
  } catch (error) {
    console.warn('[Database] MongoDB connection failed. Operating in static dataset mode:', (error as any)?.message);
  }
}

// Connection event logging
mongoose.connection.on('disconnected', () => {
  console.warn('[Database] MongoDB connection lost. Attempting reconnection...');
});

mongoose.connection.on('error', (err) => {
  console.error('[Database] Runtime mongoose connection error:', err);
});
