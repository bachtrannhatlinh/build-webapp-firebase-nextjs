"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { QueryConstraint } from "firebase/firestore";
import {
  subscribeToCollection,
  subscribeToDocument,
  subscribeToUserData,
  subscribeToChanges,
  PresenceManager,
  subscribeToNotifications,
  subscribeToUnreadNotifications,
  RealtimeNotification,
} from "@/lib/realtime";
import { useAuth } from "@/contexts/AuthContext";

// Hook for subscribing to a collection with realtime updates
export function useRealtimeCollection<T extends { id: string }>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  enabled: boolean = true
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const unsubscribe = subscribeToCollection<T>(
        collectionName,
        (newData) => {
          setData(newData);
          setLoading(false);
        },
        constraints
      );

      return () => unsubscribe();
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, [collectionName, enabled, JSON.stringify(constraints)]);

  return { data, loading, error };
}

// Hook for subscribing to a single document
export function useRealtimeDocument<T>(
  collectionName: string,
  documentId: string | null,
  enabled: boolean = true
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled || !documentId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const unsubscribe = subscribeToDocument<T>(
        collectionName,
        documentId,
        (newData) => {
          setData(newData);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, [collectionName, documentId, enabled]);

  return { data, loading, error };
}

// Hook for subscribing to user-specific data
export function useUserData<T extends { id: string }>(
  collectionName: string,
  additionalConstraints: QueryConstraint[] = []
) {
  const { user } = useAuth();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const unsubscribe = subscribeToUserData<T>(
        collectionName,
        user.uid,
        (newData) => {
          setData(newData);
          setLoading(false);
        },
        additionalConstraints
      );

      return () => unsubscribe();
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, [collectionName, user?.uid, JSON.stringify(additionalConstraints)]);

  return { data, loading, error };
}

// Hook for real-time changes with callbacks
export function useRealtimeChanges<T extends { id: string }>(
  collectionName: string,
  onAdded?: (data: T) => void,
  onModified?: (data: T) => void,
  onRemoved?: (id: string) => void,
  constraints: QueryConstraint[] = [],
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = subscribeToChanges<T>(
      collectionName,
      onAdded || (() => {}),
      onModified || (() => {}),
      onRemoved || (() => {}),
      constraints
    );

    return () => unsubscribe();
  }, [collectionName, enabled, JSON.stringify(constraints)]);
}

// Hook for managing user presence (online/offline status)
export function usePresence() {
  const { user } = useAuth();
  const presenceManagerRef = useRef<PresenceManager | null>(null);

  useEffect(() => {
    if (!user) {
      if (presenceManagerRef.current) {
        presenceManagerRef.current.stopPresence();
        presenceManagerRef.current = null;
      }
      return;
    }

    presenceManagerRef.current = new PresenceManager(user.uid);
    presenceManagerRef.current.startPresence();

    return () => {
      if (presenceManagerRef.current) {
        presenceManagerRef.current.stopPresence();
      }
    };
  }, [user?.uid]);
}

// Hook for notifications
export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribeNotifications = subscribeToNotifications(
      user.uid,
      (newNotifications) => {
        setNotifications(newNotifications);
        setLoading(false);
      }
    );

    const unsubscribeUnread = subscribeToUnreadNotifications(
      user.uid,
      setUnreadCount
    );

    return () => {
      unsubscribeNotifications();
      unsubscribeUnread();
    };
  }, [user?.uid]);

  const markAsRead = useCallback(async (notificationId: string) => {
    const { doc, updateDoc } = await import("firebase/firestore");
    const { db } = await import("@/lib/firebase");
    
    await updateDoc(doc(db, "notifications", notificationId), {
      read: true,
    });
  }, []);

  const markAllAsRead = useCallback(async () => {
    const { doc, updateDoc } = await import("firebase/firestore");
    const { db } = await import("@/lib/firebase");
    
    const unreadNotifications = notifications.filter(n => !n.read);
    await Promise.all(
      unreadNotifications.map(n =>
        updateDoc(doc(db, "notifications", n.id), { read: true })
      )
    );
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
  };
}

// Hook for debounced value (useful for typing indicators)
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
