export interface Feedback {
  _id: string;
  userId: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeedbackWithUser {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFeedbackInput {
  message: string;
}

export interface FeedbackPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface FeedbackResponse {
  feedback: Feedback[];
  pagination: FeedbackPagination;
}

export interface FeedbackWithUserResponse {
  feedback: FeedbackWithUser[];
  pagination: FeedbackPagination;
}