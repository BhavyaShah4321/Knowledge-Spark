import { DeleteOutlined, SearchOutlined, SendOutlined, UserOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { message } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

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
    const location = useLocation();
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
    const [targetUuid, setTargetUuid] = useState(null);

    const messagesEndRef = useRef(null);
    const wsRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const sentMessagesRef = useRef(new Set());


    useEffect(() => {
        if (location.state && location.state.uuid) {
            console.log("UUID received from navigation:", location.state.uuid);
            setTargetUuid(location.state.uuid);
        }
    }, [location.state]);


    useEffect(() => {
        const userDataFromStorage = JSON.parse(localStorage.getItem("auth_token"));
        if (userDataFromStorage) {
            setUserData(userDataFromStorage);
            loggedInUserId = userDataFromStorage.user.id;
        }
    }, []);

    useEffect(() => {
        if (users.length > 0 && targetUuid) {
            const targetUser = users.find(user => user.uuid === targetUuid);
            if (targetUser) {
                console.log("Auto-selecting conversation with UUID:", targetUuid);
                setSelectedUser(targetUser);
                setTargetUuid(null); // Reset target UUID after selection
            } else {
                console.warn("No matching conversation found for UUID:", targetUuid);
            }
        }
    }, [users, targetUuid]);


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

                const existingMessages = new Set(messages.map(msg => msg.text));
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


    useEffect(() => {
        const loadInitialData = async () => {
            if (!loaded) {
                const data = await getUsers();
                setUsers(data);
                setLoaded(true);
            }
        };

        loadInitialData();

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && !document.hidden) {
                const lastActivity = localStorage.getItem('lastChatActivity');
                const now = Date.now();

                if (!lastActivity || (now - parseInt(lastActivity)) > 5 * 60 * 1000) {
                    loadInitialData();
                }

                localStorage.setItem('lastChatActivity', now.toString());
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        localStorage.setItem('lastChatActivity', Date.now().toString());

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [loaded]);


    useEffect(() => {
        if (selectedUser) {
            if (selectedUser.messages) {
                setMessages(selectedUser.messages);
                scrollToBottom();
            }

            sentMessagesRef.current.clear();

            if (wsRef.current) {
                wsRef.current.close();
                setIsConnected(false);
            }

            wsRef.current = wsConnection(selectedUser.chatId);
        }
    }, [selectedUser]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const wsConnection = (uuid) => {
        const protocol = window.location.protocol === "https:" ? "wss" : "ws";
        const token = JSON.parse(localStorage.getItem("auth_token"))?.access_token;

        const ws = new WebSocket(`${protocol}://127.0.0.1:8001/ws/chat/${uuid}/`);
        let isAttemptingReconnect = false;
        let reconnectAttempts = 0;
        const maxReconnectAttempts = 5;

        ws.onopen = () => {
            console.log('WebSocket connection opened successfully');
            setIsConnected(true);
            reconnectAttempts = 0;

            if (userData && selectedUser) {
                console.log("Sending handshake message with complete sender information");

                setTimeout(() => {
                    sendWebSocketMessage(ws, {
                        'type': 'handshake',
                        'sender': userData.user.id,
                        'sender_username': userData.user.username,
                        'conversation': selectedUser.chatId,
                        'message': 'Connection established',
                        'content': 'Connection established',
                        'username': userData.user.username,
                        'profile_picture': userData.user.profile_picture || "/media/"
                    });
                }, 500);
            }
        };

        ws.onmessage = (event) => {
            try {
                const newMsg = JSON.parse(event.data);
                console.log("Received message:", newMsg);

                if (newMsg.type === 'handshake' ||
                    newMsg.isHandshake ||
                    newMsg.message === '__handshake__' ||
                    newMsg.content === '__handshake__') {
                    console.log("Handshake message received/acknowledged, ignoring for UI");
                    return;
                }

                handleIncomingMessage(newMsg);

                if (newMsg.type === 'chat') {
                    updateUserWithNewMessage(newMsg);
                }
            } catch (error) {
                console.error("Error parsing WebSocket message:", error);
            }
        };

        ws.onerror = (error) => {
            console.error("WebSocket Error:", error);
            console.warn("⚠️ Cannot connect to WebSocket server. Please check if the server is running and the path is correct.");
            setIsConnected(false);
        };

        ws.onclose = (event) => {
            console.warn(`WebSocket Closed with code: ${event.code}, reason: ${event.reason || 'No reason provided'}`);
            setIsConnected(false);
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
                console.error("Max reconnection attempts reached");
                message.error("Failed to connect to chat server after multiple attempts");
                console.log("Switching to HTTP polling fallback...");
            }
        };

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
        setUsers(prevUsers =>
            prevUsers.map(user => {
                if (user.chatId === newMsg.conversation || user.uuid === selectedUser?.uuid) {
                    return {
                        ...user,
                        lastMessage: newMsg.message || newMsg.content,
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
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        sendWebSocketMessage(wsRef.current, {
            'type': 'typing_start',
            'conversation': selectedUser.chatId,
            'sender': userData.user.id,
            'content': "",
            'profile_picture': userData.user.profile_picture || "/media/",
            'username': userData.user.username
        });

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

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedUser || !userData) {
            console.log("Cannot send: empty message or missing user data");
            return;
        }

        console.log("Attempting to send message:", newMessage);
        console.log("WebSocket state:", wsRef.current?.readyState);

        const messageId = `${userData.user.id}-${Date.now()}-${newMessage.substring(0, 10)}`;

        const messageData = {
            'type': 'chat_message',
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

        const messageToSend = newMessage;
        setNewMessage('');

        sentMessagesRef.current.add(messageId);

        if (wsRef.current && wsRef.current.readyState !== WebSocket.OPEN) {
            console.warn("WebSocket not connected yet. Waiting...");
            await waitForWebSocketConnection();
        }

        const sent = sendWebSocketMessage(wsRef.current, messageData);

        if (sent) {
            console.log("Message successfully sent through WebSocket");

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

            setMessages(prevMessages => [...prevMessages, newMessageObj]);
        } else {
            console.error("Failed to send message through WebSocket");
            message.warning("Connection issue - trying to reconnect");

            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = wsConnection(selectedUser.chatId);
            }
        }

        setTimeout(() => {
            sentMessagesRef.current.delete(messageId);
        }, 10000);
    };


    const waitForWebSocketConnection = async () => {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 200);
        });
    };

    useEffect(() => {
        if (selectedUser) {
            if (selectedUser.messages) {
                setMessages(selectedUser.messages);
                scrollToBottom();
            }
            if (wsRef.current) {
                wsRef.current.close();
                setIsConnected(false);
            }
            wsRef.current = wsConnection(selectedUser.chatId);
            setTimeout(() => {
                if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && userData) {
                    console.log("Sending initialization message to establish connection");
                    sendWebSocketMessage(wsRef.current, {
                        'type': 'initialization',
                        'sender': userData.user.id,
                        'sender_username': userData.user.username,
                        'conversation': selectedUser.chatId,
                        'message': 'Connection initialized',
                        'content': 'Connection initialized',
                        'username': userData.user.username,
                        'profile_picture': userData.user.profile_picture || "/media/"
                    });
                }
            }, 1000);
        }
    }, [selectedUser]);

    const handleIncomingMessage = (message) => {
        console.log("Incoming message:", message);

        if (message.type === 'handshake' ||
            message.type === 'initialization' ||
            message.message === 'Connection initialized' ||
            message.message === '__handshake__') {
            console.log("Ignoring system message for UI display");
            return;
        }

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

        if (!message.message && !message.content) {
            console.warn("Empty message detected. Ignoring.");
            return;
        }

        const messageContent = message.message || message.content;
        const messageSender = message.sender_username || message.username;

        if (message.sender === userData?.user.id) {
            console.log("Message from current user, already displayed, skipping");
            return;
        }

        const isDuplicate = messages.some(msg =>
            (message.message_id && msg.messageId === message.message_id) ||
            (msg.sender === messageSender &&
                msg.text === messageContent &&
                (new Date().getTime() - new Date(msg.timestamp).getTime() < 5000))
        );

        if (isDuplicate) {
            console.log("Duplicate message detected. Ignoring.");
            return;
        }

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
                `http://localhost:8000/api/chat/${user.chatId}/`,
                { headers: authHeader() }
            );

            setUsers(prevUsers => prevUsers.filter(u => u.id !== user.id));

            if (selectedUser?.id === user.id) {
                setSelectedUser(null);
                setMessages([]);

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

                localStorage.setItem("activeCallUUID", uuid);

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
                                {/* <button
            className="chat-message-delete-button"
            onClick={(e) => handleDeleteChat(user, e)}
        >
            <DeleteOutlined className="chat-message-delete-button" />
        </button> */}
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
                                        e.preventDefault();
                                        handleSendMessage();
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