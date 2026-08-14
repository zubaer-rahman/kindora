import mongoose from 'mongoose';
import env from './env.js';

const connectToDatabase = async () => {
  if (mongoose.connection.readyState >= 1) return;

  try {
    if (!env.mongodb_uri) {
      throw new Error('MONGODB_URI is not set');
    }

    await mongoose.connect(env.mongodb_uri, {
      maxPoolSize: 100,
      minPoolSize: 0,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 30000,
      heartbeatFrequencyMS: 10000,
      retryWrites: true,
      retryReads: true,
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      setTimeout(() => {
        connectToDatabase();
      }, 5000);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Retrying connection...');
      setTimeout(() => {
        connectToDatabase();
      }, 5000);
    });

    mongoose.connection.on('connected', () => {
    });

  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

let dbPromise: Promise<void> | null = null;

export default async function connectDB() {
  if (!dbPromise) {
    dbPromise = connectToDatabase();
  }
  return dbPromise;
}