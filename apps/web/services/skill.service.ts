import { AxiosInstance } from "axios";

export const skillService = {
  createSkill: async (axios: AxiosInstance, name: string) => {
    const res = await axios.post("/api/v1/skills", { name });
    return res.data.data;
  },

  getSkills: async (axios: AxiosInstance, search: string = "") => {
    const res = await axios.get("/api/v1/skills/multi-select", { params: { search } });
    return res.data.data;
  },

  initializeSkills: async (axios: AxiosInstance) => {
    const res = await axios.post("/api/v1/skills/initialize");
    return res.data.data;
  },
};
