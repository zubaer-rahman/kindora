import { ApiError } from '@/lib/exceptions';

export const errorHandler = (error: unknown) => {
  if (error instanceof ApiError) {
    return {
      statusCode: error.statusCode,
      message: error.message,
    };
  }

  if (error instanceof Error) {
    return {
      statusCode: 500,  
      message: error.message,
    };
  }

  return {
    statusCode: 500,  
    message: 'An unknown error occurred',
  };
};
