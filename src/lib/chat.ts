import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  getDoc,
  getDocs,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "./firebase";

// Types
export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderPhoto: string | null;
  chatRoomId: string;
  createdAt: Timestamp;
  readBy: string[];
  type: "text" | "image" | "file";
  fileUrl?: string;
  fileName?: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: "private" | "group";
  participants: string[];
  participantNames: Record<string, string>;
  participantPhotos: Record<string, string | null>;
  lastMessage: string;
  lastMessageTime: Timestamp;
  lastMessageSenderId: string;
  createdAt: Timestamp;
  createdBy: string;
  unreadCount: Record<string, number>;
}

export interface TypingStatus {
  odUserId: string;
  userName: string;
  isTyping: boolean;
  timestamp: Timestamp;
}

// ============ CHAT ROOMS ============

export async function createPrivateChat(
  user1Id: string,
  user1Name: string,
  user1Photo: string | null,
  user2Id: string,
  user2Name: string,
  user2Photo: string | null
): Promise<string> {
  const existingRoom = await findPrivateChat(user1Id, user2Id);
  if (existingRoom) {
    return existingRoom.id;
  }

  const chatRoom: Omit<ChatRoom, "id"> = {
    name: "",
    type: "private",
    participants: [user1Id, user2Id],
    participantNames: {
      [user1Id]: user1Name,
      [user2Id]: user2Name,
    },
    participantPhotos: {
      [user1Id]: user1Photo,
      [user2Id]: user2Photo,
    },
    lastMessage: "",
    lastMessageTime: serverTimestamp() as Timestamp,
    lastMessageSenderId: "",
    createdAt: serverTimestamp() as Timestamp,
    createdBy: user1Id,
    unreadCount: {
      [user1Id]: 0,
      [user2Id]: 0,
    },
  };

  const docRef = await addDoc(collection(db, "chatRooms"), chatRoom);
  return docRef.id;
}

export async function createGroupChat(
  name: string,
  creatorId: string,
  participantIds: string[],
  participantNames: Record<string, string>,
  participantPhotos: Record<string, string | null>
): Promise<string> {
  const allParticipants = [...new Set([creatorId, ...participantIds])];
  
  const unreadCount: Record<string, number> = {};
  allParticipants.forEach(id => {
    unreadCount[id] = 0;
  });

  const chatRoom: Omit<ChatRoom, "id"> = {
    name,
    type: "group",
    participants: allParticipants,
    participantNames,
    participantPhotos,
    lastMessage: "",
    lastMessageTime: serverTimestamp() as Timestamp,
    lastMessageSenderId: "",
    createdAt: serverTimestamp() as Timestamp,
    createdBy: creatorId,
    unreadCount,
  };

  const docRef = await addDoc(collection(db, "chatRooms"), chatRoom);
  return docRef.id;
}

async function findPrivateChat(user1Id: string, user2Id: string): Promise<ChatRoom | null> {
  const q = query(
    collection(db, "chatRooms"),
    where("type", "==", "private"),
    where("participants", "array-contains", user1Id)
  );

  const snapshot = await getDocs(q);
  
  for (const doc of snapshot.docs) {
    const room = { id: doc.id, ...doc.data() } as ChatRoom;
    if (room.participants.includes(user2Id)) {
      return room;
    }
  }

  return null;
}

export function subscribeToChatRooms(
  userId: string,
  callback: (rooms: ChatRoom[]) => void
) {
  const q = query(
    collection(db, "chatRooms"),
    where("participants", "array-contains", userId),
    orderBy("lastMessageTime", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const rooms: ChatRoom[] = [];
    snapshot.forEach((doc) => {
      rooms.push({ id: doc.id, ...doc.data() } as ChatRoom);
    });
    callback(rooms);
  });
}

export async function getChatRoom(roomId: string): Promise<ChatRoom | null> {
  const docRef = doc(db, "chatRooms", roomId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as ChatRoom;
  }
  
  return null;
}

// ============ MESSAGES ============

export async function sendMessage(
  chatRoomId: string,
  senderId: string,
  senderName: string,
  senderPhoto: string | null,
  text: string,
  type: "text" | "image" | "file" = "text",
  fileUrl?: string,
  fileName?: string
): Promise<string> {
  const message: Omit<Message, "id"> = {
    text,
    senderId,
    senderName,
    senderPhoto,
    chatRoomId,
    createdAt: serverTimestamp() as Timestamp,
    readBy: [senderId],
    type,
    ...(fileUrl && { fileUrl }),
    ...(fileName && { fileName }),
  };

  const docRef = await addDoc(collection(db, "messages"), message);

  // Update chat room with last message
  const roomRef = doc(db, "chatRooms", chatRoomId);
  const roomSnap = await getDoc(roomRef);
  
  if (roomSnap.exists()) {
    const roomData = roomSnap.data() as ChatRoom;
    const unreadCount = { ...roomData.unreadCount };
    
    // Increment unread count for all participants except sender
    roomData.participants.forEach(participantId => {
      if (participantId !== senderId) {
        unreadCount[participantId] = (unreadCount[participantId] || 0) + 1;
      }
    });

    await updateDoc(roomRef, {
      lastMessage: type === "text" ? text : `[${type}] ${fileName || "file"}`,
      lastMessageTime: serverTimestamp(),
      lastMessageSenderId: senderId,
      unreadCount,
    });
  }

  return docRef.id;
}

export function subscribeToMessages(
  chatRoomId: string,
  callback: (messages: Message[]) => void,
  limitCount: number = 50
) {
  const q = query(
    collection(db, "messages"),
    where("chatRoomId", "==", chatRoomId),
    orderBy("createdAt", "asc"),
    limit(limitCount)
  );

  return onSnapshot(q, (snapshot) => {
    const messages: Message[] = [];
    snapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() } as Message);
    });
    callback(messages);
  });
}

export async function markMessagesAsRead(
  chatRoomId: string,
  userId: string
) {
  const q = query(
    collection(db, "messages"),
    where("chatRoomId", "==", chatRoomId),
    where("senderId", "!=", userId)
  );

  const snapshot = await getDocs(q);
  
  const updatePromises = snapshot.docs.map(async (docSnap) => {
    const messageData = docSnap.data() as Message;
    if (!messageData.readBy.includes(userId)) {
      await updateDoc(doc(db, "messages", docSnap.id), {
        readBy: arrayUnion(userId),
      });
    }
  });

  await Promise.all(updatePromises);

  // Reset unread count for this user
  const roomRef = doc(db, "chatRooms", chatRoomId);
  await updateDoc(roomRef, {
    [`unreadCount.${userId}`]: 0,
  });
}

export async function deleteMessage(messageId: string) {
  await deleteDoc(doc(db, "messages", messageId));
}

// ============ TYPING INDICATOR ============

export async function setTypingStatus(
  chatRoomId: string,
  userId: string,
  userName: string,
  isTyping: boolean
) {
  const typingRef = doc(db, "chatRooms", chatRoomId, "typing", userId);
  
  if (isTyping) {
    await updateDoc(typingRef, {
      odUserId: userId,
      userName,
      isTyping: true,
      timestamp: serverTimestamp(),
    }).catch(async () => {
      const { setDoc } = await import("firebase/firestore");
      await setDoc(typingRef, {
        odUserId: userId,
        userName,
        isTyping: true,
        timestamp: serverTimestamp(),
      });
    });
  } else {
    await updateDoc(typingRef, {
      isTyping: false,
    }).catch(() => {});
  }
}

export function subscribeToTypingStatus(
  chatRoomId: string,
  currentUserId: string,
  callback: (typingUsers: TypingStatus[]) => void
) {
  const typingRef = collection(db, "chatRooms", chatRoomId, "typing");

  return onSnapshot(typingRef, (snapshot) => {
    const typingUsers: TypingStatus[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data() as TypingStatus;
      if (data.isTyping && data.odUserId !== currentUserId) {
        // Only show typing if updated within last 5 seconds
        const now = Timestamp.now();
        const diff = now.seconds - (data.timestamp?.seconds || 0);
        if (diff < 5) {
          typingUsers.push(data);
        }
      }
    });
    callback(typingUsers);
  });
}

// ============ ONLINE STATUS ============

export async function setUserOnlineStatus(userId: string, isOnline: boolean) {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    isOnline,
    lastSeen: serverTimestamp(),
  });
}

export function subscribeToUserOnlineStatus(
  userId: string,
  callback: (isOnline: boolean, lastSeen: Timestamp | null) => void
) {
  const userRef = doc(db, "users", userId);

  return onSnapshot(userRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      callback(data.isOnline || false, data.lastSeen || null);
    }
  });
}
