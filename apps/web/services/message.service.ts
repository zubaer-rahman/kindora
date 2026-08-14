import { AxiosInstance } from "axios";
import { IMessage } from "@/types/api/message";

export const messageService = {
  getMessages: async (
    axios: AxiosInstance,
    selectedUserId: string,
    pageParam?: string
  ) => {
    const res = await axios.get(`/api/v1/messages/conversation/${selectedUserId}`, {
      params: { limit: 20, cursor: pageParam },
    });
    return res.data.data;
  },

  getGroupMessages: async (
    axios: AxiosInstance,
    groupId: string,
    pageParam?: string
  ) => {
    const res = await axios.get(`/api/v1/messages/groups/${groupId}/messages`, {
      params: { limit: 20, cursor: pageParam },
    });
    return res.data.data;
  },

  setTypingStatus: async (
    axios: AxiosInstance,
    payload: { targetId: string; isTyping: boolean; isGroup: boolean }
  ) => {
    const res = await axios.post("/api/v1/messages/typing", payload);
    return res.data.data;
  },

  sendMessage: async (
    axios: AxiosInstance,
    payload: { receiverId: string; content?: string; attachments?: any[] }
  ): Promise<IMessage> => {
    const res = await axios.post<{ data: IMessage }>("/api/v1/messages", payload);
    return res.data.data;
  },

  sendGroupMessage: async (
    axios: AxiosInstance,
    payload: { groupId: string; content?: string; attachments?: any[] }
  ): Promise<IMessage> => {
    const res = await axios.post<{ data: IMessage }>(
      `/api/v1/messages/groups/${payload.groupId}/messages`,
      { content: payload.content, attachments: payload.attachments }
    );
    return res.data.data;
  },

  getConversations: async (axios: AxiosInstance) => {
    const res = await axios.get("/api/v1/messages/conversations");
    return res.data.data;
  },

  getGroups: async (axios: AxiosInstance) => {
    const res = await axios.get("/api/v1/messages/groups");
    return res.data.data;
  },

  markAsRead: async (axios: AxiosInstance, conversationId: string) => {
    const res = await axios.patch(`/api/v1/messages/conversation/${conversationId}/read`);
    return res.data.data;
  },
};
