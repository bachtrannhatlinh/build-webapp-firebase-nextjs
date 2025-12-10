"use client";

import { ChatRoom } from "@/lib/chat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  room: ChatRoom | null;
  currentUserId: string;
  onBack?: () => void;
  onInfo?: () => void;
}

export function ChatHeader({ room, currentUserId, onBack, onInfo }: ChatHeaderProps) {
  if (!room) {
    return (
      <div className="flex h-16 items-center border-b border-slate-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-900">
        <h2 className="font-medium text-slate-500 dark:text-slate-400">
          Select a conversation
        </h2>
      </div>
    );
  }

  let displayName = room.name;
  let displayPhoto: string | null = null;
  let subtitle = "";

  if (room.type === "private") {
    const partnerId = room.participants.find((id) => id !== currentUserId);
    if (partnerId) {
      displayName = room.participantNames[partnerId] || "Unknown";
      displayPhoto = room.participantPhotos[partnerId];
    }
  } else {
    subtitle = `${room.participants.length} members`;
  }

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onBack}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Button>
        )}

        <Avatar className="h-10 w-10">
          <AvatarImage src={displayPhoto || undefined} alt={displayName} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div>
          <h2 className="font-medium text-slate-900 dark:text-white">
            {displayName}
          </h2>
          {subtitle && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-full">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
        </Button>

        <Button variant="ghost" size="icon" className="rounded-full">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </Button>

        {onInfo && (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={onInfo}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </Button>
        )}
      </div>
    </div>
  );
}
