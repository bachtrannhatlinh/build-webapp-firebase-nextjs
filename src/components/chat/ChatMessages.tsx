"use client";

import { useEffect, useRef } from "react";
import { Message, TypingStatus } from "@/lib/chat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ChatMessagesProps {
  messages: Message[];
  currentUserId: string;
  typingUsers: TypingStatus[];
}

export function ChatMessages({ messages, currentUserId, typingUsers }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
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
          No messages yet
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Send a message to start the conversation
        </p>
      </div>
    );
  }

  // Group messages by date
  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <div key={date}>
          <div className="mb-4 flex items-center justify-center">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {date}
            </span>
          </div>
          
          {dateMessages.map((message, index) => {
            const isOwn = message.senderId === currentUserId;
            const showAvatar = !isOwn && 
              (index === 0 || dateMessages[index - 1]?.senderId !== message.senderId);
            
            return (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={isOwn}
                showAvatar={showAvatar}
              />
            );
          })}
        </div>
      ))}

      {typingUsers.length > 0 && (
        <TypingIndicator users={typingUsers} />
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
}

function MessageBubble({ message, isOwn, showAvatar }: MessageBubbleProps) {
  const initials = message.senderName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const time = message.createdAt?.toDate?.()
    ? new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      }).format(message.createdAt.toDate())
    : "";

  return (
    <div
      className={cn(
        "mb-2 flex items-end gap-2",
        isOwn ? "flex-row-reverse" : "flex-row"
      )}
    >
      {!isOwn && (
        <div className="w-8">
          {showAvatar && (
            <Avatar className="h-8 w-8">
              <AvatarImage src={message.senderPhoto || undefined} alt={message.senderName} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-xs text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      )}

      <div
        className={cn(
          "group max-w-[70%]",
          isOwn ? "items-end" : "items-start"
        )}
      >
        {!isOwn && showAvatar && (
          <p className="mb-1 ml-1 text-xs text-slate-500 dark:text-slate-400">
            {message.senderName}
          </p>
        )}

        <div
          className={cn(
            "rounded-2xl px-4 py-2",
            isOwn
              ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
              : "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
          )}
        >
          {message.type === "text" && <p className="break-words">{message.text}</p>}
          
          {message.type === "image" && (
            <div>
              <img
                src={message.fileUrl}
                alt="Image"
                className="max-h-64 rounded-lg"
              />
              {message.text && <p className="mt-2 break-words">{message.text}</p>}
            </div>
          )}

          {message.type === "file" && (
            <a
              href={message.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-current underline"
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
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              {message.fileName || "Download file"}
            </a>
          )}
        </div>

        <p
          className={cn(
            "mt-1 text-xs text-slate-400 opacity-0 transition-opacity group-hover:opacity-100",
            isOwn ? "mr-1 text-right" : "ml-1"
          )}
        >
          {time}
        </p>
      </div>
    </div>
  );
}

interface TypingIndicatorProps {
  users: TypingStatus[];
}

function TypingIndicator({ users }: TypingIndicatorProps) {
  const names = users.map((u) => u.userName).join(", ");
  const text = users.length === 1 
    ? `${names} is typing...`
    : `${names} are typing...`;

  return (
    <div className="mb-2 flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center">
        <div className="flex gap-1">
          <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
        </div>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400">{text}</p>
    </div>
  );
}

function groupMessagesByDate(messages: Message[]): Record<string, Message[]> {
  const groups: Record<string, Message[]> = {};

  messages.forEach((message) => {
    const date = message.createdAt?.toDate?.() || new Date();
    const dateStr = formatMessageDate(date);
    
    if (!groups[dateStr]) {
      groups[dateStr] = [];
    }
    groups[dateStr].push(message);
  });

  return groups;
}

function formatMessageDate(date: Date): string {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(date, now)) {
    return "Today";
  } else if (isSameDay(date, yesterday)) {
    return "Yesterday";
  } else {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    }).format(date);
  }
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}
