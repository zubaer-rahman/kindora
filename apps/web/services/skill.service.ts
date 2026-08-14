import { AxiosInstance } from "axios";

export const skillService = {
  createSkill: async (axios: AxiosInstance, name: string) => {
    const res = await axios.post("/api/v1/skills", { name });
    return res.data.data;
  },
};
