import axios, { AxiosInstance } from "axios";
import { IMentorProfile } from "@/types/api/mentor-profile";
import { IVolunteerProfile } from "@/types/api/volunteer-profile";

export const SIGNUP_SUCCESS_UNVERIFIED = "SIGNUP_SUCCESS_UNVERIFIED";
export const EMAIL_ALREADY_REGISTERED = "EMAIL_ALREADY_REGISTERED";

const publicAuthApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface RegisterUserPayload {
  name: string;
  email: string;
  password: string;
  role: string;
  referred_by?: string;
}

export interface RegisterUserResponse {
  success: boolean;
  message: string;
  data: {
    code?: string;
    message?: string;
  };
}

export interface ApiErrorInfo {
  code?: string;
  message?: string;
}

export const authService = {
  patchUserProfile: async (
    axios: AxiosInstance,
    payload: { mentor_profile?: string; volunteer_profile?: string }
  ) => {
    const res = await axios.patch("/api/v1/users/me", payload);
    return res.data;
  },

  createMentorProfile: async (
    axios: AxiosInstance,
    payload: Partial<IMentorProfile>
  ): Promise<IMentorProfile> => {
    const res = await axios.post<{ data: IMentorProfile }>("/api/v1/users/me/mentor-profile", payload);
    return res.data.data;
  },

  createVolunteerProfile: async (
    axios: AxiosInstance,
    payload: Partial<IVolunteerProfile>
  ): Promise<IVolunteerProfile> => {
    const res = await axios.post<{ data: IVolunteerProfile }>("/api/v1/users/me/volunteer-profile", payload);
    return res.data.data;
  },

  checkEmailUniqueness: async (email: string, signal?: AbortSignal): Promise<boolean> => {
    const res = await publicAuthApi.post<{ data: { isTaken: boolean } }>(
      "/api/v1/auth/check-email",
      { email },
      { signal },
    );
    return res.data.data.isTaken;
  },

  registerUser: async (payload: RegisterUserPayload): Promise<RegisterUserResponse> => {
    const res = await publicAuthApi.post<RegisterUserResponse>(
      "/api/v1/auth/register",
      payload,
    );
    return res.data;
  },

  getApiError: (error: unknown): ApiErrorInfo => {
    if (axios.isAxiosError(error)) {
      return {
        code: error.response?.data?.code,
        message: error.response?.data?.message,
      };
    }
    return error instanceof Error ? { message: error.message } : {};
  },

  getApiErrorMessage: (error: unknown, fallback = "Something went wrong. Please try again."): string => {
    const info = authService.getApiError(error);
    return info.message || fallback;
  }
};
