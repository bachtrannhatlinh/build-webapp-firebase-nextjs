"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  ChatRoom,
  Message,
  TypingStatus,
  subscribeToChatRooms,
  subscribeToMessages,
  subscribeToTypingStatus,
  sendMessage as sendChatMessage,
  createPrivateChat,
  createGroupChat,
  markMessagesAsRead,
  setTypingStatus,
  getChatRoom,
} from "@/lib/chat";
import { useDebounce } from "./useRealtime";

// Hook for chat rooms list
export function useChatRooms() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setRooms([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const unsubscribe = subscribeToChatRooms(user.uid, (newRooms) => {
        setRooms(newRooms);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, [user?.uid]);

  const startPrivateChat = useCallback(
    async (
      targetUserId: string,
      targetUserName: string,
      targetUserPhoto: string | null
    ) => {
      if (!user) throw new Error("User not authenticated");

      return createPrivateChat(
        user.uid,
        user.displayName || "Anonymous",
        user.photoURL,
        targetUserId,
        targetUserName,
        targetUserPhoto
      );
    },
    [user]
  );

  const startGroupChat = useCallback(
    async (
      name: string,
      participantIds: string[],
      participantNames: Record<string, string>,
      participantPhotos: Record<string, string | null>
    ) => {
      if (!user) throw new Error("User not authenticated");

      return createGroupChat(
        name,
        user.uid,
        participantIds,
        { ...participantNames, [user.uid]: user.displayName || "Anonymous" },
        { ...participantPhotos, [user.uid]: user.photoURL }
      );
    },
    [user]
  );

  return {
    rooms,
    loading,
    error,
    startPrivateChat,
    startGroupChat,
  };
}

// Hook for a single chat room with messages
export function useChatRoom(roomId: string | null) {
  const { user } = useAuth();
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const [inputValue, setInputValue] = useState("");
  const debouncedInput = useDebounce(inputValue, 300);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load room data
  useEffect(() => {
    if (!roomId) {
      setRoom(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    getChatRoom(roomId)
      .then(setRoom)
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [roomId]);

  // Subscribe to messages
  useEffect(() => {
    if (!roomId) {
      setMessages([]);
      return;
    }

    const unsubscribe = subscribeToMessages(roomId, setMessages);
    return () => unsubscribe();
  }, [roomId]);

  // Subscribe to typing status
  useEffect(() => {
    if (!roomId || !user) {
      setTypingUsers([]);
      return;
    }

    const unsubscribe = subscribeToTypingStatus(roomId, user.uid, setTypingUsers);
    return () => unsubscribe();
  }, [roomId, user?.uid]);

  // Mark messages as read when entering room
  useEffect(() => {
    if (roomId && user) {
      markMessagesAsRead(roomId, user.uid).catch(console.error);
    }
  }, [roomId, user?.uid, messages.length]);

  // Handle typing indicator
  useEffect(() => {
    if (!roomId || !user || !inputValue) return;

    setTypingStatus(roomId, user.uid, user.displayName || "Anonymous", true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setTypingStatus(roomId, user.uid, user.displayName || "Anonymous", false);
    }, 2000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [debouncedInput, roomId, user?.uid, user?.displayName]);

  const sendMessage = useCallback(
    async (
      text: string,
      type: "text" | "image" | "file" = "text",
      fileUrl?: string,
      fileName?: string
    ) => {
      if (!roomId || !user) throw new Error("Cannot send message");

      await sendChatMessage(
        roomId,
        user.uid,
        user.displayName || "Anonymous",
        user.photoURL,
        text,
        type,
        fileUrl,
        fileName
      );

      setInputValue("");
      
      // Stop typing indicator
      setTypingStatus(roomId, user.uid, user.displayName || "Anonymous", false);
    },
    [roomId, user]
  );

  const getChatPartner = useCallback(() => {
    if (!room || !user || room.type !== "private") return null;
    
    const partnerId = room.participants.find((id) => id !== user.uid);
    if (!partnerId) return null;

    return {
      id: partnerId,
      name: room.participantNames[partnerId],
      photo: room.participantPhotos[partnerId],
    };
  }, [room, user]);

  return {
    room,
    messages,
    typingUsers,
    loading,
    error,
    inputValue,
    setInputValue,
    sendMessage,
    getChatPartner,
  };
}

// Hook for total unread messages count
export function useUnreadMessagesCount() {
  const { rooms } = useChatRooms();
  const { user } = useAuth();
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    if (!user) {
      setTotalUnread(0);
      return;
    }

    const count = rooms.reduce((total, room) => {
      return total + (room.unreadCount[user.uid] || 0);
    }, 0);

    setTotalUnread(count);
  }, [rooms, user?.uid]);

  return totalUnread;
}
