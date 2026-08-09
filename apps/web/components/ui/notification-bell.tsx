"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { trpc } from "@/utils/trpc";
import { formatDistanceToNow } from "date-fns";
// import { NotificationHistory } from "./notification-history";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const utils = trpc.useUtils();

  // Get unread notification count
  const { data: unreadCount } = trpc.notifications.getUnreadCount.useQuery(undefined, {
    refetchInterval: 60000, // Refetch every 60 seconds (relaxed since global subscription handles it)
  });

  // Get notifications when popover is open
  const { data: notificationsData } = trpc.notifications.getUserNotifications.useQuery(
    { page: 1, limit: 10, unreadOnly: false },
    { enabled: isOpen }
  );

  // Get notification history for debugging
  // const { data: notificationHistory, refetch: refetchHistory } = trpc.notifications.getNotificationHistory.useQuery(undefined, {
  //   enabled: false // Only fetch when needed
  // });

  // const handleShowHistory = () => {
  //   refetchHistory();
  //   console.log('📊 Notification History:', notificationHistory);
  // };

  // Debug logging removed

  // Mark notification as read mutation
  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.getUnreadCount.invalidate();
      utils.notifications.getUserNotifications.invalidate();
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.getUnreadCount.invalidate();
      utils.notifications.getUserNotifications.invalidate();
    },
  });

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const notifications = notificationsData?.notifications || [];
  const hasUnread = (unreadCount?.count || 0) > 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative p-0"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {hasUnread && (
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
              {unreadCount?.count || 0}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            <div className="flex gap-2">
              {/* <NotificationHistory /> */}
              {/* <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShowHistory}
                  className="text-xs"
                >
                  Debug
                </Button> */}
              {hasUnread && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={markAllAsReadMutation.isPending}
                >
                  Mark all read
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No notifications
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer ${!notification.isRead ? "bg-blue-50" : ""
                    }`}
                  onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
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
      </PopoverContent>
    </Popover>
  );
} 