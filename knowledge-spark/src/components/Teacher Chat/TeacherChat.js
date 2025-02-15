// import axios from 'axios';
// import { Search, Send, User } from "lucide-react";
// import React, { useEffect, useRef, useState } from 'react';

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
//         const usersWithLastMessage = await Promise.all(response.data.data.map(async (chat) => {
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

// const TeacherChat = () => {
//     const [users, setUsers] = useState([]);
//     const [selectedUser, setSelectedUser] = useState(null);
//     const [newMessage, setNewMessage] = useState('');
//     const [messages, setMessages] = useState([]);
//     const [userSearch, setUserSearch] = useState('');
//     const messagesEndRef = useRef(null);

//     useEffect(() => {
//         const fetchUsers = async () => {
//             const data = await getUsers();
//             setUsers(data);
//         };
//         fetchUsers();
//     }, [messages]);

//     useEffect(() => {
//         const fetchMessages = async () => {
//             if (selectedUser && selectedUser.uuid) {
//                 const messagesData = await getMessagesByChatUUID(selectedUser.uuid);
//                 const formattedMessages = messagesData.data.map((msg) => ({
//                     sender: msg.sender_username,
//                     text: msg.message,
//                     isOwnMessage: msg.sender === loggedInUserId,
//                     timestamp: new Date(msg.created_at).toLocaleTimeString([], {
//                         hour: '2-digit',
//                         minute: '2-digit'
//                     })
//                 }));
//                 setMessages(formattedMessages);
//             }
//         };
//         fetchMessages();
//     }, [selectedUser]);

//     useEffect(() => {
//         if (selectedUser) {
//             ws = new WebSocket(`ws://localhost:8000/ws/chat/${selectedUser.uuid}/`);
//             ws.onmessage = (event) => {
//                 const newMsg = JSON.parse(event.data);
//                 setMessages(prevMessages => [...prevMessages, newMsg]);
//             };
//             return () => ws.close();
//         }
//     }, [selectedUser]);

//     const filteredUsers = users.filter((user) =>
//         user.name.toLowerCase().includes(userSearch.toLowerCase())
//     );

//     const handleSendMessage = async () => {
//         if (newMessage.trim() !== '') {
//             try {
//                 const chatResponse = await axios.get(
//                     `http://localhost:8000/api/chat-message/chat-message-according-chat/?uuid=${selectedUser.uuid}`,
//                     { headers: authHeader() }
//                 );

//                 if (chatResponse.data && chatResponse.data.data && chatResponse.data.data[0]) {
//                     const chatData = chatResponse.data.data[0];

//                     const payload = {
//                         chatid: chatData.id,
//                         sender: loggedInUserId,
//                         message: newMessage,
//                     };

//                     await axios.post("http://localhost:8000/api/chat-message/", payload, { headers: authHeader() });
//                     setNewMessage('');
//                 } else {
//                     const createChatResponse = await axios.post(
//                         'http://localhost:8000/api/chat/',
//                         { user_1: loggedInUserId, user_2: selectedUser.id },
//                         { headers: authHeader() }
//                     );
//                     if (createChatResponse.data && createChatResponse.data.data && createChatResponse.data.data.id) {
//                         const newChatId = createChatResponse.data.data.id;
//                         const payload = {
//                             chatid: newChatId,
//                             sender: loggedInUserId,
//                             message: newMessage,
//                         };
//                         await axios.post("http://localhost:8000/api/chat-message/", payload, { headers: authHeader() });
//                         setNewMessage('');
//                     } else {
//                         console.error("Failed to create a new chat.");
//                     }
//                 }
//             } catch (error) {
//                 console.error("Error sending message:", error.response ? error.response.data : error);
//             }
//         }
//     };

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
//                             <span className="chat-message-timestamp">{user.lastTime}</span>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//             <div className="chat-message-chat-area">
//                 {selectedUser ? (
//                     <>
//                         <div className=".chat-message-chat-header">
//                             <div className="chat-message-chat-header-content">
//                                 <div className="chat-message-avatar">
//                                     <User size={24} color="#6b7280" />
//                                 </div>
//                                 <div className="chat-message-user-info">
//                                     <div className="chat-message-chatSide-user-name">{selectedUser.name}</div>
//                                     {/* <div className="last-message">
//                                                               <span className={`status-indicator ${selectedUser.status === 'online' ? 'status-online' : 'status-offline'}`} />
//                                                               {selectedUser.status === 'online' ? 'Online' : 'Offline'}
//                                                          // </div> */}
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="chat-message-message-container">
//                             {messages.map((msg, index) => (
//                                 <div key={index} className={`chat-message-message-item ${msg.isOwnMessage ? 'chat-message-right' : 'chat-message-left'}`}>
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
//                             <button className="chat-message-send-button" onClick={handleSendMessage}>
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


import { message } from 'antd';
import axios from 'axios';
import { Search, Send, Trash2, User, Video } from "lucide-react";
import React, { useEffect, useRef, useState } from 'react';

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
let ws;

const getUsers = async () => {
    try {
        const userData = JSON.parse(localStorage.getItem("auth_token"));
        loggedInUserId = userData.user.id;

        const response = await axios.post(
            "http://localhost:8000/api/chat/chatid-according-user/",
            { user_id: loggedInUserId },
            { headers: authHeader() }
        );
        const usersWithLastMessage = await Promise.all(response.data.data.map(async (chat) => {
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

        return usersWithLastMessage;
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
};

const getMessagesByChatUUID = async (uuid) => {
    try {
        const response = await axios.get(
            `http://localhost:8000/api/chat-message/chat-message-according-chat/?uuid=${uuid}`,
            { headers: authHeader() }
        );

        return response.data && response.data.data ? response.data : { data: [] };
    } catch (error) {
        console.error("Error fetching messages:", error);
        return { data: [] };
    }
};

const TeacherChat = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [userSearch, setUserSearch] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const fetchUsers = async () => {
            const data = await getUsers();
            setUsers(data);
        };
        fetchUsers();
    }, [messages]);

    useEffect(() => {
        const fetchMessages = async () => {
            if (selectedUser && selectedUser.uuid) {
                const messagesData = await getMessagesByChatUUID(selectedUser.uuid);
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
            }
        };
        fetchMessages();
    }, [selectedUser]);

    useEffect(() => {
        if (selectedUser) {
            ws = new WebSocket(`ws://localhost:8000/ws/chat/${selectedUser.uuid}/`);
            ws.onmessage = (event) => {
                const newMsg = JSON.parse(event.data);
                setMessages(prevMessages => [...prevMessages, newMsg]);
            };
            return () => ws.close();
        }
    }, [selectedUser]);

    const handleDeleteChat = async (user, e) => {
        e.stopPropagation(); // Prevent selecting the user when clicking delete
        try {
            // Delete chat messages
            await axios.delete(
                `http://localhost:8000/api/chat-message/${user.chatId}/`,
                { headers: authHeader() }
            );

            // Update the users list
            const updatedUsers = users.filter(u => u.id !== user.id);
            setUsers(updatedUsers);

            // If the deleted chat was selected, clear the selection
            if (selectedUser?.id === user.id) {
                setSelectedUser(null);
                setMessages([]);
            }

            message.success("Chat deleted successfully");
        } catch (error) {
            console.error("Error deleting chat:", error);
            message.error("Failed to delete chat");
        }
    };

    const handleSendMessage = async () => {
        if (newMessage.trim() === '') return;

        try {
            const existingChatResponse = await axios.post(
                "http://localhost:8000/api/chat/chatid-according-user/",
                { user_id: selectedUser.id },
                { headers: authHeader() }
            );

            let chatUUID;
            let chatId;

            if (existingChatResponse.data.data && existingChatResponse.data.data.length > 0) {
                const existingChat = existingChatResponse.data.data.find(
                    chat => chat.uuid === selectedUser.uuid
                );

                if (existingChat) {
                    chatUUID = existingChat.uuid;
                    chatId = existingChat.id;
                }
            }

            if (!chatId) {
                const createChatResponse = await axios.post(
                    'http://localhost:8000/api/chat/',
                    {
                        user_1: loggedInUserId,
                        user_2: selectedUser.id
                    },
                    { headers: authHeader() }
                );

                if (createChatResponse.data?.data?.id) {
                    chatId = createChatResponse.data.data.id;
                    chatUUID = createChatResponse.data.data.uuid;
                } else {
                    throw new Error("Failed to create a new chat");
                }
            }

            const messagePayload = {
                chatid: chatId,
                sender: loggedInUserId,
                message: newMessage,
            };

            await axios.post(
                "http://localhost:8000/api/chat-message/",
                messagePayload,
                { headers: authHeader() }
            );

            setNewMessage('');

            const messagesData = await getMessagesByChatUUID(chatUUID);
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
            console.error("Error sending message:", error);
            message.error("Failed to send message");
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
                        <Search className="chat-message-search-icon" size={20} />
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
                                    <User size={24} color="#6b7280" />
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
                                    <Trash2 size={16} />
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
                                    <User size={24} color="#6b7280" />
                                </div>
                                <div className="chat-message-user-info">
                                    <div className="chat-message-chatSide-user-name">
                                        {selectedUser.name}
                                    </div>
                                </div>
                                <Video
                                    className="chat-message-video-icon"
                                    size={24}
                                    style={{ cursor: "pointer", marginLeft: "auto" }}
                                    onClick={() => alert("Video call feature coming soon!")}
                                />
                            </div>
                        </div>

                        <div className="chat-message-message-container">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`chat-message-message-item ${msg.isOwnMessage ? 'chat-message-right' : 'chat-message-left'}`}
                                >
                                    <div className="chat-message-message-bubble">{msg.text}</div>
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
                            <button className="chat-message-send-button" onClick={handleSendMessage}>
                                <Send size={20} />
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