export interface Notification {
  _id: string;
  user: string | UserInfo;
  type: string;
  title: string;
  message: string;
  opportunity_id?: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserInfo {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
}

export interface NotificationHistoryResponse {
  userNotifications: Notification[];
  allNotifications: (Notification & { user: UserInfo })[];
  userInfo: {
    name: string;
    email: string;
    role: string;
    organization_profile?: string;
  };
} 