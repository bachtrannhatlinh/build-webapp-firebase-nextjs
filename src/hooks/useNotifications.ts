"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getFCMToken,
  saveTokenToFirestore,
  removeTokenFromFirestore,
  onForegroundMessage,
  requestNotificationPermission,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type Notification,
} from "@/lib/messaging";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface UseNotificationsReturn {
  isSupported: boolean;
  permission: NotificationPermission;
  fcmToken: string | null;
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  requestPermission: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  unsubscribe: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsSupported("Notification" in window && "serviceWorker" in navigator);
      setPermission(Notification.permission);
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    if (!user?.uid) return;

    setIsLoading(true);
    try {
      const data = await getUserNotifications(user.uid);
      setNotifications(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch notifications"));
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      refreshNotifications();
    } else {
      setNotifications([]);
    }
  }, [user?.uid, refreshNotifications]);

  useEffect(() => {
    if (!isSupported || permission !== "granted") return;

    const unsubscribe = onForegroundMessage((payload) => {
      const data = payload as {
        notification?: { title?: string; body?: string };
        data?: Record<string, string>;
      };

      if (data.notification) {
        toast(data.notification.title, {
          description: data.notification.body,
        });
      }

      refreshNotifications();
    });

    return () => {
      unsubscribe();
    };
  }, [isSupported, permission, refreshNotifications]);

  const requestPermission = useCallback(async () => {
    if (!user?.uid) {
      setError(new Error("User must be logged in to enable notifications"));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newPermission = await requestNotificationPermission();
      setPermission(newPermission);

      if (newPermission === "granted") {
        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        if (!vapidKey) {
          throw new Error("VAPID key not configured");
        }

        const token = await getFCMToken(vapidKey);
        if (token) {
          setFcmToken(token);
          await saveTokenToFirestore(user.uid, token);
          toast.success("Notifications enabled successfully!");
        }
      } else if (newPermission === "denied") {
        toast.error("Notification permission denied");
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to enable notifications");
      setError(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to mark notification as read"));
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!user?.uid) return;

    try {
      await markAllNotificationsAsRead(user.uid);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to mark all notifications as read"));
    }
  }, [user?.uid]);

  const unsubscribe = useCallback(async () => {
    if (!user?.uid || !fcmToken) return;

    try {
      await removeTokenFromFirestore(user.uid, fcmToken);
      setFcmToken(null);
      toast.success("Notifications disabled");
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to disable notifications"));
    }
  }, [user?.uid, fcmToken]);

  return {
    isSupported,
    permission,
    fcmToken,
    notifications,
    unreadCount,
    isLoading,
    error,
    requestPermission,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
    unsubscribe,
  };
}
