// import { message } from 'antd';
// import axios from 'axios';
// import dayjs from 'dayjs';
// import { Search, Send, Trash2, User, Video } from "lucide-react";
// import { DeleteOutlined, PhoneOutlined, SearchOutlined, SendOutlined, UserOutlined, VideoCameraOutlined } from "@ant-design/icons";
// import React, { useEffect, useRef, useState } from 'react';
// import { useLocation } from 'react-router-dom';

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
// let ws;

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
//         if (!chats || chats.length === 0) {
//             console.log("No chat data found.");
//             return [];
//         }

//         const usersWithLastMessage = await Promise.all(chats.map(async (chat) => {
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

//         return usersWithLastMessage;
//     } catch (error) {
//         console.error("Error fetching users:", error);
//         return [];
//     }
// };


// const getMessagesByChatUUID = async (uuid) => {
//     try {
//         const response = await axios.get(
//             `http://localhost:8000/api/chat-message/chat-message-according-chat/?uuid=${uuid}`,
//             { headers: authHeader() }
//         );

//         return response.data && response.data.data ? response.data : { data: [] };
//     } catch (error) {
//         console.error("Error fetching messages:", error);
//         return { data: [] };
//     }
// };

// const StudentChat = ({ uuid }) => {
//     const [users, setUsers] = useState([]);
//     const [selectedUser, setSelectedUser] = useState(null);
//     const [newMessage, setNewMessage] = useState('');
//     const [messages, setMessages] = useState([]);
//     const [userSearch, setUserSearch] = useState('');
//     const messagesEndRef = useRef(null);
//     const messageRefs = useRef({});
//     const location = useLocation();

//     useEffect(() => {
//         const fetchUsers = async () => {
//             const data = await getUsers();
//             setUsers(data);
//         };
//         fetchUsers();
//     }, []);

//     useEffect(() => {
//         const fetchMessages = async () => {
//             if (selectedUser && selectedUser.uuid) {
//                 const messagesData = await getMessagesByChatUUID(selectedUser.uuid);
//                 const formattedMessages = messagesData.data.map((msg) => ({
//                     uuid: msg.uuid,
//                     sender: msg.sender_username,
//                     text: msg.message,
//                     isOwnMessage: msg.sender === loggedInUserId,
//                     timestamp: new Date(msg.created_at).toLocaleTimeString([], {
//                         hour: '2-digit',
//                         minute: '2-digit'
//                     })
//                 }));
//                 setMessages(formattedMessages);

//                 // Scroll to the message with the given uuid
//                 setTimeout(() => {
//                     if (uuid && messageRefs.current[uuid]) {
//                         messageRefs.current[uuid].scrollIntoView({
//                             behavior: "smooth",
//                             block: "center"
//                         });
//                     }
//                 }, 100);
//             }
//         };
//         fetchMessages();
//     }, [selectedUser, uuid]);

//     const handleDeleteChat = async (user, e) => {
//         e.stopPropagation(); // Prevent selecting the user when clicking delete
//         try {
//             // Delete chat messages
//             await axios.delete(
//                 `http://localhost:8000/api/chat-message/${user.chatId}/`,
//                 { headers: authHeader() }
//             );

//             // Update the users list
//             const updatedUsers = users.filter(u => u.id !== user.id);
//             setUsers(updatedUsers);

//             // If the deleted chat was selected, clear the selection
//             if (selectedUser?.id === user.id) {
//                 setSelectedUser(null);
//                 setMessages([]);
//             }

//             message.success("Chat deleted successfully");
//         } catch (error) {
//             console.error("Error deleting chat:", error);
//             message.error("Failed to delete chat");
//         }
//     };

//     const handleSendMessage = async () => {
//         if (newMessage.trim() === '') return;

//         try {
//             const existingChatResponse = await axios.post(
//                 "http://localhost:8000/api/chat/chatid-according-user/",
//                 { user_id: selectedUser.id },
//                 { headers: authHeader() }
//             );

//             let chatUUID;
//             let chatId;

//             if (existingChatResponse.data.data && existingChatResponse.data.data.length > 0) {
//                 const existingChat = existingChatResponse.data.data.find(
//                     chat => chat.uuid === selectedUser.uuid
//                 );

//                 if (existingChat) {
//                     chatUUID = existingChat.uuid;
//                     chatId = existingChat.id;
//                 }
//             }

//             if (!chatId) {
//                 const createChatResponse = await axios.post(
//                     'http://localhost:8000/api/chat/',
//                     {
//                         user_1: loggedInUserId,
//                         user_2: selectedUser.id
//                     },
//                     { headers: authHeader() }
//                 );

//                 if (createChatResponse.data?.data?.id) {
//                     chatId = createChatResponse.data.data.id;
//                     chatUUID = createChatResponse.data.data.uuid;
//                 } else {
//                     throw new Error("Failed to create a new chat");
//                 }
//             }

//             const messagePayload = {
//                 chatid: chatId,
//                 sender: loggedInUserId,
//                 message: newMessage,
//             };

//             await axios.post(
//                 "http://localhost:8000/api/chat-message/",
//                 messagePayload,
//                 { headers: authHeader() }
//             );

//             setNewMessage('');

//             const messagesData = await getMessagesByChatUUID(chatUUID);
//             const formattedMessages = messagesData.data.map((msg) => ({
//                 sender: msg.sender_username,
//                 text: msg.message,
//                 isOwnMessage: msg.sender === loggedInUserId,
//                 timestamp: new Date(msg.created_at).toLocaleTimeString([], {
//                     hour: '2-digit',
//                     minute: '2-digit'
//                 })
//             }));
//             setMessages(formattedMessages);

//         } catch (error) {
//             console.error("Error sending message:", error);
//             message.error("Failed to send message");
//         }
//     };

//     const filteredUsers = users.filter((user) =>
//         user.name.toLowerCase().includes(userSearch.toLowerCase())
//     );

//     useEffect(() => {
//         const fetchUsersAndSelectChat = async () => {
//             const data = await getUsers();
//             setUsers(data);

//             // If there's a UUID in the navigation state, find and select that chat
//             if (location.state?.uuid) {
//                 const chatToOpen = data.find(user => user.uuid === location.state.uuid);
//                 if (chatToOpen) {
//                     setSelectedUser(chatToOpen);
//                 }
//             }
//         };
//         fetchUsersAndSelectChat();
//     }, [location.state]);


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

//             console.log("Requesting Video Call:", requestData);
//             const response = await axios.post(
//                 "http://localhost:8000/api/video-call/",
//                 requestData,
//                 { headers: authHeader() }
//             );

//             console.log("Video Call API Response:", response.data);

//             if (response.data?.success && response.data.data?.uuid) {
//                 const uuid = response.data.data.uuid;
//                 const messagePayload = {
//                     chatid: selectedUser.chatId,
//                     sender: loggedInUserId,
//                     message: `A video call has been initiated.Please Click on Video Call Image.`,
//                 };

//                 console.log("Sending Video Call Notification:", messagePayload);
//                 await axios.post(
//                     "http://localhost:8000/api/chat-message/",
//                     messagePayload,
//                     { headers: authHeader() }
//                 );

//                 // 2️⃣ Store the active call in local state or database for tracking
//                 localStorage.setItem("activeCallUUID", uuid);


//                 // 3️⃣ Open the call for the teacher
//                 const videoCallUrl = `http://localhost:8000/video-call/${uuid}?token=${encodeURIComponent(auth_token.access_token)}`;
//                 window.open(videoCallUrl, '_blank');


//             } else {
//                 throw new Error("Failed to start video call");
//             }

//         } catch (error) {
//             console.error("Video call error:", error.response?.data || error.message);
//             message.error(error.response?.data?.message || "Failed to start video call");
//         }
//     };


//     const convertLinksToAnchorTags = (text, isOwnMessage) => {
//         const urlRegex = /(https?:\/\/[^\s]+)/g;
//         const linkColor = isOwnMessage ? "whitesmoke" : "black"; // Right side → White, Left side → Black

//         return text.replace(
//             urlRegex,
//             (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer"
//                         style="color: ${linkColor}; text-decoration: underline;">${url}</a>`
//         );
//     };



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
//                                     <User size={24} color="#6b7280" />
//                                 </div>
//                                 <div className="chat-message-user-info">
//                                     <div className="chat-message-chatSide-user-name">
//                                         {selectedUser.name}
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
//                                     <div
//                                         className="chat-message-message-bubble"
//                                         dangerouslySetInnerHTML={{ __html: convertLinksToAnchorTags(msg.text, msg.isOwnMessage) }}
//                                     ></div>
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
//                             <button className="chat-message-send-button" onClick={handleSendMessage}>
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
//         </div >
//     );
// };

// export default StudentChat;


import { DeleteOutlined, SearchOutlined, SendOutlined, UserOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { message } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import { Search, Send, Trash2, User, Video } from "lucide-react";
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
        message.error(error);
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
                            hour: '2-digit',
                            minute: '2-digit'
                        })
                    }));
                    setMessages(formattedMessages);
                    scrollToBottom();
                } catch (error) {
                    message.error("Failed to fetch messages");
                }
            }
        };
        fetchMessages();
    }, [selectedUser]);

    useEffect(() => {
        if (!selectedUser?.uuid) return;

        wsRef.current = new WebSocket(`ws://localhost:8000/ws/chat/${selectedUser.uuid}/`);

        wsRef.current.onopen = () => {
            console.log("✅ WebSocket connected!");
        };

        wsRef.current.onmessage = (event) => {
            try {
                const newMsg = JSON.parse(event.data);
                console.log("📩 Received message:", newMsg);

                setMessages(prevMessages => [...prevMessages, {
                    sender: newMsg.sender_username,
                    text: newMsg.message,
                    isOwnMessage: newMsg.sender === loggedInUserId,
                    timestamp: new Date(newMsg.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    })
                }]);
                scrollToBottom();
            } catch (error) {
                console.error("Error parsing WebSocket message:", error);
            }
        };

        wsRef.current.onerror = (error) => {
            console.error("❌ WebSocket Error:", error);
        };

        wsRef.current.onclose = (event) => {
            console.warn("🔴 WebSocket Closed:", event.reason);
            setTimeout(() => {
                console.log("🔄 Reconnecting WebSocket...");
                fetchUsers(); // Ensure users list is updated
            }, 3000);
        };

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [selectedUser]);


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

export default StudentChat;