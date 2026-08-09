import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/mongoose'; // Adjust path if necessary
import { initializeCronJobs } from './services/init-cron'; // Keep the cron initialization

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
connectDB().catch(console.error);

// Initialize cron jobs
if (process.env.NODE_ENV !== 'test') {
  initializeCronJobs();
}

// Healthcheck Route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Express server is running' });
});

// TODO: Define API Routes here
// app.use('/api/v1/auth', authRouter);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
});
