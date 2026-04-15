// src/pages/ChatPage.tsx
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import styles from "../styles/ChatPage.module.css";
import { useAuth } from "../context/AuthContext";

interface Message {
  id?: number;
  senderId: number;
  receiverId: number;
  text: string;
  created_at?: string;
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

const ChatPage: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { email } = useAuth();
  const navigate = useNavigate();

  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [receiverId, setReceiverId] = useState<number | null>(null);
  const [receiverData, setReceiverData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProduction, setIsProduction] = useState(false);
  const pollingIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastMessageCountRef = useRef(0);

  const chatBoxRef = useRef<HTMLDivElement>(null);

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Check if we're on production
  useEffect(() => {
    const production = import.meta.env.VITE_BACKEND_URL?.includes(".vercel.app");
    setIsProduction(!!production);
  }, []);

  // Format time for messages
  const formatMessageTime = (dateString?: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  // Get initials for avatar
  const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  // Get logged-in user ID
  useEffect(() => {
    if (!email) return;

    const fetchUserId = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/get-by-email?email=${email}`);
        const user = await res.json();
        setUserId(user.id);
      } catch (err) {
        // Silent error
      }
    };

    fetchUserId();
  }, [email]);

  // Parse receiver ID
  useEffect(() => {
    if (!userId || !chatId) return;
    const [id1, id2] = chatId.split("-").map(Number);
    setReceiverId(id1 === userId ? id2 : id1);
  }, [chatId, userId]);

  // Fetch receiver data
  useEffect(() => {
    if (!receiverId) return;

    const fetchReceiverData = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/${receiverId}`);
        const data = await res.json();
        setReceiverData(data);
      } catch (err) {
        // Silent error
      }
    };

    fetchReceiverData();
  }, [receiverId]);

  // Socket initialization (only for local development)
  useEffect(() => {
    if (isProduction) return;

    const newSocket: Socket = io(`${import.meta.env.VITE_BACKEND_URL}/chat`, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      timeout: 10000,
    });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isProduction]);

  // Join/leave chat room (Socket.IO - local only)
  useEffect(() => {
    if (!socket || !chatId || isProduction) return;

    socket.emit("join_chat_room", chatId);

    return () => {
      socket.emit("leave_room", chatId);
    };
  }, [socket, chatId, isProduction]);

  // Receive messages via Socket.IO (local only)
  useEffect(() => {
    if (!socket || isProduction) return;

    const handleReceive = (msg: Message) => setMessages((prev) => [...prev, msg]);
    socket.on("receive_message", handleReceive);

    return () => {
      socket.off("receive_message", handleReceive);
    };
  }, [socket, isProduction]);

  // Load chat history
  useEffect(() => {
    if (!userId || !receiverId) return;

    const fetchHistory = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/chat/history?user1=${userId}&user2=${receiverId}`
        );
        const msgs: Message[] = await res.json();
        setMessages(msgs);
        lastMessageCountRef.current = msgs.length;
      } catch (err) {
        // Silent error
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId, receiverId]);

  // Production polling setup
  useEffect(() => {
    if (!isProduction || !userId || !receiverId) return;

    const pollMessages = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/chat/history?user1=${userId}&user2=${receiverId}`
        );
        const msgs: Message[] = await res.json();

        // Only update if there are new messages
        if (msgs.length > lastMessageCountRef.current) {
          setMessages(msgs);
          lastMessageCountRef.current = msgs.length;
        }
      } catch (err) {
        // Silent error
      }
    };

    // Start polling every 2 seconds on production
    pollingIntervalRef.current = setInterval(pollMessages, 2000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [isProduction, userId, receiverId]);

  // Auto scroll
  useEffect(() => {
    chatBoxRef.current?.scrollTo({ top: chatBoxRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Send message
  const sendMessage = async () => {
    if (!userId || !receiverId || !input.trim()) return;

    const messageText = input;
    setInput("");

    // Optimistically add message to UI
    const optimisticMsg: Message = {
      senderId: userId,
      receiverId,
      text: messageText,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    lastMessageCountRef.current += 1;

    try {
      if (isProduction) {
        // REST API call for production
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/chat/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            senderId: userId,
            receiverId,
            text: messageText,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to send message");
        }
      } else if (socket) {
        // Socket.IO emit for local development
        socket.emit("send_message", {
          senderId: userId,
          receiverId,
          text: messageText,
          chatId,
        });
      }
    } catch (err) {
      console.error("Error sending message:", err);
      // Remove optimistic message on error
      setMessages((prev) => prev.slice(0, -1));
      lastMessageCountRef.current -= 1;
      // Restore input
      setInput(messageText);
    }
  };

  if (!userId || !receiverId) {
    return (
      <div className={styles.chatContainer}>
        <div className={styles.loadingState}>
          <p>Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chatContainer}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className={styles.headerContent}>
          <div className={styles.headerAvatar}>
            {receiverData ? getInitials(receiverData.first_name, receiverData.last_name) : "??"}
          </div>
          <div className={styles.headerInfo}>
            <h2 className={styles.headerTitle}>
              {receiverData ? `${receiverData.first_name} ${receiverData.last_name}` : "Loading..."}
            </h2>
            <p className={styles.headerSubtitle}>Active now</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {loading ? (
        <div className={styles.loadingState}>
          <p>Loading messages...</p>
        </div>
      ) : (
        <div ref={chatBoxRef} className={styles.chatBox}>
          {messages.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>💬</div>
              <p>Start a conversation!</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={msg.senderId === userId ? styles.messageGroup : styles.messageGroupTheirs}
              >
                <div
                  className={msg.senderId === userId ? styles.myMessage : styles.theirMessage}
                >
                  {msg.text}
                </div>
                <span className={styles.messageTime}>
                  {formatMessageTime(msg.created_at)}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Input Area */}
      <div className={styles.inputArea}>
        <input
          type="text"
          placeholder="Type a message..."
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          className={styles.sendBtn}
          onClick={sendMessage}
          disabled={!input.trim()}
        >
          <span>Send</span>
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
