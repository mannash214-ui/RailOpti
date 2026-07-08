import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/optirail';

export async function connectDB(): Promise<void> {
  try {
    mongoose.set('strictQuery', true);
    
    await mongoose.connect(MONGO_URI);
    
    console.log('[Database] MongoDB connection established successfully.');
  } catch (error) {
    console.error('[Database] Connection failed:', error);
    process.exit(1); // Exits backend process if DB connection fails in production
  }
}

// Connection event logging
mongoose.connection.on('disconnected', () => {
  console.warn('[Database] MongoDB connection lost. Attempting reconnection...');
});

mongoose.connection.on('error', (err) => {
  console.error('[Database] Runtime mongoose connection error:', err);
});
