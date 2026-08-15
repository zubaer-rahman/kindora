import { AxiosInstance } from "axios";

export const rosterService = {
  createShift: async (axios: AxiosInstance, payload: any) => {
    const res = await axios.post("/api/v1/rosters/shifts", payload);
    return res.data.data;
  },

  updateShift: async (axios: AxiosInstance, shiftId: string, payload: any) => {
    const res = await axios.patch(`/api/v1/rosters/shifts/${shiftId}`, payload);
    return res.data.data;
  },

  deleteShift: async (axios: AxiosInstance, shiftId: string) => {
    const res = await axios.delete(`/api/v1/rosters/shifts/${shiftId}`);
    return res.data.data;
  },

  assignVolunteer: async (axios: AxiosInstance, shiftId: string, volunteerId: string) => {
    const res = await axios.post(`/api/v1/rosters/shifts/${shiftId}/assign`, { volunteerId });
    return res.data.data;
  },

  removeVolunteer: async (axios: AxiosInstance, shiftId: string, volunteerId: string) => {
    const res = await axios.delete(`/api/v1/rosters/shifts/${shiftId}/assign`, {
      data: { volunteerId },
    });
    return res.data.data;
  },

  updateShiftStatus: async (axios: AxiosInstance, shiftId: string, status: string) => {
    const res = await axios.patch(`/api/v1/rosters/shifts/${shiftId}/status`, { status });
    return res.data.data;
  },

  signupShift: async (axios: AxiosInstance, shiftId: string) => {
    const res = await axios.post(`/api/v1/rosters/shifts/${shiftId}/signup`);
    return res.data.data;
  },

  withdrawShift: async (axios: AxiosInstance, shiftId: string) => {
    const res = await axios.post(`/api/v1/rosters/shifts/${shiftId}/withdraw`);
    return res.data.data;
  },

  getShiftsForOpportunity: async (axios: AxiosInstance, opportunityId: string) => {
    const res = await axios.get(`/api/v1/rosters/opportunity/${opportunityId}/shifts`);
    return res.data.data;
  },
};
