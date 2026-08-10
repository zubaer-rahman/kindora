/* eslint-disable @typescript-eslint/no-explicit-any */
import { Feedback } from '../db/models/feedback';
import { AppError } from '../lib/errors.js';
import {
  CreateFeedbackInput,
  GetFeedbackQuery,
} from '../validators/feedback.validator.js';

// Cast model to avoid Mongoose union-type generic issues with .find() overloads
const FeedbackModel = Feedback as any;

export async function createFeedback(userId: string, input: CreateFeedbackInput) {
  const feedback = new FeedbackModel({
    userId,
    message: input.message,
  });

  await feedback.save();

  return {
    success: true,
    message: 'Feedback submitted successfully',
    feedback: {
      _id: feedback._id,
      message: feedback.message,
      createdAt: feedback.createdAt,
    },
  };
}

export async function getAllFeedback(
  userId: string,
  role: string,
  input: GetFeedbackQuery,
) {
  if (!role || role !== 'admin') {
    throw new AppError(403, 'Admin access required');
  }

  const { page, limit } = input;
  const skip = (page - 1) * limit;

  const [feedback, total] = await Promise.all([
    FeedbackModel.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    FeedbackModel.countDocuments(),
  ]);

  return {
    feedback,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

export async function getMyFeedback(userId: string, input: GetFeedbackQuery) {
  const { page, limit } = input;
  const skip = (page - 1) * limit;

  const [feedback, total] = await Promise.all([
    FeedbackModel.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    FeedbackModel.countDocuments({ userId }),
  ]);

  return {
    feedback,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}