import { AxiosInstance } from "axios";

export const uploadService = {
  uploadImage: async (axios: AxiosInstance, payload: any) => {
    const res = await axios.post("/api/v1/upload", payload);
    return res.data.data;
  },
};
