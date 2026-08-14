import { AxiosInstance } from "axios";

export const feedbackService = {
  createFeedback: async (axios: AxiosInstance, payload: { message: string }) => {
    const res = await axios.post("/api/v1/feedback", payload);
    return res.data.data;
  },
};
