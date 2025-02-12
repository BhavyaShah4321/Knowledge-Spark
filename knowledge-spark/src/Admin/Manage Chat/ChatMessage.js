import { message, Spin } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";

function ChatMessage({ chatUuid }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chatUuid) {
      console.log("chatUuid is missing. Skipping API call.");
      setLoading(false);
      return;
    }

    console.log("Fetching messages for chatUuid:", chatUuid);

    const authData = JSON.parse(localStorage.getItem("auth_token"));
    const accessToken = authData?.access_token;

    if (!accessToken) {
      message.error("Unauthorized. Please log in again.");
      return;
    }

    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/chat-message/chat-message-according-chat/?uuid=${chatUuid}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        console.log("API Response:", response.data);

        if (response.data.success) {
          setMessages(response.data.data);
        } else {
          message.error("Failed to fetch messages.");
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        message.error("Error fetching chat messages.");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [chatUuid]);

  return (
    <div className="chat-box">
      {loading ? (
        <Spin size="large" />
      ) : messages.length > 0 ? (
        messages.map((msg, index) => {
          const isRightAligned = index % 2 === 0; // First message is right, then alternate

          return (
            <div
              key={msg.id}
              className={`message ${isRightAligned ? "right-message" : "left-message"}`}
            >
              <p className="message-text">{msg.message}</p>
              <span className="message-meta">
                <strong>{msg.sender_username}</strong> • {new Date(msg.created_at).toLocaleTimeString()}
              </span>
            </div>
          );
        })
      ) : (
        <p>No messages found.</p>
      )}
    </div>
  );
}

export default ChatMessage;
