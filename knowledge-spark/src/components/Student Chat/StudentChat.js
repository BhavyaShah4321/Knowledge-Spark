import { DeleteOutlined, SearchOutlined, SendOutlined, UserOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { message } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import React, { useEffect, useRef, useState, useCallback } from 'react';

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

const getUsers = async () => {
    try {
        const userData = JSON.parse(localStorage.getItem("auth_token"));
        loggedInUserId = userData.user.id;

        const response = await axios.post(
            "http://localhost:8000/api/chat/chatid-according-user/",
            { user_id: loggedInUserId },
            { headers: authHeader() }
        );

        const chats = response.data.results;

        return await Promise.all(chats.map(async (chat) => {
            const lastMessageResponse = await axios.get(
                `http://localhost:8000/api/chat-message/chat-message-according-chat/?uuid=${chat.uuid}`,
                { headers: authHeader() }
            );

            const messages = lastMessageResponse.data.data;
            const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

            const oppositeUserId = loggedInUserId === chat.user_1 ? chat.user_2 : chat.user_1;
            const oppositeUsername = loggedInUserId === chat.user_1 ? chat.user_2_username : chat.user_1_username;

            return {
                id: oppositeUserId,
                name: oppositeUsername,
                uuid: chat.uuid,
                chatId: chat.id,
                status: 'online',
                lastMessage: lastMessage ? lastMessage.message : 'No messages yet',
                lastTime: lastMessage ? new Date(lastMessage.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                }) : ''
            };
        }));
    } catch (error) {
        console.error("Error fetching users:", error);
        message.error("Failed to load conversations");
        return [];
    }
};

const StudentChat = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [userSearch, setUserSearch] = useState('');
    const [callUUID, setCallUUID] = useState(null);
    const [typingUser, setTypingUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    const messagesEndRef = useRef(null);
    const wsRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Get user data from localStorage on component mount
    useEffect(() => {
        const userDataFromStorage = JSON.parse(localStorage.getItem("auth_token"));
        if (userDataFromStorage) {
            setUserData(userDataFromStorage);
            loggedInUserId = userDataFromStorage.user.id;
        }
    }, []);

    const fetchUsers = useCallback(async () => {
        const data = await getUsers();
        setUsers(data);
    }, []);

    // Initial users fetch and periodic refresh
    useEffect(() => {
        fetchUsers();
        const interval = setInterval(fetchUsers, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, [fetchUsers]);

    // Fetch messages when user is selected
    // useEffect(() => {
    //     const fetchMessages = async () => {
    //         if (selectedUser?.uuid) {
    //             try {
    //                 const response = await axios.get(
    //                     `http://localhost:8000/api/chat-message/chat-message-according-chat/?uuid=${selectedUser.uuid}`,
    //                     { headers: authHeader() }
    //                 );

    //                 const formattedMessages = response.data.data.map((msg) => ({
    //                     sender: msg.sender_username,
    //                     text: msg.message,
    //                     content: msg.message,
    //                     username: msg.sender_username,
    //                     isOwnMessage: msg.sender === loggedInUserId,
    //                     timestamp: new Date(msg.created_at).toLocaleTimeString([], {
    //                         hour: '2-digit',
    //                         minute: '2-digit'
    //                     })
    //                 }));
    //                 setMessages(formattedMessages);
    //                 scrollToBottom();
    //             } catch (error) {
    //                 console.error("Error fetching messages:", error);
    //                 message.error("Failed to fetch messages");
    //             }
    //         }
    //     };
        
    //     fetchMessages();
        
    //     // Close previous WebSocket connection
    //     if (wsRef.current) {
    //         wsRef.current.close();
    //         setIsConnected(false);
    //     }
        
    //     if (selectedUser) {
    //         // Start a new WebSocket connection
    //         wsRef.current = wsConnection(selectedUser.chatId);
    //     }
    // }, [selectedUser]);

    // Auto-scroll when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;

    const wsConnection = (uuid) => {
        
        const protocol = window.location.protocol === "https:" ? "wss" : "ws";
        const token = JSON.parse(localStorage.getItem("auth_token"))?.access_token;
    
        // Using ChatId + Token in URL
        const ws = new WebSocket(`${protocol}://127.0.0.1:8001/ws/chat/${uuid}/`);
    
        // Handle connection events
        ws.onopen = () => {
            console.log('sWebSocket connection opened');
            setIsConnected(true);
            reconnectAttempts = 0;  // Reset attempts when connection opens
            
            // Send a ping message to keep the connection alive
            const pingInterval = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: 'ping' }));
                } else {
                    clearInterval(pingInterval);
                }
            }, 30000);
        };
    
        ws.onmessage = (event) => {
            try {
                const newMsg = JSON.parse(event.data);
                console.log("Received message:", newMsg);
                
                // Handle different message types
                handleIncomingMessage(newMsg);
                
                // Update user list to reflect new messages
                if (newMsg.type === 'chat') {
                    updateUserWithNewMessage(newMsg);
                }
            } catch (error) {
                console.error("Error parsing WebSocket message:", error);
            }
        };
    
        ws.onerror = (error) => {
            console.error("WebSocket Error:", error);
            setIsConnected(false);
        };
    
        ws.onclose = (event) => {
            console.warn("WebSocket Closed:", event.reason);
            setIsConnected(false);
    
            if (reconnectAttempts < maxReconnectAttempts) {
                const timeout = Math.min(1000 * 2 ** reconnectAttempts, 30000);
                console.log(`Reconnecting WebSocket in ${timeout / 1000}s... (Attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`);
    
                setTimeout(() => {
                    reconnectAttempts++;
                    if (selectedUser) {
                        wsRef.current = wsConnection(selectedUser.uuid);
                    }
                }, timeout);
            } else {
                console.error("🚨 Max reconnection attempts reached");
                message.error("Failed to connect to chat server after multiple attempts");
            }
        };
    
        return ws;
    };
    
    const updateUserWithNewMessage = (newMsg) => {
        // Update the last message in the user list
        setUsers(prevUsers => 
            prevUsers.map(user => {
                if (user.chatId === newMsg.conversation) {
                    return {
                        ...user,
                        lastMessage: newMsg.content,
                        lastTime: new Date().toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                        })
                    };
                }
                return user;
            })
        );
    };
    // const sendWebSocketMessage = (ws, userID, conversationId, userProfiePicture, userUsername) => {
    //     // card.style.display = "none";
    //     let content = document.getElementById("chat_input");
    //     if (content.value.trim() !== '') {
    //         ws.send(JSON.stringify({
    //             'type': 'chat',
    //             'sender': userID,
    //             'profile_picture': userProfiePicture,
    //             'conversation': conversationId,
    //             'username': userUsername,
    //             'content': content.value
    //         }));
    //         content.value = ' ';
    //         // scrolling();

    //     } else {
    //         // card.style.display = "flex";
    //         // card.style.borderLeft = "10px solid #3db5dc";
    //         // message_content.innerHTML = "Message should not be blank";
    //         // message_type.innerHTML = "Info";
    //         // message_type.style.color = "#3db5dc";
    //         // message_icon_parent.style.color = "#3db5dc";
    //         // message_icon_child.classList = "fas fa-exclamation-circle";
    //     }
    // };

    const sendWebSocketMessage = (ws, messageData) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            console.log("Message data Sended");
            
            ws.send(JSON.stringify(messageData));

            console.log("message Data sended succesfully", messageData);
            
            return true;

        } else {
            console.error("WebSocket is not connected");
            return false;
        }
    };

    // document.getElementById("message_close").addEventListener('click', () => {
    //     const card = document.getElementById("card");
    //     if (card) {
    //         card.style.display = "none"; // Hide the card
    //     }
    // });

    const handleTyping = () => {
        if (!userData || !selectedUser || !wsRef.current) return;
        
        // Clear any existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        
        // Send typing start event
        sendWebSocketMessage(wsRef.current, {
            'type': 'typing_start',
            'conversation': selectedUser.chatId,
            'sender': userData.user.id,
            'content': "",
            'profile_picture': userData.user.profile_picture || "/media/",
            'username': userData.user.username
        });
        
        // Set timeout to stop typing after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            sendWebSocketMessage(wsRef.current, {
                'type': 'typing_end',
                'sender': userData.user.id,
                'conversation': selectedUser.chatId,
                'content': "",
                'profile_picture': userData.user.profile_picture || "/media/",
                'username': userData.user.username
            });
        }, 20000);
    };

    const handleIncomingMessage = (message) => {
        if (message.type === 'chat') {
            // Format the incoming message
            const newMessage = {
                sender: message.username,
                text: message.content,
                content: message.content,
                isOwnMessage: message.sender === loggedInUserId,
                timestamp: new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                })
            };
            
            // Add message to the conversation
            setMessages(prevMessages => [...prevMessages, newMessage]);
            
            // If this is from another user and not currently selected, update unread count
            if (message.sender !== loggedInUserId) {
                // Could implement unread message counter here
            }
        } else if (message.type === 'typingstart') {
            // Show typing indicator if it's not from current user
            if (message.sender !== loggedInUserId) {
                setTypingUser(message);
            }
        } else if (message.type === 'typingend') {
            // Hide typing indicator
            if (typingUser && typingUser.sender === message.sender) {
                setTypingUser(null);
            }
        }
    };

    // const handleSendMessage = async () => {
    //     if (!newMessage.trim() || !selectedUser || !userData) return;

    //     // Create message data for WebSocket
    //     const messageData = {
    //         'type': 'chat',
    //         'sender': userData.user.id,
    //         'profile_picture': userData.user.profile_picture || "/media/",
    //         'conversation': selectedUser.chatId,
    //         'username': userData.user.username,
    //         'content': newMessage
    //     };

    //     // Optimistic UI Update (adds the message instantly)
    //     const newMessageObj = {
    //         sender: userData.user.username,
    //         text: newMessage,
    //         content: newMessage,
    //         isOwnMessage: true,
    //         timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    //     };
        
    //     setMessages(prevMessages => [...prevMessages, newMessageObj]);
        
    //     // Clear input and typing indicator
    //     setNewMessage('');
    //     if (typingTimeoutRef.current) {
    //         clearTimeout(typingTimeoutRef.current);
            
    //         // Send typing end event
    //         sendWebSocketMessage(wsRef.current, {
    //             'type': 'typingend',
    //             'sender': userData.user.id,
    //             'conversation': selectedUser.chatId,
    //             'content': "",
    //             'profile_picture': userData.user.profile_picture || "/media/",
    //             'username': userData.user.username
    //         });
    //     }
        
    //     // Send message via WebSocket
    //     const sent = sendWebSocketMessage(wsRef.current, messageData);
        
    //     // If WebSocket fails, show error
    //     if (!sent) {
    //         message.warning("Connection issue - message may not be delivered");
    //     }

    //     // Also send message to the API for persistence
    //     try {
    //         const messagePayload = {
    //             chatid: selectedUser.chatId,
    //             sender: loggedInUserId,
    //             message: newMessage,
    //         };
            
    //         await axios.post(
    //             "http://localhost:8000/api/chat-message/",
    //             messagePayload,
    //             { headers: authHeader() }
    //         );
            
    //         // Update the last message in the user list
    //         updateUserWithNewMessage(messageData);
            
    //     } catch (error) {
    //         console.error("Error sending message:", error);
    //         message.error("Failed to save message");
    //     }
        
    //     scrollToBottom();
    // };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    const handleDeleteChat = async (user, e) => {
        e.stopPropagation();
        try {
            await axios.delete(
                `http://localhost:8000/api/chat-message/${user.chatId}/`,
                { headers: authHeader() }
            );

            setUsers(prevUsers => prevUsers.filter(u => u.id !== user.id));

            if (selectedUser?.id === user.id) {
                setSelectedUser(null);
                setMessages([]);
                
                // Close WebSocket if connected
                if (wsRef.current) {
                    wsRef.current.close();
                    wsRef.current = null;
                }
            }

            message.success("Chat deleted successfully");
        } catch (error) {
            console.error("Error deleting chat:", error);
            message.error("Failed to delete chat");
        }
    };

    const fetchVideoCall = async () => {
        if (!selectedUser?.id || !userData) return;

        try {
            const auth_token = JSON.parse(localStorage.getItem('auth_token'));
            if (!auth_token?.access_token) {
                throw new Error("Please log in again");
            }

            const requestData = {
                teacher: userData.user.id,
                student: selectedUser.id,
                start: dayjs().format('DD/MM/YYYY HH:mm'),
            };

            console.log("Requesting Video Call:", requestData);
            const response = await axios.post(
                "http://localhost:8000/api/video-call/",
                requestData,
                { headers: authHeader() }
            );

            console.log("Video Call API Response:", response.data);

            if (response.data?.success && response.data.data?.uuid) {
                const uuid = response.data.data.uuid;
                setCallUUID(uuid);
                
                // Also send a message via WebSocket about the video call
                if (wsRef.current) {
                    sendWebSocketMessage(wsRef.current, {
                        'type': 'chat',
                        'sender': userData.user.id,
                        'profile_picture': userData.user.profile_picture || "/media/",
                        'conversation': selectedUser.chatId,
                        'username': userData.user.username,
                        'content': `A video call has been initiated. Please Click on Video Call Image.`
                    });
                }
                
                const messagePayload = {
                    chatid: selectedUser.chatId,
                    sender: userData.user.id,
                    message: `A video call has been initiated. Please Click on Video Call Image.`,
                };

                console.log("Sending Video Call Notification:", messagePayload);
                await axios.post(
                    "http://localhost:8000/api/chat-message/",
                    messagePayload,
                    { headers: authHeader() }
                );

                // Store the active call in local state or database for tracking
                localStorage.setItem("activeCallUUID", uuid);

                // Open the call for the teacher
                const videoCallUrl = `http://localhost:8000/video-call/${uuid}?token=${encodeURIComponent(auth_token.access_token)}`;
                window.open(videoCallUrl, '_blank');

            } else {
                throw new Error("Failed to start video call");
            }

        } catch (error) {
            console.error("Video call error:", error.response?.data || error.message);
            message.error(error.response?.data?.message || "Failed to start video call");
        }
    };

    const convertLinksToAnchorTags = (text) => {
        if (!text) return '';
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(
            urlRegex,
            (url) => {
                return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="chat-link">${url}</a>`;
            }
        );
    };

    const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(userSearch.toLowerCase())
    );

    return (
        <div className="chat-message-container">
            <div className="chat-message-sidebar">
                <div className="chat-message-search-header">
                    <div className="chat-message-search-container">
                        <SearchOutlined className="chat-message-search-icon" />
                        <input
                            className="chat-message-search-input"
                            placeholder="Search conversations..."
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="chat-message-users-list">
                    {filteredUsers.map((user) => (
                        <div
                            key={user.id}
                            className={`chat-message-user-item ${selectedUser?.id === user.id ? 'active' : ''}`}
                            onClick={() => setSelectedUser(user)}
                        >
                            <div className="chat-message-avatar-container">
                                <div className="chat-message-avatar">
                                    <UserOutlined className="chat-message-avatar-icon" />
                                </div>
                            </div>
                            <div className="chat-message-user-info">
                                <div className="chat-message-user-name">{user.name}</div>
                                <div className="chat-message-last-message">{user.lastMessage}</div>
                            </div>
                            <div className="chat-message-user-actions">
                                <span className="chat-message-timestamp">{user.lastTime}</span>
                                <button
                                    className="chat-message-delete-button"
                                    onClick={(e) => handleDeleteChat(user, e)}
                                >
                                    <DeleteOutlined className="chat-message-delete-button" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="chat-message-chat-area">
                {selectedUser ? (
                    <>
                        <div className="chat-message-chat-header">
                            <div className="chat-message-chat-header-content">
                                <div className="chat-message-avatar">
                                    <UserOutlined className="chat-message-avatar-icon" />
                                </div>
                                <div className="chat-message-user-info">
                                    <div className="chat-message-chatSide-user-name">
                                        {selectedUser.name}
                                    </div>
                                    <div className="connection-status">
                                        {isConnected ? 
                                            <span className="status-online">●</span> : 
                                            <span className="status-offline">●</span>
                                        }
                                        {isConnected ? 'Connected' : 'Connecting...'}
                                    </div>
                                </div>
                                <VideoCameraOutlined className="chat-message-video-icon"
                                    size={24}
                                    style={{ cursor: "pointer", marginLeft: "auto", fontSize: "20px" }}
                                    onClick={fetchVideoCall}
                                />
                            </div>
                        </div>

                        <div className="chat-message-message-container">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`chat-message-message-item ${msg.isOwnMessage ? 'chat-message-right' : 'chat-message-left'}`}
                                >
                                    <div className="chat-message-content">
                                        <div className="chat-message-user-name">
                                            {msg.username || msg.sender}
                                            <span className="chat-message-timestamp">
                                                {msg.timestamp}
                                            </span>
                                        </div>
                                        <div
                                            className="chat-message-message-bubble"
                                            dangerouslySetInnerHTML={{ __html: convertLinksToAnchorTags(msg.content || msg.text) }}
                                        >
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Typing indicator */}
                            {typingUser && (
                                <div className="chat-message-message-item chat-message-left">
                                    <div className="chat-message-avatar">
                                        {typingUser.profile_picture ? (
                                            <img
                                                src={typingUser.profile_picture}
                                                alt="User avatar"
                                                className="rounded-circle"
                                            />
                                        ) : (
                                            <UserOutlined />
                                        )}
                                    </div>
                                    <div className="chat-message-content">
                                        <div className="chat-message-message-bubble typing-indicator">
                                            <div className="typing">
                                                <div className="dot"></div>
                                                <div className="dot"></div>
                                                <div className="dot"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        <div className="chat-message-input-area">
                            <input
                                id="message-input"
                                className="chat-message-message-input"
                                placeholder="Type your message..."
                                value={newMessage}
                                onChange={(e) => {
                                    setNewMessage(e.target.value);
                                    handleTyping();
                                }}
                                onKeyPress={(e) => e.key === 'Enter'}
                            />
                            <button
                                className="chat-message-send-button"
                                // onClick={handleSendMessage}
                                disabled={!isConnected}
                            >
                                <SendOutlined className="chat-message-send-button-icon" />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="chat-message-empty-state">
                        <p>Select a conversation to start messaging</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentChat;