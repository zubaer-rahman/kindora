"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { trpc } from "@/utils/trpc";
import { formatDistanceToNow } from "date-fns";
import { History, Bell, Users, User } from "lucide-react";
import type { Notification, UserInfo } from "@/types/notification";

export function NotificationHistory() {
  const [isOpen, setIsOpen] = useState(false);

  // Get notification history
  const { data: history, isLoading, refetch } = trpc.notifications.getNotificationHistory.useQuery(
    undefined,
    { enabled: isOpen }
  );

  const handleRefresh = () => {
    refetch();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <History className="h-4 w-4" />
          History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification History
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* User Info */}
          {history?.userInfo && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                User Information
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><strong>Name:</strong> {history.userInfo.name}</div>
                <div><strong>Email:</strong> {history.userInfo.email}</div>
                <div><strong>Role:</strong> {history.userInfo.role}</div>
                <div><strong>Organization ID:</strong> {history.userInfo.organization_profile || 'None'}</div>
              </div>
            </div>
          )}

          {/* Your Notifications */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Your Notifications ({history?.userNotifications?.length || 0})
              </h3>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
                Refresh
              </Button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : history?.userNotifications?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No notifications found for your account.
              </div>
            ) : (
              <div className="space-y-3">
                {history?.userNotifications?.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 border rounded-lg ${
                      !notification.isRead ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{notification.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          <span>Type: {notification.type}</span>
                          <span>Created: {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
                          <span>Status: {notification.isRead ? 'Read' : 'Unread'}</span>
                        </div>
                        {notification.data && (
                          <div className="mt-2 p-2 bg-white rounded border text-xs">
                            <strong>Data:</strong> {JSON.stringify(notification.data, null, 2)}
                          </div>
                        )}
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* All Notifications (Admin Only) */}
          {history?.allNotifications && history.allNotifications.length > 0 && (
            <div className="mt-6 border-t pt-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Users className="h-4 w-4" />
                All System Notifications ({history.allNotifications.length})
              </h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {history.allNotifications.map((notification) => {
                  const typedNotification = notification as Notification & { user: UserInfo };
                  return (
                    <div
                      key={typedNotification._id}
                      className="p-3 border rounded-lg bg-gray-50 text-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{typedNotification.title}</h4>
                          <p className="text-gray-600 mt-1">{typedNotification.message}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                            <span>User: {typedNotification.user?.name || 'Unknown'} ({typedNotification.user?.email})</span>
                            <span>Role: {typedNotification.user?.role}</span>
                            <span>Type: {typedNotification.type}</span>
                            <span>Created: {formatDistanceToNow(new Date(typedNotification.createdAt), { addSuffix: true })}</span>
                          </div>
                        </div>
                        {!typedNotification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 