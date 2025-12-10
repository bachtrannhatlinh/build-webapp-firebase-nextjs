"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useChatRoom } from "@/hooks/useChat";
import { usePresence } from "@/hooks/useRealtime";
import {
  ChatRoomList,
  ChatMessages,
  ChatInput,
  ChatHeader,
  NewChatDialog,
} from "@/components/chat";
import { cn } from "@/lib/utils";

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);

  // Initialize presence tracking
  usePresence();

  // Get room from URL
  useEffect(() => {
    const roomId = searchParams.get("room");
    if (roomId) {
      setSelectedRoomId(roomId);
      setShowSidebar(false);
    }
  }, [searchParams]);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  const {
    room,
    messages,
    typingUsers,
    loading: roomLoading,
    inputValue,
    setInputValue,
    sendMessage,
  } = useChatRoom(selectedRoomId);

  const handleSelectRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
    setShowSidebar(false);
    router.push(`/chat?room=${roomId}`, { scroll: false });
  };

  const handleBack = () => {
    setShowSidebar(true);
    setSelectedRoomId(null);
    router.push("/chat", { scroll: false });
  };

  const handleChatCreated = (roomId: string) => {
    handleSelectRoom(roomId);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar - Chat List */}
      <div
        className={cn(
          "flex h-full w-full flex-col border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 md:w-80 lg:w-96",
          showSidebar ? "block" : "hidden md:block"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-700">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Messages
          </h1>
          <button
            onClick={() => router.push("/")}
            className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <svg
              className="h-5 w-5 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <NewChatDialog onChatCreated={handleChatCreated} />
        </div>

        {/* Chat Room List */}
        <div className="flex-1 overflow-y-auto">
          <ChatRoomList
            selectedRoomId={selectedRoomId}
            onSelectRoom={handleSelectRoom}
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div
        className={cn(
          "flex flex-1 flex-col",
          !showSidebar ? "block" : "hidden md:flex"
        )}
      >
        {selectedRoomId ? (
          <>
            <ChatHeader
              room={room}
              currentUserId={user.uid}
              onBack={handleBack}
            />

            <ChatMessages
              messages={messages}
              currentUserId={user.uid}
              typingUsers={typingUsers}
            />

            <ChatInput
              value={inputValue}
              onChange={setInputValue}
              onSend={sendMessage}
              disabled={roomLoading}
            />
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="rounded-full bg-gradient-to-br from-blue-500 to-purple-500 p-6">
              <svg
                className="h-12 w-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">
              Your Messages
            </h2>
            <p className="mt-2 max-w-sm text-slate-500 dark:text-slate-400">
              Select a conversation from the sidebar or start a new chat to
              begin messaging.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
