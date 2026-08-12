import axios from "axios";

export const SIGNUP_SUCCESS_UNVERIFIED = "SIGNUP_SUCCESS_UNVERIFIED";
export const EMAIL_ALREADY_REGISTERED = "EMAIL_ALREADY_REGISTERED";

const authApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

interface RegisterUserPayload {
  name: string;
  email: string;
  password: string;
  role: string;
  referred_by?: string;
}

interface RegisterUserResponse {
  success: boolean;
  message: string;
  data: {
    code?: string;
    message?: string;
  };
}

interface ApiErrorInfo {
  code?: string;
  message?: string;
}

export async function checkEmailUniqueness(
  email: string,
  signal?: AbortSignal,
): Promise<boolean> {
  const res = await authApi.post<{ data: { isTaken: boolean } }>(
    "/api/v1/auth/check-email",
    { email },
    { signal },
  );
  return res.data.data.isTaken;
}

export async function registerUser(
  payload: RegisterUserPayload,
): Promise<RegisterUserResponse> {
  const res = await authApi.post<RegisterUserResponse>(
    "/api/v1/auth/register",
    payload,
  );
  return res.data;
}

export function getApiError(error: unknown): ApiErrorInfo {
  if (axios.isAxiosError(error)) {
    return {
      code: error.response?.data?.code,
      message: error.response?.data?.message,
    };
  }
  return error instanceof Error ? { message: error.message } : {};
}

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  const info = getApiError(error);
  return info.message || fallback;
}
