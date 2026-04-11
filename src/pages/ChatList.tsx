import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "../styles/ChatList.module.css";
import { useAuth } from "../context/AuthContext";
import {io} from "socket.io-client"
const socket = io(`${import.meta.env.VITE_BACKEND_URL}`)

interface Chat {
  chatId: string;
  otherUserId: number;
  otherUserName: string;
  otherUserInitials: string;
  last_message: string;
  updated_at: string;
  unread?: boolean;
}

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  text: string;
  created_at: string;
  senderEmail: string;
  receiverEmail: string;
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

const ChatList: React.FC = () => {
  const { email } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [userCache, setUserCache] = useState<Record<number, User>>({});

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Utility function to format relative time (handles GMT from database)
  const getRelativeTime = (dateString: string): string => {
    try {
      // Parse the timestamp from database (UTC)
      const date = new Date(dateString);
      const now = new Date();

      // Calculate difference in milliseconds
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      // Format date in user's local timezone
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch (error) {
      return "Unknown";
    }
  };

  // Utility function to get initials
  const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  // Fetch user by ID
  const fetchUserData = async (userId: number): Promise<User | null> => {
    if (userCache[userId]) {
      return userCache[userId];
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/${userId}`);
      const userData: User = await res.json();
      setUserCache((prev) => ({ ...prev, [userId]: userData }));
      return userData;
    } catch (err) {
      return null;
    }
  };

  // Get logged-in user ID
  useEffect(() => {
    if (!email) return;
    setLoading(true);
    fetch(`${import.meta.env.VITE_BACKEND_URL}/users/get-by-email?email=${email}`)
      .then((res) => res.json())
      .then((data) => {
        setUserId(data.id);
        setUserCache((prev) => ({ ...prev, [data.id]: data }));
      })
      .catch(() => {
        setLoading(false);
      });
  }, [email]);

  // Fetch chats
  useEffect(() => {
    if (!userId) return;

    fetch(`${import.meta.env.VITE_BACKEND_URL}/chat/user-chats?userId=${userId}`)
      .then((res) => res.json())
      .then(async (messages: Message[]) => {
        const convMap: Record<number, Message> = {};

        messages.forEach((msg) => {
          const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;

          if (!convMap[otherUserId] || new Date(msg.created_at) > new Date(convMap[otherUserId].created_at)) {
            convMap[otherUserId] = msg;
          }
        });

        // Fetch user data for all other users in chats
        const userIds = Object.keys(convMap).map(Number);
        const promises = userIds.map((id) => fetchUserData(id));
        const usersData = await Promise.all(promises);

        const chatList: Chat[] = Object.entries(convMap).map(([otherUserId, msg], index) => {
          const userData = usersData[index];
          const fullName = userData ? `${userData.first_name} ${userData.last_name}` : msg.senderId === userId ? msg.receiverEmail : msg.senderEmail;
          const initials = userData ? getInitials(userData.first_name, userData.last_name) : "??";

          return {
            chatId: `${Math.min(userId, Number(otherUserId))}-${Math.max(userId, Number(otherUserId))}`,
            otherUserId: Number(otherUserId),
            otherUserName: fullName,
            otherUserInitials: initials,
            last_message: msg.text,
            updated_at: msg.created_at,
            unread: msg.senderId !== userId && !msg.text.includes("read"),
          };
        });

        chatList.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        setChats(chatList);
        chatList.forEach(chat => {
          socket.emit("join_chat_room", chat.chatId);
        });
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [userId]);
  useEffect(() => {
    if (!socket || !userId) return;

    const handleReceive = async (msg: Message) => {
      const chatId = `${Math.min(msg.senderId, msg.receiverId)}-${Math.max(msg.senderId, msg.receiverId)}`;
      const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;

      // Fetch user data if not cached
      const userData = await fetchUserData(otherUserId);
      const fullName = userData ? `${userData.first_name} ${userData.last_name}` : msg.senderId === userId ? msg.receiverEmail : msg.senderEmail;
      const initials = userData ? getInitials(userData.first_name, userData.last_name) : "??";

      setChats((prevChats) => {
        const chatExists = prevChats.find((c) => c.chatId === chatId);

        if (chatExists) {
          return prevChats.map((c) =>
            c.chatId === chatId
              ? {
                  ...c,
                  last_message: msg.text,
                  updated_at: msg.created_at,
                  unread: msg.senderId !== userId,
                }
              : c
          ).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        } else {
          const newChat: Chat = {
            chatId,
            otherUserId,
            otherUserName: fullName,
            otherUserInitials: initials,
            last_message: msg.text,
            updated_at: msg.created_at,
            unread: msg.senderId !== userId,
          };
          return [newChat, ...prevChats].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        }
      });
    };

    socket.on("receive_message", handleReceive);

    return () => {
      socket.off("receive_message", handleReceive);
    };
  }, [socket, userId]);


  if (!email || loading) return (
    <main className={styles.container}>
      <section className={styles.header}>
        <h1 className={styles.title}>Your Conversations</h1>
        <p className={styles.subtitle}>Chat with buyers and sellers</p>
      </section>
      <div className={styles.chatList}>
        <p className={styles.loadingText}>Loading conversations...</p>
      </div>
    </main>
  );

  return (
    <main className={styles.container}>
      <section className={styles.header}>
        <h1 className={styles.title}>Your Conversations</h1>
        <p className={styles.subtitle}>Chat with buyers and sellers</p>
      </section>

      <div className={styles.chatList}>
        {chats.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>💬</div>
            <p className={styles.emptyTitle}>No conversations yet</p>
            <p className={styles.emptySubtitle}>Start chatting with buyers and sellers to see your conversations here</p>
          </div>
        ) : (
          chats.map((chat) => (
            <Link to={`/chat/${chat.chatId}`} key={chat.chatId} className={styles.chatCard}>
              <div className={styles.avatar} title={chat.otherUserName}>
                {chat.otherUserInitials}
              </div>
              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.userName}>{chat.otherUserName}</h3>
                  <span className={styles.time}>{getRelativeTime(chat.updated_at)}</span>
                </div>
                <p className={styles.lastMessage}>{chat.last_message}</p>
              </div>
              {chat.unread && <div className={styles.unreadIndicator} />}
            </Link>
          ))
        )}
      </div>
    </main>
  );
};

export default ChatList;
