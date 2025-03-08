import { DeleteOutlined, SearchOutlined, SendOutlined, UserOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { message } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import { Search, Send, Trash2, User, Video } from "lucide-react";
import React, { useEffect, useRef, useState, useCallback } from 'react';
import StudentChat from '../Student Chat/StudentChat';

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
        message.error(error);
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

    const messagesEndRef = useRef(null);
    const wsRef = useRef(null);

    const fetchUsers = useCallback(async () => {
        const data = await getUsers();
        setUsers(data);
    }, []);

    useEffect(() => {
        fetchUsers();
        const interval = setInterval(fetchUsers, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, [fetchUsers]);

    useEffect(() => {
        const fetchMessages = async () => {
            if (selectedUser?.uuid) {
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
                            hour: "2-digit",
                            minute: "2-digit",
                        }),
                    }));

                    setMessages(formattedMessages);
                    scrollToBottom();
                } catch (error) {
                    console.error("Failed to fetch messages", error);
                }
            }
        };

        fetchMessages();
    }, [selectedUser]);


    useEffect(() => {
        if (!selectedUser) return;

        wsRef.current = new WebSocket(`ws://localhost:8000/ws/chat/${selectedUser.uuid}/`);

        wsRef.current.onopen = () => console.log("✅ WebSocket connected!");

        wsRef.current.onmessage = (event) => {
            try {
                const newMsg = JSON.parse(event.data);
                console.log("📩 Received message:", newMsg);

                if (newMsg.chatid === selectedUser?.chatId) {
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        {
                            sender: newMsg.sender_username,
                            text: newMsg.message,
                            isOwnMessage: newMsg.sender === loggedInUserId,
                            timestamp: new Date(newMsg.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            }),
                        },
                    ]);

                    scrollToBottom();
                }
            } catch (error) {
                console.error("Error parsing WebSocket message:", error);
            }
        };

        wsRef.current.onclose = () => {
            console.warn("🔴 WebSocket Closed");
            setTimeout(() => {
                console.log("🔄 Reconnecting WebSocket...");
                wsRef.current = new WebSocket(`ws://localhost:8000/ws/chat/${selectedUser.uuid}/`);
            }, 3000);
        };

        return () => wsRef.current?.close();
    }, [selectedUser]);

    const scrollToBottom = () => {
        setTimeout(() => {
            const chatContainer = document.getElementById("chat-container");
            if (chatContainer) {
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }
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
            }

            message.success("Chat deleted successfully");
        } catch (error) {
            message.error("Failed to delete chat");
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedUser) return;

        try {
            const messagePayload = {
                chatid: selectedUser.chatId,
                sender: loggedInUserId,
                message: newMessage,
            };

            // Optimistic UI Update (adds the message instantly)
            setMessages(prevMessages => [...prevMessages, {
                sender: "You",
                text: newMessage,
                isOwnMessage: true,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);

            setNewMessage('');
            scrollToBottom();

            await axios.post(
                "http://localhost:8000/api/chat-message/",
                messagePayload,
                { headers: authHeader() }
            );

        } catch (error) {
            message.error("Failed to send message");
        }
    };



    const fetchVideoCall = async () => {
        if (!selectedUser?.id) return;

        try {
            const auth_token = JSON.parse(localStorage.getItem('auth_token'));
            if (!auth_token?.access_token) {
                throw new Error("Please log in again");
            }

            const requestData = {
                teacher: loggedInUserId,
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
                const messagePayload = {
                    chatid: selectedUser.chatId,
                    sender: loggedInUserId,
                    message: `A video call has been initiated.Please Click on Video Call Image.`,
                };

                console.log("Sending Video Call Notification:", messagePayload);
                await axios.post(
                    "http://localhost:8000/api/chat-message/",
                    messagePayload,
                    { headers: authHeader() }
                );

                // 2️⃣ Store the active call in local state or database for tracking
                localStorage.setItem("activeCallUUID", uuid);


                // 3️⃣ Open the call for the teacher
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
                                    <div
                                        className="chat-message-message-bubble"
                                        dangerouslySetInnerHTML={{ __html: convertLinksToAnchorTags(msg.text) }}
                                    ></div>
                                    <span className="chat-message-timestamp">{msg.timestamp}</span>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="chat-message-input-area">
                            <input
                                className="chat-message-message-input"
                                placeholder="Type your message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            />
                            <button
                                className="chat-message-send-button"
                                onClick={handleSendMessage}
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


// // TeacherChat.jsx

// import { message } from 'antd';
// import axios from 'axios';
// import dayjs from 'dayjs';
// import { Search, Send, Trash2, User, Video } from "lucide-react";
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
//         message.error(error);
//         return [];
//     }
// };

// const TeacherChat = () => {
//     const [users, setUsers] = useState([]);
//     const [selectedUser, setSelectedUser] = useState(null);
//     const [newMessage, setNewMessage] = useState('');
//     const [messages, setMessages] = useState([]);
//     const [userSearch, setUserSearch] = useState('');
//     const messagesEndRef = useRef(null);
//     const wsRef = useRef(null);

//     const fetchUsers = useCallback(async () => {
//         const data = await getUsers();
//         setUsers(data);
//     }, []);

//     useEffect(() => {
//         fetchUsers();
//         const interval = setInterval(fetchUsers, 30000); // Refresh every 30 seconds
//         return () => clearInterval(interval);
//     }, [fetchUsers]);

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
//                         isOwnMessage: msg.sender === loggedInUserId,
//                         timestamp: new Date(msg.created_at).toLocaleTimeString([], {
//                             hour: '2-digit',
//                             minute: '2-digit'
//                         })
//                     }));
//                     setMessages(formattedMessages);
//                     scrollToBottom();
//                 } catch (error) {
//                     message.error("Failed to fetch messages");
//                 }
//             }
//         };
//         fetchMessages();
//     }, [selectedUser]);

//     useEffect(() => {
//         if (selectedUser?.uuid) {
//             wsRef.current = new WebSocket(`ws://localhost:8000/ws/chat/${selectedUser.uuid}/`);
//             wsRef.current.onmessage = (event) => {
//                 const newMsg = JSON.parse(event.data);
//                 setMessages(prevMessages => [...prevMessages, newMsg]);
//                 scrollToBottom();
//             };

//             return () => {
//                 if (wsRef.current) {
//                     wsRef.current.close();
//                 }
//             };
//         }
//     }, [selectedUser]);

//     const scrollToBottom = () => {
//         messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
//             }

//             message.success("Chat deleted successfully");
//         } catch (error) {
//             message.error("Failed to delete chat");
//         }
//     };

//     const handleSendMessage = async () => {
//         if (!newMessage.trim() || !selectedUser) return;

//         try {
//             const messagePayload = {
//                 chatid: selectedUser.chatId,
//                 sender: loggedInUserId,
//                 message: newMessage,
//             };

//             await axios.post(
//                 "http://localhost:8000/api/chat-message/",
//                 messagePayload,
//                 { headers: authHeader() }
//             );

//             setNewMessage('');
//             fetchUsers();

//         } catch (error) {
//             message.error("Failed to send message");
//         }
//     };

//     const fetchVideoCall = async () => {
//         if (!selectedUser?.id) return;

//         try {
//             const auth_token = JSON.parse(localStorage.getItem('auth_token'));
//             if (!auth_token?.access_token) {
//                 throw new Error("Please log in again");
//             }

//             const requestData = {
//                 teacher: loggedInUserId,
//                 student: selectedUser.id,
//                 start: dayjs().format('DD/MM/YYYY HH:mm'),
//             };

//             // First, make the API call to set up the video call
//             const response = await axios.post(
//                 "http://localhost:8000/api/video-call/",
//                 requestData,
//                 { headers: authHeader() }
//             );

//             if (response.data?.success && response.data.data?.uuid) {
//                 const uuid = response.data.data.uuid;  // Extract UUID from API response
//                 const token = auth_token.access_token;
//                 const encodedToken = encodeURIComponent(token);
//                 const videoCallUrl = `http://localhost:8000/video-call/${uuid}?token=${encodedToken}`;

//                 const windowFeatures = "width=800,height=600,resizable=yes,scrollbars=yes";
//                 window.open(videoCallUrl, '_blank', windowFeatures);
//             } else {
//                 throw new Error("Failed to initialize video call");
//             }

//         } catch (error) {
//             console.error("Video call error:", error);
//             message.error(error.message || "Failed to start video call");
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
//                         <Search className="chat-message-search-icon" size={20} />
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
//                                     <User size={24} color="#6b7280" />
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
//                                     <Trash2 size={16} />
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
//                                     <User size={24} color="#6b7280" />
//                                 </div>
//                                 <div className="chat-message-user-info">
//                                     <div className="chat-message-chatSide-user-name">
//                                         {selectedUser.name}
//                                     </div>
//                                 </div>
//                                 <Video
//                                     className="chat-message-video-icon"
//                                     size={24}
//                                     style={{ cursor: "pointer", marginLeft: "auto" }}
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
//                                     <div className="chat-message-message-bubble">{msg.text}</div>
//                                     <span className="chat-message-timestamp">{msg.timestamp}</span>
//                                 </div>
//                             ))}
//                             <div ref={messagesEndRef} />
//                         </div>

//                         <div className="chat-message-input-area">
//                             <input
//                                 className="chat-message-message-input"
//                                 placeholder="Type your message..."
//                                 value={newMessage}
//                                 onChange={(e) => setNewMessage(e.target.value)}
//                                 onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
//                             />
//                             <button
//                                 className="chat-message-send-button"
//                                 onClick={handleSendMessage}
//                             >
//                                 <Send size={20} />
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