// src/components/ChatButton.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/ChatButton.module.css"; // standalone CSS
import { useAuth } from "../context/AuthContext";

interface ChatButtonProps {
  ownerId: number;
}

const ChatButton: React.FC<ChatButtonProps> = ({ ownerId }) => {
  const { email } = useAuth();
  const navigate = useNavigate();
  const [loggedInUserId, setLoggedInUserId] = useState<number | null>(null);

  // Fetch logged-in user ID
  useEffect(() => {
    if (!email) return;

    fetch(`${import.meta.env.VITE_BACKEND_URL}/users/get-by-email?email=${email}`)
      .then((res) => res.json())
      .then((data) => setLoggedInUserId(data.id))
      .catch((err) => console.error("Error fetching logged-in user:", err));
  }, [email]);

  const handleClick = () => {
    if (!loggedInUserId || !ownerId) return;

    // chatId format: smallerId-largerId
    const chatId =
      loggedInUserId < ownerId
        ? `${loggedInUserId}-${ownerId}`
        : `${ownerId}-${loggedInUserId}`;

    navigate(`/chat/${chatId}`);
  };

  return (
    <button className={styles.chatButton} onClick={handleClick}>
    💬 Chat with Seller
    </button>
  );
};

export default ChatButton;
