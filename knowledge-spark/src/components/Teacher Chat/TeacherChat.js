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
                }) : '',
                messages: messages.map((msg) => ({
                    sender: msg.sender_username,
                    text: msg.message,
                    content: msg.message,
                    username: msg.sender_username,
                    isOwnMessage: msg.sender === loggedInUserId,
                    timestamp: new Date(msg.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    })
                }))
            };
        }));
    } catch (error) {
        console.error("Error fetching users:", error);
        message.error("Failed to load conversations");
        return [];
    }
};

const TeacherChat = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [userSearch, setUserSearch] = useState('');
    const [callUUID, setCallUUID] = useState(null);
    const [typingUser, setTypingUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [loaded, setLoaded] = useState(false);

    const messagesEndRef = useRef(null);
    const wsRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Track sent messages to prevent duplicates
    const sentMessagesRef = useRef(new Set());

    // Get user data from localStorage on component mount
    useEffect(() => {
        const userDataFromStorage = JSON.parse(localStorage.getItem("auth_token"));
        if (userDataFromStorage) {
            setUserData(userDataFromStorage);
            loggedInUserId = userDataFromStorage.user.id;
        }
    }, []);


    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8000/api/chat-message/chat-message-according-chat/?uuid=${selectedUser.uuid}`,
                    { headers: authHeader() }
                );

                const formattedMessages = response.data.data.map((msg) => ({
                    sender: msg.sender_username,
                    text: msg.message,
                    isOwnMessage: msg.sender === loggedInUserId,
                    timestamp: new Date(msg.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    })
                }));

                // ✅ Check if WebSocket message already added
                const existingMessages = new Set(messages.map(msg => msg.text));

                // ✅ Only add API messages that are not already shown
                const newMessages = formattedMessages.filter(msg => !existingMessages.has(msg.text));

                setMessages(newMessages);

            } catch (error) {
                console.error("Failed to fetch messages:", error);
            }
        };

        if (selectedUser) {
            fetchMessages();
        }
    }, [selectedUser]);


    // Initial users fetch - only fetch when component mounts
    useEffect(() => {
        const loadInitialData = async () => {
            if (!loaded) {
                const data = await getUsers();
                setUsers(data);
                setLoaded(true);
            }
        };

        loadInitialData();

        // Optional: Event listener for page visibility to refresh when tab becomes visible again after long inactivity
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && !document.hidden) {
                // Check if it's been more than 5 minutes since last interaction
                const lastActivity = localStorage.getItem('lastChatActivity');
                const now = Date.now();

                if (!lastActivity || (now - parseInt(lastActivity)) > 5 * 60 * 1000) {
                    // Only reload if it's been more than 5 minutes
                    loadInitialData();
                }

                // Update last activity timestamp
                localStorage.setItem('lastChatActivity', now.toString());
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Set initial activity timestamp
        localStorage.setItem('lastChatActivity', Date.now().toString());

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [loaded]);

    // Handle user selection - use cached messages instead of API call
    useEffect(() => {
        if (selectedUser) {
            // Use the messages we already loaded with the user data
            if (selectedUser.messages) {
                setMessages(selectedUser.messages);
                scrollToBottom();
            }

            // Clear the sent messages tracking when changing conversations
            sentMessagesRef.current.clear();

            // Close previous WebSocket connection
            if (wsRef.current) {
                wsRef.current.close();
                setIsConnected(false);
            }

            // Start a new WebSocket connection
            wsRef.current = wsConnection(selectedUser.chatId);
        }
    }, [selectedUser]);

    // Auto-scroll when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;

    const wsConnection = (uuid) => {
        const protocol = window.location.protocol === "https:" ? "wss" : "ws";
        const token = JSON.parse(localStorage.getItem("auth_token"))?.access_token;

        // Try different URL formats since we don't know the exact backend route
        // Option 1: Try with a leading slash (most common format)
        const ws = new WebSocket(`${protocol}://127.0.0.1:8001/ws/chat/${uuid}/`);

        // Track connection state
        let isAttemptingReconnect = false;
        let reconnectAttempts = 0;
        const maxReconnectAttempts = 5;

        ws.onopen = () => {
            console.log('WebSocket connection opened successfully');
            setIsConnected(true);
            reconnectAttempts = 0;

            // Always send a complete handshake message with ALL required fields
            if (userData && selectedUser) {
                console.log("Sending handshake message with complete sender information");

                // This is crucial - send a complete message with all fields the backend might expect
                setTimeout(() => {
                    sendWebSocketMessage(ws, {
                        'type': 'handshake',
                        'sender': userData.user.id,
                        'sender_username': userData.user.username,
                        'conversation': selectedUser.chatId,
                        'message': 'Connection established',  // Don't use empty strings
                        'content': 'Connection established',  // Don't use empty strings
                        'username': userData.user.username,
                        'profile_picture': userData.user.profile_picture || "/media/"
                    });
                }, 500);  // Small delay to ensure WebSocket is fully open
            }
        };

        ws.onmessage = (event) => {
            try {
                const newMsg = JSON.parse(event.data);
                console.log("Received message:", newMsg);

                // Filter out handshake messages
                if (newMsg.type === 'handshake' ||
                    newMsg.isHandshake ||
                    newMsg.message === '__handshake__' ||
                    newMsg.content === '__handshake__') {
                    console.log("Handshake message received/acknowledged, ignoring for UI");
                    return;
                }

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

        // Other handlers remain the same
        ws.onerror = (error) => {
            console.error("WebSocket Error:", error);
            console.warn("⚠️ Cannot connect to WebSocket server. Please check if the server is running and the path is correct.");
            setIsConnected(false);
        };

        ws.onclose = (event) => {
            console.warn(`WebSocket Closed with code: ${event.code}, reason: ${event.reason || 'No reason provided'}`);
            setIsConnected(false);

            // Only attempt reconnect if not already trying and under max attempts
            if (!isAttemptingReconnect && reconnectAttempts < maxReconnectAttempts) {
                isAttemptingReconnect = true;
                const timeout = Math.min(1000 * 2 ** reconnectAttempts, 30000);
                console.log(`Reconnecting WebSocket in ${timeout / 1000}s... (Attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`);

                setTimeout(() => {
                    reconnectAttempts++;
                    isAttemptingReconnect = false;
                    if (selectedUser) {
                        console.log("Attempting to reconnect WebSocket...");
                        wsRef.current = wsConnection(selectedUser.uuid);
                    }
                }, timeout);
            } else if (reconnectAttempts >= maxReconnectAttempts) {
                console.error("🚨 Max reconnection attempts reached");
                message.error("Failed to connect to chat server after multiple attempts");

                // Add fallback to regular HTTP communication
                console.log("Switching to HTTP polling fallback...");
                // Implement polling logic here if available
            }
        };

        // Keep the rest of the handlers but add checks for connection state
        const messageInput = document.getElementById("message-input");
        if (messageInput) {
            messageInput.onfocus = function (e) {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                        'type': 'typing_start',
                        'conversation': selectedUser.chatId,
                        'sender': userData.user.id,
                        'content': "",
                        'profile_picture': userData.user.profile_picture || "/media/",
                        'username': userData.user.username
                    }));
                }
            };

            messageInput.onblur = function (e) {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                        'type': 'typing_end',
                        'sender': userData.user.id,
                        'conversation': selectedUser.chatId,
                        'content': "",
                        'profile_picture': userData.user.profile_picture || "/media/",
                        'username': userData.user.username
                    }));
                }
            };
        }

        return ws;
    };

    const updateUserWithNewMessage = (newMsg) => {
        // Update the last message in the user list locally
        setUsers(prevUsers =>
            prevUsers.map(user => {
                // Check for both 'chat' and 'chat_message' types
                if (user.chatId === newMsg.conversation || user.uuid === selectedUser?.uuid) {
                    return {
                        ...user,
                        // Handle different message formats
                        lastMessage: newMsg.message || newMsg.content, // Check both message and content fields
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

    const sendWebSocketMessage = (ws, data) => {
        console.log("Attempting to send WebSocket message");

        if (!ws) {
            console.error("WebSocket reference is null/undefined");
            return false;
        }

        console.log("WebSocket state:", ws.readyState);

        if (ws.readyState === WebSocket.OPEN) {
            try {
                ws.send(JSON.stringify(data));
                console.log("Message sent successfully:", data);
                return true;
            } catch (error) {
                console.error("Error sending WebSocket message:", error);
                return false;
            }
        } else {
            console.error("WebSocket is not in OPEN state. Current state:", ws.readyState);
            return false;
        }
    };

    const handleTyping = () => {
        if (!userData || !selectedUser || !wsRef.current) return;

        // Clear any existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Send typing start event to the opposite user
        sendWebSocketMessage(wsRef.current, {
            'type': 'typing_start',
            'conversation': selectedUser.chatId,
            'sender': userData.user.id,
            'content': "",  // ❌ REMOVE THIS (It is sending empty message)
            'profile_picture': userData.user.profile_picture || "/media/",
            'username': userData.user.username
        });

        // Set timeout to stop typing after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            sendWebSocketMessage(wsRef.current, {
                'type': 'typing_end',
                'sender': userData.user.id,
                'conversation': selectedUser.chatId,
                'profile_picture': userData.user.profile_picture || "/media/",
                'username': userData.user.username
            });
        }, 2000);
    };

    // Enhanced handleSendMessage with better logging
    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedUser || !userData) {
            console.log("Cannot send: empty message or missing user data");
            return;
        }

        console.log("Attempting to send message:", newMessage);
        console.log("WebSocket state:", wsRef.current?.readyState);

        // Create a message ID based on content, time, and sender
        const messageId = `${userData.user.id}-${Date.now()}-${newMessage.substring(0, 10)}`;

        // Create message data object with ALL required fields for backend
        const messageData = {
            'type': 'chat_message', // Changed from 'chat' to match what backend might expect
            'sender': userData.user.id,
            'sender_username': userData.user.username,
            'username': userData.user.username,
            'profile_picture': userData.user.profile_picture || "/media/",
            'conversation': selectedUser.chatId,
            'message': newMessage,
            'content': newMessage,
            'message_id': messageId,
            'chat_id': selectedUser.chatId,
            'uuid': selectedUser.uuid
        };

        // Clear the input before sending to avoid double-sends
        const messageToSend = newMessage;
        setNewMessage('');

        // Add to tracking
        sentMessagesRef.current.add(messageId);

        // Wait for WebSocket connection if needed
        if (wsRef.current && wsRef.current.readyState !== WebSocket.OPEN) {
            console.warn("WebSocket not connected yet. Waiting...");
            await waitForWebSocketConnection();
        }

        // First try sending through WebSocket
        const sent = sendWebSocketMessage(wsRef.current, messageData);

        if (sent) {
            console.log("Message successfully sent through WebSocket");

            // Only add to UI after confirming the message was sent via WebSocket
            const newMessageObj = {
                sender: userData.user.username,
                text: messageToSend,
                content: messageToSend,
                isOwnMessage: true,
                messageId: messageId,
                timestamp: new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                })
            };

            // Add message to UI
            setMessages(prevMessages => [...prevMessages, newMessageObj]);
        } else {
            console.error("Failed to send message through WebSocket");
            message.warning("Connection issue - trying to reconnect");

            // Try to reconnect WebSocket
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = wsConnection(selectedUser.chatId);
            }
        }

        // Clear from cache after 10 seconds
        setTimeout(() => {
            sentMessagesRef.current.delete(messageId);
        }, 10000);
    };

    // ✅ Utility function to wait until WebSocket is connected
    const waitForWebSocketConnection = async () => {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 200); // Check every 200ms
        });
    };

    // Add this to your useEffect that handles user selection
    useEffect(() => {
        if (selectedUser) {
            // Use the messages we already loaded with the user data
            if (selectedUser.messages) {
                setMessages(selectedUser.messages);
                scrollToBottom();
            }

            // Close previous WebSocket connection
            if (wsRef.current) {
                wsRef.current.close();
                setIsConnected(false);
            }

            // Start a new WebSocket connection
            wsRef.current = wsConnection(selectedUser.chatId);

            // Send an "invisible" initialization message after connection
            setTimeout(() => {
                if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && userData) {
                    console.log("Sending initialization message to establish connection");
                    sendWebSocketMessage(wsRef.current, {
                        'type': 'initialization',
                        'sender': userData.user.id,
                        'sender_username': userData.user.username,
                        'conversation': selectedUser.chatId,
                        'message': '🔄 Connection initialized',
                        'content': '🔄 Connection initialized',
                        'username': userData.user.username,
                        'profile_picture': userData.user.profile_picture || "/media/"
                    });
                }
            }, 1000);  // Wait 1 second after connection to send initialization
        }
    }, [selectedUser]);

    // Modified handleIncomingMessage to prevent duplicates
    const handleIncomingMessage = (message) => {
        console.log("📩 Incoming message:", message);
        
        // Ignore system messages
        if (message.type === 'handshake' ||
            message.type === 'initialization' ||
            message.message === '🔄 Connection initialized' ||
            message.message === '__handshake__') {
            console.log("Ignoring system message for UI display");
            return;
        }
    
        // Handle typing indicators separately
        if (message.type === 'typing_start') {
            setTypingUser({
                id: message.sender,
                username: message.username || message.sender_username,
                profile_picture: message.profile_picture
            });
            return;
        }
        
        if (message.type === 'typing_end') {
            setTypingUser(null);
            return;
        }
    
        // Prevent empty messages
        if (!message.message && !message.content) {
            console.warn("❌ Empty message detected. Ignoring.");
            return;
        }
    
        const messageContent = message.message || message.content;
        const messageSender = message.sender_username || message.username;
        
        // If this message is from the current user, skip it as we've already added it
        // when it was sent in handleSendMessage
        if (message.sender === userData?.user.id) {
            console.log("Message from current user, already displayed, skipping");
            return;
        }
        
        // More robust duplicate detection for messages from other users
        const isDuplicate = messages.some(msg => 
            // Check by message ID if available
            (message.message_id && msg.messageId === message.message_id) ||
            // Or check by content and timestamp if they're very close in time (within last 5 seconds)
            (msg.sender === messageSender && 
             msg.text === messageContent && 
             (new Date().getTime() - new Date(msg.timestamp).getTime() < 5000))
        );
    
        // If it's a duplicate, ignore it
        if (isDuplicate) {
            console.log("⚠️ Duplicate message detected. Ignoring.");
            return;
        }
    
        // Add the message to the UI
        const newMessage = {
            sender: messageSender,
            text: messageContent,
            content: messageContent,
            isOwnMessage: message.sender === userData?.user.id,
            messageId: message.message_id,
            timestamp: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            })
        };
    
        // Update the chat UI
        setMessages(prevMessages => [...prevMessages, newMessage]);
    };


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
    }

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
                                </div>
                                {/* {localStorage.getItem("type") === "Teacher" && (
                                    <VideoCameraOutlined
                                        className="chat-message-video-icon"
                                        size={24}
                                        style={{ cursor: "pointer", marginLeft: "auto", fontSize: "20px" }}
                                        onClick={fetchVideoCall}
                                    />
                                )} */}
                                {JSON.parse(localStorage.getItem("auth_token"))?.user?.type === "Teacher" && (
                                    <VideoCameraOutlined
                                        className="chat-message-video-icon"
                                        size={24}
                                        style={{ cursor: "pointer", marginLeft: "auto", fontSize: "20px" }}
                                        onClick={fetchVideoCall}
                                    />
                                )}

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
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault(); // Prevent default behavior
                                        handleSendMessage(); // This will now work the same as clicking send
                                    }
                                }}
                            />
                            <button
                                className="chat-message-send-button"
                                onClick={handleSendMessage}
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

export default TeacherChat;

// // // TeacherChat.jsx
// import { DeleteOutlined, SearchOutlined, SendOutlined, UserOutlined, VideoCameraOutlined } from '@ant-design/icons';
// import { message } from 'antd';
// import axios from 'axios';
// import dayjs from 'dayjs';
// import React, { useEffect, useRef, useState, useCallback } from 'react';

// const authHeader = () => {
//     const userData = JSON.parse(localStorage.getItem("auth_token"));
//     if (userData && userData.access_token) {
//         return {
//             Authorization: `Bearer ${userData.access_token}`,
//         };
//     }
//     return {};
// };

// let loggedInUserId;

// const getUsers = async () => {
//     try {
//         const userData = JSON.parse(localStorage.getItem("auth_token"));
//         loggedInUserId = userData.user.id;

//         const response = await axios.post(
//             "http://localhost:8000/api/chat/chatid-according-user/",
//             { user_id: loggedInUserId },
//             { headers: authHeader() }
//         );

//         const chats = response.data.results;

//         return await Promise.all(chats.map(async (chat) => {
//             const lastMessageResponse = await axios.get(
//                 `http://localhost:8000/api/chat-message/chat-message-according-chat/?uuid=${chat.uuid}`,
//                 { headers: authHeader() }
//             );

//             const messages = lastMessageResponse.data.data;
//             const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

//             const oppositeUserId = loggedInUserId === chat.user_1 ? chat.user_2 : chat.user_1;
//             const oppositeUsername = loggedInUserId === chat.user_1 ? chat.user_2_username : chat.user_1_username;

//             return {
//                 id: oppositeUserId,
//                 name: oppositeUsername,
//                 uuid: chat.uuid,
//                 chatId: chat.id,
//                 status: 'online',
//                 lastMessage: lastMessage ? lastMessage.message : 'No messages yet',
//                 lastTime: lastMessage ? new Date(lastMessage.created_at).toLocaleTimeString([], {
//                     hour: '2-digit',
//                     minute: '2-digit'
//                 }) : '',
//                 messages: messages.map((msg) => ({
//                     sender: msg.sender_username,
//                     text: msg.message,
//                     content: msg.message,
//                     username: msg.sender_username,
//                     isOwnMessage: msg.sender === loggedInUserId,
//                     timestamp: new Date(msg.created_at).toLocaleTimeString([], {
//                         hour: '2-digit',
//                         minute: '2-digit'
//                     })
//                 }))
//             };
//         }));
//     } catch (error) {
//         console.error("Error fetching users:", error);
//         message.error("Failed to load conversations");
//         return [];
//     }
// };

// const TeacherChat = () => {
//     const [users, setUsers] = useState([]);
//     const [selectedUser, setSelectedUser] = useState(null);
//     const [newMessage, setNewMessage] = useState('');
//     const [messages, setMessages] = useState([]);
//     const [userSearch, setUserSearch] = useState('');
//     const [callUUID, setCallUUID] = useState(null);
//     const [typingUser, setTypingUser] = useState(null);
//     const [userData, setUserData] = useState(null);
//     const [isConnected, setIsConnected] = useState(false);
//     const [loaded, setLoaded] = useState(false);

//     const messagesEndRef = useRef(null);
//     const wsRef = useRef(null);
//     const typingTimeoutRef = useRef(null);

//     // Get user data from localStorage on component mount
//     useEffect(() => {
//         const userDataFromStorage = JSON.parse(localStorage.getItem("auth_token"));
//         if (userDataFromStorage) {
//             setUserData(userDataFromStorage);
//             loggedInUserId = userDataFromStorage.user.id;
//         }
//     }, []);


//     useEffect(() => {
//         const fetchMessages = async () => {
//             try {
//                 const response = await axios.get(
//                     `http://localhost:8000/api/chat-message/chat-message-according-chat/?uuid=${selectedUser.uuid}`,
//                     { headers: authHeader() }
//                 );

//                 const formattedMessages = response.data.data.map((msg) => ({
//                     sender: msg.sender_username,
//                     text: msg.message,
//                     isOwnMessage: msg.sender === loggedInUserId,
//                     timestamp: new Date(msg.created_at).toLocaleTimeString([], {
//                         hour: '2-digit',
//                         minute: '2-digit'
//                     })
//                 }));

//                 // ✅ Check if WebSocket message already added
//                 const existingMessages = new Set(messages.map(msg => msg.text));

//                 // ✅ Only add API messages that are not already shown
//                 const newMessages = formattedMessages.filter(msg => !existingMessages.has(msg.text));

//                 setMessages(newMessages);

//             } catch (error) {
//                 console.error("Failed to fetch messages:", error);
//             }
//         };

//         if (selectedUser) {
//             fetchMessages();
//         }
//     }, [selectedUser]);


//     // Initial users fetch - only fetch when component mounts
//     useEffect(() => {
//         const loadInitialData = async () => {
//             if (!loaded) {
//                 const data = await getUsers();
//                 setUsers(data);
//                 setLoaded(true);
//             }
//         };

//         loadInitialData();

//         // Optional: Event listener for page visibility to refresh when tab becomes visible again after long inactivity
//         const handleVisibilityChange = () => {
//             if (document.visibilityState === 'visible' && !document.hidden) {
//                 // Check if it's been more than 5 minutes since last interaction
//                 const lastActivity = localStorage.getItem('lastChatActivity');
//                 const now = Date.now();

//                 if (!lastActivity || (now - parseInt(lastActivity)) > 5 * 60 * 1000) {
//                     // Only reload if it's been more than 5 minutes
//                     loadInitialData();
//                 }

//                 // Update last activity timestamp
//                 localStorage.setItem('lastChatActivity', now.toString());
//             }
//         };

//         document.addEventListener('visibilitychange', handleVisibilityChange);

//         // Set initial activity timestamp
//         localStorage.setItem('lastChatActivity', Date.now().toString());

//         return () => {
//             document.removeEventListener('visibilitychange', handleVisibilityChange);
//         };
//     }, [loaded]);

//     // Handle user selection - use cached messages instead of API call
//     useEffect(() => {
//         if (selectedUser) {
//             // Use the messages we already loaded with the user data
//             if (selectedUser.messages) {
//                 setMessages(selectedUser.messages);
//                 scrollToBottom();
//             }

//             // Close previous WebSocket connection
//             if (wsRef.current) {
//                 wsRef.current.close();
//                 setIsConnected(false);
//             }

//             // Start a new WebSocket connection
//             wsRef.current = wsConnection(selectedUser.chatId);
//         }
//     }, [selectedUser]);

//     // Auto-scroll when messages change
//     useEffect(() => {
//         scrollToBottom();
//     }, [messages]);

//     let reconnectAttempts = 0;
//     const maxReconnectAttempts = 5;

//     const wsConnection = (uuid) => {
//         const protocol = window.location.protocol === "https:" ? "wss" : "ws";
//         const token = JSON.parse(localStorage.getItem("auth_token"))?.access_token;

//         // Try different URL formats since we don't know the exact backend route
//         // Option 1: Try with a leading slash (most common format)
//         const ws = new WebSocket(`${protocol}://127.0.0.1:8001/ws/chat/${uuid}/`);

//         // Track connection state
//         let isAttemptingReconnect = false;
//         let reconnectAttempts = 0;
//         const maxReconnectAttempts = 5;

//         ws.onopen = () => {
//             console.log('WebSocket connection opened successfully');
//             setIsConnected(true);
//             reconnectAttempts = 0;

//             // Always send a complete handshake message with ALL required fields
//             if (userData && selectedUser) {
//                 console.log("Sending handshake message with complete sender information");

//                 // This is crucial - send a complete message with all fields the backend might expect
//                 setTimeout(() => {
//                     sendWebSocketMessage(ws, {
//                         'type': 'handshake',
//                         'sender': userData.user.id,
//                         'sender_username': userData.user.username,
//                         'conversation': selectedUser.chatId,
//                         'message': 'Connection established',  // Don't use empty strings
//                         'content': 'Connection established',  // Don't use empty strings
//                         'username': userData.user.username,
//                         'profile_picture': userData.user.profile_picture || "/media/"
//                     });
//                 }, 500);  // Small delay to ensure WebSocket is fully open
//             }
//         };

//         ws.onmessage = (event) => {
//             try {
//                 const newMsg = JSON.parse(event.data);
//                 console.log("Received message:", newMsg);

//                 // Filter out handshake messages
//                 if (newMsg.type === 'handshake' ||
//                     newMsg.isHandshake ||
//                     newMsg.message === '__handshake__' ||
//                     newMsg.content === '__handshake__') {
//                     console.log("Handshake message received/acknowledged, ignoring for UI");
//                     return;
//                 }

//                 // Handle different message types
//                 handleIncomingMessage(newMsg);

//                 // Update user list to reflect new messages
//                 if (newMsg.type === 'chat') {
//                     updateUserWithNewMessage(newMsg);
//                 }
//             } catch (error) {
//                 console.error("Error parsing WebSocket message:", error);
//             }
//         };

//         // Other handlers remain the same
//         ws.onerror = (error) => {
//             console.error("WebSocket Error:", error);
//             console.warn("⚠️ Cannot connect to WebSocket server. Please check if the server is running and the path is correct.");
//             setIsConnected(false);
//         };

//         ws.onclose = (event) => {
//             console.warn(`WebSocket Closed with code: ${event.code}, reason: ${event.reason || 'No reason provided'}`);
//             setIsConnected(false);

//             // Only attempt reconnect if not already trying and under max attempts
//             if (!isAttemptingReconnect && reconnectAttempts < maxReconnectAttempts) {
//                 isAttemptingReconnect = true;
//                 const timeout = Math.min(1000 * 2 ** reconnectAttempts, 30000);
//                 console.log(`Reconnecting WebSocket in ${timeout / 1000}s... (Attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`);

//                 setTimeout(() => {
//                     reconnectAttempts++;
//                     isAttemptingReconnect = false;
//                     if (selectedUser) {
//                         console.log("Attempting to reconnect WebSocket...");
//                         wsRef.current = wsConnection(selectedUser.uuid);
//                     }
//                 }, timeout);
//             } else if (reconnectAttempts >= maxReconnectAttempts) {
//                 console.error("🚨 Max reconnection attempts reached");
//                 message.error("Failed to connect to chat server after multiple attempts");

//                 // Add fallback to regular HTTP communication
//                 console.log("Switching to HTTP polling fallback...");
//                 // Implement polling logic here if available
//             }
//         };

//         // Keep the rest of the handlers but add checks for connection state
//         const messageInput = document.getElementById("message-input");
//         if (messageInput) {
//             messageInput.onfocus = function (e) {
//                 if (ws.readyState === WebSocket.OPEN) {
//                     ws.send(JSON.stringify({
//                         'type': 'typing_start',
//                         'conversation': selectedUser.chatId,
//                         'sender': userData.user.id,
//                         'content': "",
//                         'profile_picture': userData.user.profile_picture || "/media/",
//                         'username': userData.user.username
//                     }));
//                 }
//             };

//             messageInput.onblur = function (e) {
//                 if (ws.readyState === WebSocket.OPEN) {
//                     ws.send(JSON.stringify({
//                         'type': 'typing_end',
//                         'sender': userData.user.id,
//                         'conversation': selectedUser.chatId,
//                         'content': "",
//                         'profile_picture': userData.user.profile_picture || "/media/",
//                         'username': userData.user.username
//                     }));
//                 }
//             };
//         }

//         return ws;
//     };

//     const updateUserWithNewMessage = (newMsg) => {
//         // Update the last message in the user list locally
//         setUsers(prevUsers =>
//             prevUsers.map(user => {
//                 // Check for both 'chat' and 'chat_message' types
//                 if (user.chatId === newMsg.conversation || user.uuid === selectedUser?.uuid) {
//                     return {
//                         ...user,
//                         // Handle different message formats
//                         lastMessage: newMsg.message || newMsg.content, // Check both message and content fields
//                         lastTime: new Date().toLocaleTimeString([], {
//                             hour: '2-digit',
//                             minute: '2-digit'
//                         })
//                     };
//                 }
//                 return user;
//             })
//         );
//     };

//     const sendWebSocketMessage = (ws, messageData) => {
//         if (ws && ws.readyState === WebSocket.OPEN) {
//             console.log("Sending message data");

//             ws.send(JSON.stringify(messageData));

//             console.log("Message data sent successfully", messageData);

//             return true;
//         } else {
//             console.error("WebSocket is not connected");
//             return false;
//         }
//     };

//     const handleTyping = () => {
//         if (!userData || !selectedUser || !wsRef.current) return;

//         // Clear any existing timeout
//         if (typingTimeoutRef.current) {
//             clearTimeout(typingTimeoutRef.current);
//         }

//         // Send typing start event to the opposite user
//         sendWebSocketMessage(wsRef.current, {
//             'type': 'typing_start',
//             'conversation': selectedUser.chatId,
//             'sender': userData.user.id,
//             'content': "",  // ❌ REMOVE THIS (It is sending empty message)
//             'profile_picture': userData.user.profile_picture || "/media/",
//             'username': userData.user.username
//         });

//         // Set timeout to stop typing after 2 seconds of inactivity
//         typingTimeoutRef.current = setTimeout(() => {
//             sendWebSocketMessage(wsRef.current, {
//                 'type': 'typing_end',
//                 'sender': userData.user.id,
//                 'conversation': selectedUser.chatId,
//                 'profile_picture': userData.user.profile_picture || "/media/",
//                 'username': userData.user.username
//             });
//         }, 2000);
//     };

//     const handleSendMessage = async () => {
//         if (!newMessage.trim() || !selectedUser || !userData) return;

//         // Create a COMPLETE message data object with ALL fields
//         const messageData = {
//             'type': 'chat_message',
//             'sender': userData.user.id,
//             'sender_username': userData.user.username,
//             'username': userData.user.username,
//             'profile_picture': userData.user.profile_picture || "/media/",
//             'conversation': selectedUser.chatId,
//             'message': newMessage,
//             'content': newMessage,
//             // Add any other fields your backend might be expecting
//             'chat_id': selectedUser.chatId,
//             'uuid': selectedUser.uuid
//         };

//         // Send message via WebSocket
//         const sent = sendWebSocketMessage(wsRef.current, messageData);

//         // Add optimistic UI update (add message to UI immediately)
//         const newMessageObj = {
//             sender: userData.user.username,
//             text: newMessage,
//             isOwnMessage: true,
//             timestamp: new Date().toLocaleTimeString([], {
//                 hour: '2-digit',
//                 minute: '2-digit'
//             })
//         };

//         // Add to messages list
//         setMessages(prevMessages => [...prevMessages, newMessageObj]);

//         // Clear input
//         setNewMessage('');

//         // Scroll to bottom
//         scrollToBottom();

//         // If WebSocket failed, try API fallback
//         if (!sent) {
//             message.warning("Connection issue - trying to reconnect");

//             // Try to reconnect WebSocket
//             if (selectedUser) {
//                 wsRef.current = wsConnection(selectedUser.chatId);
//             }
//         }
//     };

//     // Add this to your useEffect that handles user selection
//     useEffect(() => {
//         if (selectedUser) {
//             // Use the messages we already loaded with the user data
//             if (selectedUser.messages) {
//                 setMessages(selectedUser.messages);
//                 scrollToBottom();
//             }

//             // Close previous WebSocket connection
//             if (wsRef.current) {
//                 wsRef.current.close();
//                 setIsConnected(false);
//             }

//             // Start a new WebSocket connection
//             wsRef.current = wsConnection(selectedUser.chatId);

//             // Send an "invisible" initialization message after connection
//             setTimeout(() => {
//                 if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && userData) {
//                     console.log("Sending initialization message to establish connection");
//                     sendWebSocketMessage(wsRef.current, {
//                         'type': 'initialization',
//                         'sender': userData.user.id,
//                         'sender_username': userData.user.username,
//                         'conversation': selectedUser.chatId,
//                         'message': '🔄 Connection initialized',
//                         'content': '🔄 Connection initialized',
//                         'username': userData.user.username,
//                         'profile_picture': userData.user.profile_picture || "/media/"
//                     });
//                 }
//             }, 1000);  // Wait 1 second after connection to send initialization
//         }
//     }, [selectedUser]);


//     const handleIncomingMessage = (message) => {
//         console.log("📩 Incoming message:", message);

//         // Filter out handshake and initialization messages
//         if (message.type === 'handshake' ||
//             message.type === 'initialization' ||
//             message.message === '🔄 Connection initialized' ||
//             message.message === '__handshake__') {
//             console.log("Ignoring system message for UI display");
//             return;
//         }

//         // Only process messages with actual content
//         if (!message.message && !message.content) {
//             console.warn("❌ Empty message detected. Ignoring it.");
//             return;
//         }

//         // Format the incoming message
//         const newMessage = {
//             sender: message.sender_username || message.username,
//             text: message.message || message.content,
//             isOwnMessage: message.sender === loggedInUserId,
//             timestamp: new Date().toLocaleTimeString([], {
//                 hour: '2-digit',
//                 minute: '2-digit'
//             })
//         };

//         // Add message to chat
//         setMessages(prevMessages => [...prevMessages, newMessage]);
//     };


//     const sentMessageIdsRef = useRef(new Set());

//     // const handleSendMessage = async () => {
//     //     if (!newMessage.trim() || !selectedUser || !userData) return;

//     //     // Generate a unique temporary ID for each message
//     //     const tempMessageId = `temp-${Date.now()}`;

//     //     // Create a message object
//     //     const messageData = {
//     //         'type': 'chat_message',
//     //         'sender': userData.user.id,
//     //         'sender_username': userData.user.username,
//     //         'username': userData.user.username,
//     //         'profile_picture': userData.user.profile_picture || "/media/",
//     //         'conversation': selectedUser.chatId,
//     //         'message': newMessage,
//     //         'content': newMessage,
//     //         'temp_id': tempMessageId // Add temporary ID
//     //     };

//     //     // ✅ Optimistic UI (Instant Message Without Waiting For WebSocket)
//     //     const newMessageObj = {
//     //         sender: userData.user.username,
//     //         text: newMessage,
//     //         content: newMessage,
//     //         isOwnMessage: true,
//     //         timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//     //         temp_id: tempMessageId
//     //     };

//     //     // ✅ Add the message to UI instantly
//     //     setMessages(prevMessages => [...prevMessages, newMessageObj]);

//     //     // ✅ Track the message ID in sentMessageIdsRef to prevent duplication
//     //     sentMessageIdsRef.current.add(tempMessageId);

//     //     // ✅ Clear the input
//     //     setNewMessage('');

//     //     // ✅ Send the message via WebSocket
//     //     const sent = sendWebSocketMessage(wsRef.current, messageData);

//     //     // ✅ Fallback to API if WebSocket fails
//     //     if (!sent) {
//     //         message.warning("Connection issue - sending via API");
//     //         try {
//     //             await axios.post(
//     //                 "http://localhost:8000/api/chat-message/",
//     //                 {
//     //                     chatid: selectedUser.chatId,
//     //                     sender: userData.user.id,
//     //                     message: newMessage,
//     //                 },
//     //                 { headers: authHeader() }
//     //             );
//     //         } catch (error) {
//     //             console.error("Error sending message via API:", error);
//     //             message.error("Failed to send message");
//     //         }
//     //     }

//     //     // ✅ Scroll to the bottom of the chat
//     //     scrollToBottom();
//     // };


//     // const handleIncomingMessage = (message) => {
//     //     console.log("📩 Incoming message:", message);

//     //     // ✅ Avoid adding duplicate messages sent by the same sender
//     //     if (message.sender === loggedInUserId) {
//     //         // 💡 Check if the message has temp_id and already exists
//     //         if (message.temp_id && sentMessageIdsRef.current.has(message.temp_id)) {
//     //             console.warn("⚠️ Duplicate message received from WebSocket. Skipping it...");
//     //             sentMessageIdsRef.current.delete(message.temp_id);
//     //             return;
//     //         }

//     //         // ✅ Handle the case where WebSocket message is delayed by 2 seconds
//     //         const recentMessages = messages.slice(-3);
//     //         const isDuplicate = recentMessages.some(msg =>
//     //             msg.isOwnMessage &&
//     //             msg.text === message.message &&
//     //             (new Date() - new Date(msg.rawTimestamp || Date.now())) < 2000
//     //         );

//     //         if (isDuplicate) {
//     //             console.warn("⚠️ Skipping delayed WebSocket message...");
//     //             return;
//     //         }
//     //     }

//     //     // ✅ Ignore empty messages (fix empty bubble issue)
//     //     if (!message.message || message.message.trim() === "") {
//     //         console.warn("⚠️ Ignored empty message from WebSocket.");
//     //         return;
//     //     }

//     //     // ✅ Format the incoming message
//     //     const newMessage = {
//     //         sender: message.sender_username || message.username,
//     //         text: message.message || message.content,
//     //         isOwnMessage: message.sender === loggedInUserId,
//     //         timestamp: new Date().toLocaleTimeString([], {
//     //             hour: '2-digit',
//     //             minute: '2-digit'
//     //         })
//     //     };

//     //     // ✅ Add the message to chat
//     //     setMessages(prevMessages => [...prevMessages, newMessage]);

//     //     // ✅ Update the user list with the latest message
//     //     if (selectedUser) {
//     //         setUsers(prevUsers =>
//     //             prevUsers.map(user => {
//     //                 if (user.chatId === message.conversation) {
//     //                     return {
//     //                         ...user,
//     //                         messages: [...(user.messages || []), newMessage]
//     //                     };
//     //                 }
//     //                 return user;
//     //             })
//     //         );
//     //     }
//     // };





//     const scrollToBottom = () => {
//         setTimeout(() => {
//             messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//         }, 100);
//     };

//     const handleDeleteChat = async (user, e) => {
//         e.stopPropagation();
//         try {
//             await axios.delete(
//                 `http://localhost:8000/api/chat-message/${user.chatId}/`,
//                 { headers: authHeader() }
//             );

//             setUsers(prevUsers => prevUsers.filter(u => u.id !== user.id));

//             if (selectedUser?.id === user.id) {
//                 setSelectedUser(null);
//                 setMessages([]);

//                 // Close WebSocket if connected
//                 if (wsRef.current) {
//                     wsRef.current.close();
//                     wsRef.current = null;
//                 }
//             }

//             message.success("Chat deleted successfully");
//         } catch (error) {
//             console.error("Error deleting chat:", error);
//             message.error("Failed to delete chat");
//         }
//     };

//     const fetchVideoCall = async () => {
//         if (!selectedUser?.id || !userData) return;

//         try {
//             const auth_token = JSON.parse(localStorage.getItem('auth_token'));
//             if (!auth_token?.access_token) {
//                 throw new Error("Please log in again");
//             }

//             const requestData = {
//                 teacher: userData.user.id,
//                 student: selectedUser.id,
//                 start: dayjs().format('DD/MM/YYYY HH:mm'),
//             };

//             console.log("Requesting Video Call:", requestData);
//             const response = await axios.post(
//                 "http://localhost:8000/api/video-call/",
//                 requestData,
//                 { headers: authHeader() }
//             );

//             console.log("Video Call API Response:", response.data);

//             if (response.data?.success && response.data.data?.uuid) {
//                 const uuid = response.data.data.uuid;
//                 setCallUUID(uuid);

//                 // Also send a message via WebSocket about the video call
//                 if (wsRef.current) {
//                     sendWebSocketMessage(wsRef.current, {
//                         'type': 'chat',
//                         'sender': userData.user.id,
//                         'profile_picture': userData.user.profile_picture || "/media/",
//                         'conversation': selectedUser.chatId,
//                         'username': userData.user.username,
//                         'content': `A video call has been initiated. Please Click on Video Call Image.`
//                     });
//                 }

//                 // Store the active call in local state or database for tracking
//                 localStorage.setItem("activeCallUUID", uuid);

//                 // Open the call for the teacher
//                 const videoCallUrl = `http://localhost:8000/video-call/${uuid}?token=${encodeURIComponent(auth_token.access_token)}`;
//                 window.open(videoCallUrl, '_blank');

//             } else {
//                 throw new Error("Failed to start video call");
//             }

//         } catch (error) {
//             console.error("Video call error:", error.response?.data || error.message);
//             message.error(error.response?.data?.message || "Failed to start video call");
//         }
//     }

//     const convertLinksToAnchorTags = (text) => {
//         if (!text) return '';
//         const urlRegex = /(https?:\/\/[^\s]+)/g;
//         return text.replace(
//             urlRegex,
//             (url) => {
//                 return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="chat-link">${url}</a>`;
//             }
//         );
//     };

//     const handleManualRefresh = async () => {
//         // Only refresh if it's been a while since last refresh (e.g., 5 minutes)
//         const lastRefresh = localStorage.getItem('lastChatRefresh');
//         const now = Date.now();

//         if (!lastRefresh || (now - parseInt(lastRefresh)) > 5 * 60 * 1000) {
//             const data = await getUsers();
//             setUsers(data);
//             localStorage.setItem('lastChatRefresh', now.toString());
//         }
//     };

//     const filteredUsers = users.filter((user) =>
//         user.name.toLowerCase().includes(userSearch.toLowerCase())
//     );

//     return (
//         <div className="chat-message-container">
//             <div className="chat-message-sidebar">
//                 <div className="chat-message-search-header">
//                     <div className="chat-message-search-container">
//                         <SearchOutlined className="chat-message-search-icon" />
//                         <input
//                             className="chat-message-search-input"
//                             placeholder="Search conversations..."
//                             value={userSearch}
//                             onChange={(e) => setUserSearch(e.target.value)}
//                         />
//                     </div>
//                 </div>

//                 <div className="chat-message-users-list">
//                     {filteredUsers.map((user) => (
//                         <div
//                             key={user.id}
//                             className={`chat-message-user-item ${selectedUser?.id === user.id ? 'active' : ''}`}
//                             onClick={() => setSelectedUser(user)}
//                         >
//                             <div className="chat-message-avatar-container">
//                                 <div className="chat-message-avatar">
//                                     <UserOutlined className="chat-message-avatar-icon" />
//                                 </div>
//                             </div>
//                             <div className="chat-message-user-info">
//                                 <div className="chat-message-user-name">{user.name}</div>
//                                 <div className="chat-message-last-message">{user.lastMessage}</div>
//                             </div>
//                             <div className="chat-message-user-actions">
//                                 <span className="chat-message-timestamp">{user.lastTime}</span>
//                                 <button
//                                     className="chat-message-delete-button"
//                                     onClick={(e) => handleDeleteChat(user, e)}
//                                 >
//                                     <DeleteOutlined className="chat-message-delete-button" />
//                                 </button>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>

//             <div className="chat-message-chat-area">
//                 {selectedUser ? (
//                     <>
//                         <div className="chat-message-chat-header">
//                             <div className="chat-message-chat-header-content">
//                                 <div className="chat-message-avatar">
//                                     <UserOutlined className="chat-message-avatar-icon" />
//                                 </div>
//                                 <div className="chat-message-user-info">
//                                     <div className="chat-message-chatSide-user-name">
//                                         {selectedUser.name}
//                                     </div>
//                                     <div className="connection-status">
//                                         {isConnected ?
//                                             <span className="status-online">●</span> :
//                                             <span className="status-offline">●</span>
//                                         }
//                                         {isConnected ? 'Connected' : 'Connecting...'}
//                                     </div>
//                                 </div>
//                                 <VideoCameraOutlined className="chat-message-video-icon"
//                                     size={24}
//                                     style={{ cursor: "pointer", marginLeft: "auto", fontSize: "20px" }}
//                                     onClick={fetchVideoCall}
//                                 />
//                             </div>
//                         </div>

//                         <div className="chat-message-message-container">
//                             {messages.map((msg, index) => (
//                                 <div
//                                     key={index}
//                                     className={`chat-message-message-item ${msg.isOwnMessage ? 'chat-message-right' : 'chat-message-left'}`}
//                                 >
//                                     <div className="chat-message-content">
//                                         <div className="chat-message-user-name">
//                                             {msg.username || msg.sender}
//                                             <span className="chat-message-timestamp">
//                                                 {msg.timestamp}
//                                             </span>
//                                         </div>
//                                         <div
//                                             className="chat-message-message-bubble"
//                                             dangerouslySetInnerHTML={{ __html: convertLinksToAnchorTags(msg.content || msg.text) }}
//                                         >
//                                         </div>
//                                     </div>
//                                 </div>
//                             ))}

//                             {/* Typing indicator */}
//                             {typingUser && (
//                                 <div className="chat-message-message-item chat-message-left">
//                                     <div className="chat-message-avatar">
//                                         {typingUser.profile_picture ? (
//                                             <img
//                                                 src={typingUser.profile_picture}
//                                                 alt="User avatar"
//                                                 className="rounded-circle"
//                                             />
//                                         ) : (
//                                             <UserOutlined />
//                                         )}
//                                     </div>
//                                     <div className="chat-message-content">
//                                         <div className="chat-message-message-bubble typing-indicator">
//                                             <div className="typing">
//                                                 <div className="dot"></div>
//                                                 <div className="dot"></div>
//                                                 <div className="dot"></div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             )}

//                             <div ref={messagesEndRef} />
//                         </div>

//                         <div className="chat-message-input-area">
//                             <input
//                                 id="message-input"
//                                 className="chat-message-message-input"
//                                 placeholder="Type your message..."
//                                 value={newMessage}
//                                 onChange={(e) => {
//                                     setNewMessage(e.target.value);
//                                     handleTyping();
//                                 }}
//                                 onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
//                             />
//                             <button
//                                 className="chat-message-send-button"
//                                 onClick={handleSendMessage}
//                                 disabled={!isConnected}
//                             >
//                                 <SendOutlined className="chat-message-send-button-icon" />
//                             </button>
//                         </div>
//                     </>
//                 ) : (
//                     <div className="chat-message-empty-state">
//                         <p>Select a conversation to start messaging</p>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default TeacherChat;