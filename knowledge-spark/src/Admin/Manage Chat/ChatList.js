import { List, Spin, message } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";

function ChatList() {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const authData = JSON.parse(localStorage.getItem("auth_token"));
                const accessToken = authData?.access_token;
                if (!accessToken) {
                    message.error("Unauthorized. Please log in again.");
                    return;
                }

                const response = await axios.get("http://localhost:8000/api/chat/", {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                if (response.data.success) {
                    setChats(response.data.data);
                } else {
                    message.error("Failed to fetch chats.");
                }
            } catch (error) {
                console.error("Error fetching chats:", error);
                message.error("Error fetching chat list.");
            } finally {
                setLoading(false);
            }
        };

        fetchChats();
    }, []);

    return (
        <div style={{ padding: "20px" }}>
            <h2>Chat List</h2>
            {loading ? (
                <Spin size="large" />
            ) : (
                <List
                    bordered
                    dataSource={chats}
                    renderItem={(chat) => (
                        <List.Item>
                            <strong>{chat.user_1_username}</strong> &amp; <strong>{chat.user_2_username}</strong>
                        </List.Item>
                    )}
                />
            )}
        </div>
    );
}

export default ChatList;
