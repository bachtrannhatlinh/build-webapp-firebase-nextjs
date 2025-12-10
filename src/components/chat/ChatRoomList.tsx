"use client";

import { useChatRooms } from "@/hooks/useChat";
import { useAuth } from "@/contexts/AuthContext";
import { ChatRoom } from "@/lib/chat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "@/lib/utils";

interface ChatRoomListProps {
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
}

export function ChatRoomList({ selectedRoomId, onSelectRoom }: ChatRoomListProps) {
  const { rooms, loading } = useChatRooms();
  const { user } = useAuth();

  if (loading) {
    return (
      <div className="space-y-2 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="rounded-full bg-slate-100 p-4 dark:bg-slate-800">
          <svg
            className="h-8 w-8 text-slate-400"
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
        <h3 className="mt-4 font-medium text-slate-900 dark:text-white">
          No conversations yet
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Start a new chat to begin messaging
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {rooms.map((room) => (
        <ChatRoomItem
          key={room.id}
          room={room}
          currentUserId={user?.uid || ""}
          isSelected={selectedRoomId === room.id}
          onClick={() => onSelectRoom(room.id)}
        />
      ))}
    </div>
  );
}

interface ChatRoomItemProps {
  room: ChatRoom;
  currentUserId: string;
  isSelected: boolean;
  onClick: () => void;
}

function ChatRoomItem({ room, currentUserId, isSelected, onClick }: ChatRoomItemProps) {
  const unreadCount = room.unreadCount[currentUserId] || 0;
  
  // Get display name and photo
  let displayName = room.name;
  let displayPhoto: string | null = null;

  if (room.type === "private") {
    const partnerId = room.participants.find((id) => id !== currentUserId);
    if (partnerId) {
      displayName = room.participantNames[partnerId] || "Unknown";
      displayPhoto = room.participantPhotos[partnerId];
    }
  }

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${
        isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""
      }`}
    >
      <div className="relative">
        <Avatar className="h-12 w-12">
          <AvatarImage src={displayPhoto || undefined} alt={displayName} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
        {room.type === "group" && (
          <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-xs dark:bg-slate-700">
            {room.participants.length}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <h4 className={`truncate font-medium ${unreadCount > 0 ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"}`}>
            {displayName}
          </h4>
          {room.lastMessageTime && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {formatDistanceToNow(room.lastMessageTime?.toDate?.() || new Date())}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <p className={`truncate text-sm ${unreadCount > 0 ? "font-medium text-slate-700 dark:text-slate-300" : "text-slate-500 dark:text-slate-400"}`}>
            {room.lastMessage || "No messages yet"}
          </p>
          {unreadCount > 0 && (
            <Badge className="ml-2 bg-blue-500 text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </button>
  );
}
