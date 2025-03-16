import { message, Spin } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";

function ChatMessage({ chatUuid }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const authData = JSON.parse(localStorage.getItem("auth_token"));
  const accessToken = authData?.access_token;
  const loggedInUserId = authData?.user_id;

  useEffect(() => {
    if (!chatUuid) {
      console.log("chatUuid is missing. Skipping API call.");
      setLoading(false);
      return;
    }

    console.log("Fetching messages for chatUuid:", chatUuid);

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
  }, [chatUuid, accessToken]);

  // Get the first sender ID from messages if it exists
  const firstSenderId = messages.length > 0 ? messages[0].sender : null;

  return (
    <div className="chat-box">
      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      ) : messages.length > 0 ? (
        messages.map((msg) => {
          // Check if this message is from the first sender
          const isFirstSender = parseInt(msg.sender) === parseInt(firstSenderId);
          
          return (
            <div
              key={msg.id}
              className={`message-container ${isFirstSender ? "first-sender-container" : "other-sender-container"}`}
            >
              <div className={`message ${isFirstSender ? "first-sender-message" : "other-sender-message"}`}>
                <p className="message-text">{msg.message}</p>
                <span className="message-meta">
                  <strong>{msg.sender_username}</strong> • {new Date(msg.created_at).toLocaleTimeString()}
                </span>
              </div>
            </div>
          );
        })
      ) : (
        <p className="no-messages">No messages found.</p>
      )}
    </div>
  );
}

export default ChatMessage;