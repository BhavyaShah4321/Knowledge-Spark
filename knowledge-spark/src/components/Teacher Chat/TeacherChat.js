import axios from 'axios';
import { Search, Send, User } from "lucide-react";
import React, { useEffect, useState } from 'react';

// 1. AUTH HEADER FUNCTION
const authHeader = () => {
    const userData = JSON.parse(localStorage.getItem("auth_token"));
    if (userData && userData.access_token) {
        return {
            Authorization: `Bearer ${userData.access_token}`,
        };
    }
    return {};
};

let loggedInUserId;

// 2. CHAT SERVER INTERACTION
const getUsers = async () => {
    try {
        const userData = JSON.parse(localStorage.getItem("auth_token"));
        loggedInUserId = userData.user.id; // Get the user ID correctly

        const response = await axios.post(
            "http://localhost:8000/api/chat/chatid-according-user/",
            {
                user_id: loggedInUserId // Use the correct variable here
            },
            { headers: authHeader() }
        );

        console.log("Logged In User ID:", loggedInUserId); // Now it will log correctly
        return response.data.data;
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
};




// 3. FETCH MESSAGES ACCORDING TO CHAT UUID
const getMessagesByChatUUID = async (uuid) => {
    try {
        const response = await axios.get(
            `http://localhost:8000/api/chat-message/chat-message-according-chat/?uuid=${uuid}`,
            { headers: authHeader() }
        );
        console.log("Full API Response:", response.data);

        // Safely returning the data array
        return response.data && response.data.data
            ? response.data
            : { data: [] };
    } catch (error) {
        console.error("Error fetching messages:", error);
        return { data: [] }; // Return empty array on error
    }
};


const TeacherChat = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [userSearch, setUserSearch] = useState('');
    const [messages, setMessages] = useState([]);

    // FETCH USERS ON COMPONENT MOUNT
    useEffect(() => {
        const fetchUsers = async () => {
            const data = await getUsers();
            const formattedUsers = data.map((chat) => ({
                id: chat.user_1,
                name: chat.user_1_username,
                status: 'online',
                lastMessage: 'Last message here...',
                uuid: chat.uuid
            }));
            setUsers(formattedUsers);
        };

        fetchUsers();
    }, []);

    // FETCH MESSAGES WHEN USER IS SELECTED
    useEffect(() => {
        const fetchMessages = async () => {
            if (selectedUser && selectedUser.uuid) {
                try {
                    const messagesData = await getMessagesByChatUUID(selectedUser.uuid);
                    console.log("API Response for Messages:", messagesData);

                    // Format messages and add alignment logic
                    const formattedMessages = messagesData.data.map((msg) => ({
                        sender: msg.sender_username,
                        text: msg.message,
                        isOwnMessage: msg.sender === loggedInUserId,
                        timestamp: new Date(msg.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                        })
                    }));
                    setMessages(formattedMessages);
                } catch (error) {
                    console.error("Error fetching messages:", error);
                }
            }
        };


        fetchMessages();
    }, [selectedUser]);

    const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(userSearch.toLowerCase())
    );

    const handleSendMessage = () => {
        if (newMessage.trim() !== '') {
            const newMsg = {
                sender: 'me',
                text: newMessage,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prevMessages => [...prevMessages, newMsg]);
            setNewMessage('');
        }
    };

    return (
        <div className="chat-container">
            <div className="sidebar">
                <div className="search-header">
                    <div className="search-container">
                        <Search className="search-icon" size={20} />
                        <input
                            className="search-input"
                            placeholder="Search conversations..."
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="users-list">
                    {filteredUsers.map((user) => (
                        <div
                            key={user.id}
                            className={`user-item ${selectedUser?.id === user.id ? 'active' : ''}`}
                            onClick={() => setSelectedUser(user)}
                        >
                            <div className="avatar-container">
                                <div className="avatar">
                                    <User size={24} color="#6b7280" />
                                </div>
                                {/* <div className={`status-indicator ${user.status === 'online' ? 'status-online' : 'status-offline'}`} /> */}
                            </div>
                            <div className="user-info">
                                <div className="user-name">{user.name}</div>
                                <div className="last-message">{user.lastMessage}</div>
                            </div>
                            <span className="timestamp">12:34 PM</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="chat-area">
                {selectedUser ? (
                    <>
                        <div className="chat-header">
                            <div className="chat-header-content">
                                <div className="avatar">
                                    <User size={24} color="#6b7280" />
                                </div>
                                <div className="user-info">
                                    <div className="user-name">{selectedUser.name}</div>
                                    {/* <div className="last-message">
                                        <span className={`status-indicator ${selectedUser.status === 'online' ? 'status-online' : 'status-offline'}`} />
                                        {selectedUser.status === 'online' ? 'Online' : 'Offline'}
                                    </div> */}
                                </div>
                            </div>
                        </div>

                        <div className="message-container">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`message-item ${msg.isOwnMessage ? 'right' : 'left'}`}
                                >
                                    <div className="message-bubble">
                                        {msg.text}
                                    </div>
                                    <span className="timestamp">{msg.timestamp}</span>
                                </div>
                            ))}
                        </div>

                        <div className="input-area">
                            <div className="input-container">
                                <input
                                    className="message-input"
                                    placeholder="Type your message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                />
                                <button className="send-button" onClick={handleSendMessage}>
                                    <Send size={20} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="empty-state">
                        <div>
                            <User className="empty-state-icon" />
                            <p>Select a conversation to start messaging</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherChat;
