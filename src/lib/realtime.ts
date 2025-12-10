import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  QueryConstraint,
  DocumentData,
  Query,
  CollectionReference,
} from "firebase/firestore";
import { db } from "./firebase";

// Generic realtime subscription for any collection
export function subscribeToCollection<T extends { id: string }>(
  collectionName: string,
  callback: (data: T[]) => void,
  constraints: QueryConstraint[] = []
) {
  const collectionRef = collection(db, collectionName);
  const q = constraints.length > 0 
    ? query(collectionRef, ...constraints)
    : collectionRef;

  return onSnapshot(q, (snapshot) => {
    const data: T[] = [];
    snapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() } as T);
    });
    callback(data);
  });
}

// Subscribe to a single document
export function subscribeToDocument<T>(
  collectionName: string,
  documentId: string,
  callback: (data: T | null) => void
) {
  const docRef = doc(db, collectionName, documentId);

  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() } as T);
    } else {
      callback(null);
    }
  });
}

// Subscribe to user-specific data
export function subscribeToUserData<T extends { id: string }>(
  collectionName: string,
  userId: string,
  callback: (data: T[]) => void,
  additionalConstraints: QueryConstraint[] = []
) {
  return subscribeToCollection<T>(
    collectionName,
    callback,
    [where("userId", "==", userId), ...additionalConstraints]
  );
}

// Subscribe with pagination support
export function subscribeWithPagination<T extends { id: string }>(
  collectionName: string,
  callback: (data: T[]) => void,
  pageSize: number = 20,
  orderByField: string = "createdAt",
  orderDirection: "asc" | "desc" = "desc"
) {
  return subscribeToCollection<T>(
    collectionName,
    callback,
    [
      orderBy(orderByField, orderDirection),
      limit(pageSize),
    ]
  );
}

// Subscribe to changes only (useful for notifications)
export function subscribeToChanges<T extends { id: string }>(
  collectionName: string,
  onAdded: (data: T) => void,
  onModified: (data: T) => void,
  onRemoved: (id: string) => void,
  constraints: QueryConstraint[] = []
) {
  const collectionRef = collection(db, collectionName);
  const q = constraints.length > 0 
    ? query(collectionRef, ...constraints)
    : collectionRef;

  return onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      const data = { id: change.doc.id, ...change.doc.data() } as T;
      
      switch (change.type) {
        case "added":
          onAdded(data);
          break;
        case "modified":
          onModified(data);
          break;
        case "removed":
          onRemoved(change.doc.id);
          break;
      }
    });
  });
}

// Presence system for online status
export class PresenceManager {
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  startPresence() {
    // Set online immediately
    this.setOnline(true);

    // Heartbeat every 30 seconds
    this.heartbeatInterval = setInterval(() => {
      this.setOnline(true);
    }, 30000);

    // Handle page visibility change
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", this.handleVisibilityChange);
    }

    // Handle page unload
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", this.handleUnload);
    }
  }

  stopPresence() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.setOnline(false);

    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    }

    if (typeof window !== "undefined") {
      window.removeEventListener("beforeunload", this.handleUnload);
    }
  }

  private handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      this.setOnline(true);
    } else {
      this.setOnline(false);
    }
  };

  private handleUnload = () => {
    this.setOnline(false);
  };

  private async setOnline(isOnline: boolean) {
    const { updateDoc, doc, serverTimestamp } = await import("firebase/firestore");
    const userRef = doc(db, "users", this.userId);
    
    try {
      await updateDoc(userRef, {
        isOnline,
        lastSeen: serverTimestamp(),
      });
    } catch (error) {
      console.error("Failed to update presence:", error);
    }
  }
}

// Notification subscription
export interface RealtimeNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: "message" | "mention" | "system";
  read: boolean;
  data?: Record<string, any>;
  createdAt: any;
}

export function subscribeToNotifications(
  userId: string,
  callback: (notifications: RealtimeNotification[]) => void
) {
  return subscribeToCollection<RealtimeNotification>(
    "notifications",
    callback,
    [
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(50),
    ]
  );
}

export function subscribeToUnreadNotifications(
  userId: string,
  callback: (count: number) => void
) {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    where("read", "==", false)
  );

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.size);
  });
}
