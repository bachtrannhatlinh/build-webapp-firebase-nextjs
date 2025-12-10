"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useChatRooms } from "@/hooks/useChat";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
}

interface NewChatDialogProps {
  onChatCreated: (roomId: string) => void;
}

export function NewChatDialog({ onChatCreated }: NewChatDialogProps) {
  const { user } = useAuth();
  const { startPrivateChat, startGroupChat } = useChatRooms();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isGroup, setIsGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Load all users when dialog opens
  useEffect(() => {
    if (!open) {
      setSearch("");
      setUsers([]);
      setSelectedUsers([]);
      setIsGroup(false);
      setGroupName("");
      return;
    }

    const loadAllUsers = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, limit(50));
        const snapshot = await getDocs(q);
        
        const foundUsers: User[] = [];
        snapshot.forEach((doc) => {
          const userData = doc.data();
          foundUsers.push({
            uid: doc.id,
            displayName: doc.id === user.uid 
              ? `${userData.displayName || "You"} (Saved Messages)` 
              : (userData.displayName || "Anonymous"),
            email: userData.email || "",
            photoURL: userData.photoURL,
          });
        });
        
        setAllUsers(foundUsers);
        setUsers(foundUsers);
      } catch (error) {
        console.error("Load users failed:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAllUsers();
  }, [open, user]);

  // Filter users based on search
  useEffect(() => {
    if (!search.trim()) {
      setUsers(allUsers);
      return;
    }

    const filtered = allUsers.filter(
      (u) =>
        u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );
    setUsers(filtered);
  }, [search, allUsers]);

  const handleSelectUser = (selectedUser: User) => {
    if (isGroup) {
      const isSelected = selectedUsers.some((u) => u.uid === selectedUser.uid);
      if (isSelected) {
        setSelectedUsers(selectedUsers.filter((u) => u.uid !== selectedUser.uid));
      } else {
        setSelectedUsers([...selectedUsers, selectedUser]);
      }
    } else {
      setSelectedUsers([selectedUser]);
    }
  };

  const handleCreate = async () => {
    if (selectedUsers.length === 0) return;

    setCreating(true);
    try {
      let roomId: string;

      if (isGroup && selectedUsers.length > 1) {
        const participantNames: Record<string, string> = {};
        const participantPhotos: Record<string, string | null> = {};
        
        selectedUsers.forEach((u) => {
          participantNames[u.uid] = u.displayName;
          participantPhotos[u.uid] = u.photoURL;
        });

        roomId = await startGroupChat(
          groupName || `Group (${selectedUsers.length + 1})`,
          selectedUsers.map((u) => u.uid),
          participantNames,
          participantPhotos
        );
      } else {
        const targetUser = selectedUsers[0];
        roomId = await startPrivateChat(
          targetUser.uid,
          targetUser.displayName,
          targetUser.photoURL
        );
      }

      setOpen(false);
      onChatCreated(roomId);
    } catch (error) {
      console.error("Failed to create chat:", error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
          <svg
            className="mr-2 h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Chat
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start a New Chat</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Group Toggle */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="group"
              checked={isGroup}
              onCheckedChange={(checked) => setIsGroup(checked as boolean)}
            />
            <Label htmlFor="group">Create group chat</Label>
          </div>

          {/* Group Name */}
          {isGroup && (
            <Input
              placeholder="Group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          )}

          {/* Search */}
          <Input
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((u) => (
                <div
                  key={u.uid}
                  className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                >
                  {u.displayName}
                  <button
                    onClick={() => handleSelectUser(u)}
                    className="ml-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* User List */}
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              </div>
            ) : users.length === 0 ? (
              <div className="py-4 text-center">
                <p className="text-sm text-slate-500">
                  {search ? "No users match your search" : "No other users registered yet"}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Invite friends to join and start chatting!
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {users.map((u) => {
                  const isSelected = selectedUsers.some(
                    (selected) => selected.uid === u.uid
                  );
                  const initials = u.displayName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <button
                      key={u.uid}
                      onClick={() => handleSelectUser(u)}
                      className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${
                        isSelected
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : ""
                      }`}
                    >
                      <Avatar>
                        <AvatarImage src={u.photoURL || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900 dark:text-white">
                          {u.displayName}
                        </p>
                        <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                          {u.email}
                        </p>
                      </div>
                      {isSelected && (
                        <svg
                          className="h-5 w-5 text-blue-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Create Button */}
          <Button
            className="w-full"
            onClick={handleCreate}
            disabled={selectedUsers.length === 0 || creating}
          >
            {creating ? "Creating..." : "Start Chat"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
