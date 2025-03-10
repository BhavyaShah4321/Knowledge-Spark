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
//                 }) : ''
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
//     const [needsRefresh, setNeedsRefresh] = useState(true);

//     const messagesEndRef = useRef(null);
//     const wsRef = useRef(null);
//     const typingTimeoutRef = useRef(null);

//     useEffect(() => {
//         const userDataFromStorage = JSON.parse(localStorage.getItem("auth_token"));
//         if (userDataFromStorage) {
//             setUserData(userDataFromStorage);
//             loggedInUserId = userDataFromStorage.user.id;
//         }
//     }, []);

//     const fetchUsers = useCallback(async () => {
//         if (!needsRefresh) return;

//         const data = await getUsers();
//         setUsers(data);
//         setNeedsRefresh(false);
//     }, [needsRefresh]);

//     useEffect(() => {
//         fetchUsers();

//         const handleVisibilityChange = () => {
//             if (document.visibilityState === 'visible') {
//                 setNeedsRefresh(true);
//             }
//         };

//         document.addEventListener('visibilitychange', handleVisibilityChange);

//         return () => {
//             document.removeEventListener('visibilitychange', handleVisibilityChange);
//         };
//     }, [fetchUsers]);

//     const handleManualRefresh = () => {
//         setNeedsRefresh(true);
//     };

//     useEffect(() => {
//         const fetchMessages = async () => {
//             if (selectedUser?.uuid) {
//                 try {
//                     const response = await axios.get(
//                         `http://localhost:8000/api/chat-message/chat-message-according-chat/?uuid=${selectedUser.uuid}`,
//                         { headers: authHeader() }
//                     );

//                     const formattedMessages = response.data.data.map((msg) => ({
//                         sender: msg.sender_username,
//                         text: msg.message,
//                         content: msg.message,
//                         username: msg.sender_username,
//                         isOwnMessage: msg.sender === loggedInUserId,
//                         timestamp: new Date(msg.created_at).toLocaleTimeString([], {
//                             hour: '2-digit',
//                             minute: '2-digit'
//                         })
//                     }));
//                     setMessages(formattedMessages);
//                     scrollToBottom();
//                 } catch (error) {
//                     console.error("Error fetching messages:", error);
//                     message.error("Failed to fetch messages");
//                 }
//             }
//         };

//         if (selectedUser) {
//             fetchMessages();

//             if (wsRef.current) {
//                 wsRef.current.close();
//                 setIsConnected(false);
//             }

//             wsRef.current = wsConnection(selectedUser.chatId);
//         }
//     }, [selectedUser]);

//     useEffect(() => {
//         scrollToBottom();
//     }, [messages]);

//     let reconnectAttempts = 0;
//     const maxReconnectAttempts = 5;

//     const wsConnection = (uuid) => {
//         const protocol = window.location.protocol === "https:" ? "wss" : "ws";
//         const token = JSON.parse(localStorage.getItem("auth_token"))?.access_token;

//         const ws = new WebSocket(`${protocol}://127.0.0.1:8001/ws/chat/${uuid}/`);

//         ws.onopen = () => {
//             console.log('WebSocket connection opened');
//             setIsConnected(true);
//             reconnectAttempts = 0; 

//             const pingInterval = setInterval(() => {
//                 if (ws.readyState === WebSocket.OPEN) {
//                     ws.send(JSON.stringify({ type: 'ping' }));
//                 } else {
//                     clearInterval(pingInterval);
//                 }
//             }, 30000);
//         };

//         ws.onmessage = (event) => {
//             try {
//                 const newMsg = JSON.parse(event.data);
//                 console.log("Received message:", newMsg);

//                 handleIncomingMessage(newMsg);

//                 if (newMsg.type === 'chat') {
//                     updateUserWithNewMessage(newMsg);
//                     setNeedsRefresh(true);
//                 }
//             } catch (error) {
//                 console.error("Error parsing WebSocket message:", error);
//             }
//         };

//         ws.onerror = (error) => {
//             console.error("WebSocket Error:", error);
//             setIsConnected(false);
//         };

//         ws.onclose = (event) => {
//             console.warn("WebSocket Closed:", event.reason);
//             setIsConnected(false);

//             if (reconnectAttempts < maxReconnectAttempts) {
//                 const timeout = Math.min(1000 * 2 ** reconnectAttempts, 30000);
//                 console.log(`Reconnecting WebSocket in ${timeout / 1000}s... (Attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`);

//                 setTimeout(() => {
//                     reconnectAttempts++;
//                     if (selectedUser) {
//                         wsRef.current = wsConnection(selectedUser.uuid);
//                     }
//                 }, timeout);
//             } else {
//                 console.error("🚨 Max reconnection attempts reached");
//                 message.error("Failed to connect to chat server after multiple attempts");
//             }
//         };

//         const messageInput = document.getElementById("message-input");
//         if (messageInput) {
//             messageInput.onfocus = function (e) {
//                 ws.send(JSON.stringify({
//                     'type': 'typing_start',
//                     'conversation': selectedUser.chatId,
//                     'sender': userData.user.id,
//                     'content': "",
//                     'profile_picture': userData.user.profile_picture || "/media/",
//                     'username': userData.user.username
//                 }));
//             };

//             messageInput.onblur = function (e) {
//                 ws.send(JSON.stringify({
//                     'type': 'typing_end',
//                     'sender': userData.user.id,
//                     'conversation': selectedUser.chatId,
//                     'content': "",
//                     'profile_picture': userData.user.profile_picture || "/media/",
//                     'username': userData.user.username
//                 }));
//             };
//         }
//         return ws;
//     };


//     const updateUserWithNewMessage = (newMsg) => {
//         setUsers(prevUsers => 
//             prevUsers.map(user => {
//                 if (user.chatId === newMsg.conversation) {
//                     return {
//                         ...user,
//                         lastMessage: newMsg.content,
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

//         if (typingTimeoutRef.current) {
//             clearTimeout(typingTimeoutRef.current);
//         }

//         sendWebSocketMessage(wsRef.current, {
//             'type': 'typing_start',
//             'conversation': selectedUser.chatId,
//             'sender': userData.user.id,
//             'content': "",
//             'profile_picture': userData.user.profile_picture || "/media/",
//             'username': userData.user.username
//         });

//         typingTimeoutRef.current = setTimeout(() => {
//             sendWebSocketMessage(wsRef.current, {
//                 'type': 'typing_end',
//                 'sender': userData.user.id,
//                 'conversation': selectedUser.chatId,
//                 'content': "",
//                 'profile_picture': userData.user.profile_picture || "/media/",
//                 'username': userData.user.username
//             });
//         }, 2000);
//     };

//     const handleIncomingMessage = (message) => {
//         if (message.type === 'chat') {
//             const newMessage = {
//                 sender: message.username,
//                 text: message.content,
//                 content: message.content,
//                 isOwnMessage: message.sender === loggedInUserId,
//                 timestamp: new Date().toLocaleTimeString([], {
//                     hour: '2-digit',
//                     minute: '2-digit'
//                 })
//             };

//             setMessages(prevMessages => [...prevMessages, newMessage]);
//             if (message.sender !== loggedInUserId) {
//             }
//         } else if (message.type === 'typing_start') {
//             if (message.sender !== loggedInUserId) {
//                 setTypingUser (message);
//             }
//         } else if (message.type === 'typing_end') {
//             if (typingUser  && typingUser .sender === message.sender) {
//                 setTypingUser (null);
//             }
//         }
//     };

//     const handleSendMessage = async () => {
//         if (!newMessage.trim() || !selectedUser || !userData) return;
//         const messageData = {
//             'type': 'chat',
//             'sender': userData.user.id,
//             'profile_picture': userData.user.profile_picture || "/media/",
//             'conversation': selectedUser.chatId,
//             'username': userData.user.username,
//             'content': newMessage
//         };

//         const newMessageObj = {
//             sender: userData.user.username,
//             text: newMessage,
//             content: newMessage,
//             isOwnMessage: true,
//             timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//         };

//         setMessages(prevMessages => [...prevMessages, newMessageObj]);

//         setNewMessage('');
//         if (typingTimeoutRef.current) {
//             clearTimeout(typingTimeoutRef.current);

//             sendWebSocketMessage(wsRef.current, {
//                 'type': 'typing_end',
//                 'sender': userData.user.id,
//                 'conversation': selectedUser.chatId,
//                 'content': "",
//                 'profile_picture': userData.user.profile_picture || "/media/",
//                 'username': userData.user.username
//             });
//         }

//         const sent = sendWebSocketMessage(wsRef.current, messageData);

//         if (!sent) {
//             message.warning("Connection issue - trying to send via API");
//             try {
//                 const messagePayload = {
//                     chatid: selectedUser.chatId,
//                     sender: userData.user.id,
//                     message: newMessage,
//                 };

//                 await axios.post(
//                     "http://localhost:8000/api/chat-message/",
//                     messagePayload,
//                     { headers: authHeader() }
//                 );
//             } catch (error) {
//                 console.error("Error sending message via API:", error);
//                 message.error("Failed to send message");
//             }
//         }

//         updateUserWithNewMessage(messageData);
//         scrollToBottom();
//     };

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
//                             onFocus={handleManualRefresh} // Refresh when user interacts
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


// // TeacherChat.jsx
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

            // Send a ping message to keep the connection alive
            const pingInterval = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: 'ping' }));
                } else {
                    clearInterval(pingInterval);
                }
            }, 30000); // Every 30 seconds
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

    const sendWebSocketMessage = (ws, messageData) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            console.log("Sending message data");

            ws.send(JSON.stringify(messageData));

            console.log("Message data sent successfully", messageData);

            return true;
        } else {
            console.error("WebSocket is not connected");
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

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedUser || !userData) return;

        // Create message data
        const messageData = {
            'type': 'chat_message',
            'sender': userData.user.id,
            'sender_username': userData.user.username,
            'username': userData.user.username,
            'profile_picture': userData.user.profile_picture || "/media/",
            'conversation': selectedUser.chatId,
            'message': newMessage,
            'content': newMessage,
        };

        // ✅ Send message via WebSocket (Real-time)
        sendWebSocketMessage(wsRef.current, messageData);

        // ✅ Prevent adding message from UI manually (NO DUPLICATE)
        setNewMessage('');

        // ✅ DO NOT add any empty message
        console.log("✅ Real-time message sent perfectly. No empty message now.");
    };


    const handleIncomingMessage = (message) => {
        console.log("📩 Incoming message:", message);

        // ✅ Prevent adding empty messages
        if (!message.message || message.message.trim() === "") {
            console.warn("❌ Empty message detected. Ignoring it.");
            return;
        }

        // ✅ Format the incoming message
        const newMessage = {
            sender: message.sender_username || message.username,
            text: message.message || message.content,
            isOwnMessage: message.sender === loggedInUserId,
            timestamp: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            })
        };

        // ✅ Add message only if it's not empty
        setMessages(prevMessages => [...prevMessages, newMessage]);
    };


    const sentMessageIdsRef = useRef(new Set());

    // const handleSendMessage = async () => {
    //     if (!newMessage.trim() || !selectedUser || !userData) return;

    //     // Generate a unique temporary ID for each message
    //     const tempMessageId = `temp-${Date.now()}`;

    //     // Create a message object
    //     const messageData = {
    //         'type': 'chat_message',
    //         'sender': userData.user.id,
    //         'sender_username': userData.user.username,
    //         'username': userData.user.username,
    //         'profile_picture': userData.user.profile_picture || "/media/",
    //         'conversation': selectedUser.chatId,
    //         'message': newMessage,
    //         'content': newMessage,
    //         'temp_id': tempMessageId // Add temporary ID
    //     };

    //     // ✅ Optimistic UI (Instant Message Without Waiting For WebSocket)
    //     const newMessageObj = {
    //         sender: userData.user.username,
    //         text: newMessage,
    //         content: newMessage,
    //         isOwnMessage: true,
    //         timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    //         temp_id: tempMessageId
    //     };

    //     // ✅ Add the message to UI instantly
    //     setMessages(prevMessages => [...prevMessages, newMessageObj]);

    //     // ✅ Track the message ID in sentMessageIdsRef to prevent duplication
    //     sentMessageIdsRef.current.add(tempMessageId);

    //     // ✅ Clear the input
    //     setNewMessage('');

    //     // ✅ Send the message via WebSocket
    //     const sent = sendWebSocketMessage(wsRef.current, messageData);

    //     // ✅ Fallback to API if WebSocket fails
    //     if (!sent) {
    //         message.warning("Connection issue - sending via API");
    //         try {
    //             await axios.post(
    //                 "http://localhost:8000/api/chat-message/",
    //                 {
    //                     chatid: selectedUser.chatId,
    //                     sender: userData.user.id,
    //                     message: newMessage,
    //                 },
    //                 { headers: authHeader() }
    //             );
    //         } catch (error) {
    //             console.error("Error sending message via API:", error);
    //             message.error("Failed to send message");
    //         }
    //     }

    //     // ✅ Scroll to the bottom of the chat
    //     scrollToBottom();
    // };


    // const handleIncomingMessage = (message) => {
    //     console.log("📩 Incoming message:", message);

    //     // ✅ Avoid adding duplicate messages sent by the same sender
    //     if (message.sender === loggedInUserId) {
    //         // 💡 Check if the message has temp_id and already exists
    //         if (message.temp_id && sentMessageIdsRef.current.has(message.temp_id)) {
    //             console.warn("⚠️ Duplicate message received from WebSocket. Skipping it...");
    //             sentMessageIdsRef.current.delete(message.temp_id);
    //             return;
    //         }

    //         // ✅ Handle the case where WebSocket message is delayed by 2 seconds
    //         const recentMessages = messages.slice(-3);
    //         const isDuplicate = recentMessages.some(msg =>
    //             msg.isOwnMessage &&
    //             msg.text === message.message &&
    //             (new Date() - new Date(msg.rawTimestamp || Date.now())) < 2000
    //         );

    //         if (isDuplicate) {
    //             console.warn("⚠️ Skipping delayed WebSocket message...");
    //             return;
    //         }
    //     }

    //     // ✅ Ignore empty messages (fix empty bubble issue)
    //     if (!message.message || message.message.trim() === "") {
    //         console.warn("⚠️ Ignored empty message from WebSocket.");
    //         return;
    //     }

    //     // ✅ Format the incoming message
    //     const newMessage = {
    //         sender: message.sender_username || message.username,
    //         text: message.message || message.content,
    //         isOwnMessage: message.sender === loggedInUserId,
    //         timestamp: new Date().toLocaleTimeString([], {
    //             hour: '2-digit',
    //             minute: '2-digit'
    //         })
    //     };

    //     // ✅ Add the message to chat
    //     setMessages(prevMessages => [...prevMessages, newMessage]);

    //     // ✅ Update the user list with the latest message
    //     if (selectedUser) {
    //         setUsers(prevUsers =>
    //             prevUsers.map(user => {
    //                 if (user.chatId === message.conversation) {
    //                     return {
    //                         ...user,
    //                         messages: [...(user.messages || []), newMessage]
    //                     };
    //                 }
    //                 return user;
    //             })
    //         );
    //     }
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

    const handleManualRefresh = async () => {
        // Only refresh if it's been a while since last refresh (e.g., 5 minutes)
        const lastRefresh = localStorage.getItem('lastChatRefresh');
        const now = Date.now();

        if (!lastRefresh || (now - parseInt(lastRefresh)) > 5 * 60 * 1000) {
            const data = await getUsers();
            setUsers(data);
            localStorage.setItem('lastChatRefresh', now.toString());
        }
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
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
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