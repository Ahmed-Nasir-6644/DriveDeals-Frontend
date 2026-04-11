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

  const chatBoxRef = useRef<HTMLDivElement>(null);

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
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

  // Socket initialization
  useEffect(() => {
    const newSocket: Socket = io(`${import.meta.env.VITE_BACKEND_URL}`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Join/leave chat room
  useEffect(() => {
    if (!socket || !chatId) return;

    socket.emit("join_chat_room", chatId);

    return () => {
      socket.emit("leave_room", chatId);
    };
  }, [socket, chatId]);

  // Receive messages
  useEffect(() => {
    if (!socket) return;

    const handleReceive = (msg: Message) => setMessages((prev) => [...prev, msg]);
    socket.on("receive_message", handleReceive);

    return () => {
      socket.off("receive_message", handleReceive);
    };
  }, [socket]);

  // Load chat history
  useEffect(() => {
    if (!userId || !receiverId) return;

    const fetchHistory = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/chat/history?user1=${userId}&user2=${receiverId}`);
        const msgs: Message[] = await res.json();
        setMessages(msgs);
      } catch (err) {
        // Silent error
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId, receiverId]);

  // Auto scroll
  useEffect(() => {
    chatBoxRef.current?.scrollTo({ top: chatBoxRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Send message
  const sendMessage = () => {
    if (!socket || !userId || !receiverId || !input.trim()) return;

    const msg: Message = { senderId: userId, receiverId, text: input };
    socket.emit("send_message", { ...msg, chatId });
    setMessages((prev) => [...prev, msg]);
    setInput("");
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
