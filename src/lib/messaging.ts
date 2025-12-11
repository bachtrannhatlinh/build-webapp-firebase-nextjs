import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";
import app from "./firebase";
import { db } from "./firebase";
import { doc, setDoc, deleteDoc, collection, query, where, getDocs, orderBy, limit, Timestamp } from "firebase/firestore";

let messaging: Messaging | null = null;

export const getMessagingInstance = (): Messaging | null => {
  if (typeof window === "undefined") return null;
  
  if (!messaging) {
    try {
      messaging = getMessaging(app);
    } catch (error) {
      console.error("Failed to initialize messaging:", error);
      return null;
    }
  }
  return messaging;
};

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    console.warn("Service workers are not supported");
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
      scope: "/",
    });
    console.log("Service Worker registered:", registration);

    if (registration.active) {
      registration.active.postMessage({
        type: "FIREBASE_CONFIG",
        config: firebaseConfig,
      });
    }

    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      newWorker?.addEventListener("statechange", () => {
        if (newWorker.state === "activated") {
          newWorker.postMessage({
            type: "FIREBASE_CONFIG",
            config: firebaseConfig,
          });
        }
      });
    });

    return registration;
  } catch (error) {
    console.error("Service Worker registration failed:", error);
    return null;
  }
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    console.warn("Notifications are not supported");
    return "denied";
  }

  const permission = await Notification.requestPermission();
  console.log("Notification permission:", permission);
  return permission;
};

export const getFCMToken = async (vapidKey: string): Promise<string | null> => {
  const messagingInstance = getMessagingInstance();
  if (!messagingInstance) return null;

  try {
    const registration = await registerServiceWorker();
    if (!registration) return null;

    const token = await getToken(messagingInstance, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log("FCM Token:", token);
      return token;
    } else {
      console.warn("No FCM token available");
      return null;
    }
  } catch (error) {
    console.error("Error getting FCM token:", error);
    return null;
  }
};

export const saveTokenToFirestore = async (
  userId: string,
  token: string
): Promise<void> => {
  try {
    const tokenRef = doc(db, "fcmTokens", `${userId}_${token.slice(-10)}`);
    await setDoc(tokenRef, {
      userId,
      token,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      platform: getPlatformInfo(),
    }, { merge: true });
    console.log("FCM token saved to Firestore");
  } catch (error) {
    console.error("Error saving FCM token:", error);
    throw error;
  }
};

export const removeTokenFromFirestore = async (
  userId: string,
  token: string
): Promise<void> => {
  try {
    const tokenRef = doc(db, "fcmTokens", `${userId}_${token.slice(-10)}`);
    await deleteDoc(tokenRef);
    console.log("FCM token removed from Firestore");
  } catch (error) {
    console.error("Error removing FCM token:", error);
    throw error;
  }
};

export const onForegroundMessage = (
  callback: (payload: unknown) => void
): (() => void) => {
  const messagingInstance = getMessagingInstance();
  if (!messagingInstance) {
    console.warn("Messaging not available");
    return () => {};
  }

  return onMessage(messagingInstance, (payload) => {
    console.log("Foreground message received:", payload);
    callback(payload);
  });
};

const getPlatformInfo = (): string => {
  if (typeof window === "undefined") return "unknown";
  
  const userAgent = navigator.userAgent;
  if (/Android/i.test(userAgent)) return "android-web";
  if (/iPhone|iPad|iPod/i.test(userAgent)) return "ios-web";
  if (/Windows/i.test(userAgent)) return "windows-web";
  if (/Mac/i.test(userAgent)) return "mac-web";
  if (/Linux/i.test(userAgent)) return "linux-web";
  return "web";
};

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  data?: Record<string, string>;
  createdAt: Timestamp;
}

export const getUserNotifications = async (
  userId: string,
  limitCount: number = 50
): Promise<Notification[]> => {
  try {
    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Notification[];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    const notificationRef = doc(db, "notifications", notificationId);
    await setDoc(notificationRef, { read: true, readAt: Timestamp.now() }, { merge: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  try {
    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("userId", "==", userId),
      where("read", "==", false)
    );
    
    const snapshot = await getDocs(q);
    const updates = snapshot.docs.map((document) =>
      setDoc(doc(db, "notifications", document.id), { read: true, readAt: Timestamp.now() }, { merge: true })
    );
    
    await Promise.all(updates);
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};
