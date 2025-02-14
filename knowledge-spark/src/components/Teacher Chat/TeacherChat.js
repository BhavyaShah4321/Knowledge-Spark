import axios from 'axios';
import { Search, Send, User } from "lucide-react";
import React, { useEffect, useRef, useState } from 'react';

// AUTH HEADER FUNCTION
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

// CHAT SERVER INTERACTION
const getUsers = async () => {
    try {
        const userData = JSON.parse(localStorage.getItem("auth_token"));
        loggedInUserId = userData.user.id;

        const response = await axios.post(
            "http://localhost:8000/api/chat/chatid-according-user/",
            { user_id: loggedInUserId },
            { headers: authHeader() }
        );

        return response.data.data;
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
};

// FETCH MESSAGES ACCORDING TO CHAT UUID
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
            const formattedUsers = data.map((chat) => ({
                id: chat.user_1,
                name: chat.user_1_username,
                uuid: chat.uuid,
                status: 'online',
                lastMessage: 'Last message here...',
            }));
            setUsers(formattedUsers);
        };
        fetchUsers();
    }, []);

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

    const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(userSearch.toLowerCase())
    );

    const handleSendMessage = async () => {
        if (newMessage.trim() !== '') {
            try {
                const chatResponse = await axios.get(`http://localhost:8000/api/chat-message/chat-message-according-chat/?uuid=${selectedUser.uuid}`, { headers: authHeader() });
                const chatData = chatResponse.data.data[0]; // Get the first message data

                // Ensure chatid is correctly obtained
                const payload = {
                    chatid: chatData.chatid, // Make sure this matches the database
                    sender: loggedInUserId,
                    message: newMessage
                };

                await axios.post("http://localhost:8000/api/chat-message/", payload, { headers: authHeader() });
                setNewMessage('');
            } catch (error) {
                console.error("Error sending message:", error.response.data);
            }
        }
    };


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
                                {/* <div className={`status-indicator ${user.status === 'online' ? 'status-online' : 'status-offline'}`} /> */}
                            </div>
                            <div className="chat-message-user-info">
                                <div className="chat-message-user-name">{user.name}</div>
                                <div className="chat-message-last-message">{user.lastMessage}</div>
                            </div>
                            <span className="chat-message-timestamp">12:34 PM</span>
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
                                    <div className="chat-message-user-name">{selectedUser.name}</div>
                                    {/* <div className="last-message">
                                         <span className={`status-indicator ${selectedUser.status === 'online' ? 'status-online' : 'status-offline'}`} />
                                         {selectedUser.status === 'online' ? 'Online' : 'Offline'}
                                    // </div> */}
                                </div>
                            </div>
                        </div>
                        <div className="chat-message-message-container">
                            {messages.map((msg, index) => (
                                <div key={index} className={`chat-message-message-item ${msg.isOwnMessage ? 'chat-message-right' : 'chat-message-left'}`}>
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


// import axios from 'axios';
// import { Search, Send, User } from "lucide-react";
// import React, { useEffect, useRef, useState } from 'react';

// // AUTH HEADER FUNCTION
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
// let reconnectInterval = 5000; // 5 seconds

// // CHAT SERVER INTERACTION
// const getUsers = async () => {
//     try {
//         const userData = JSON.parse(localStorage.getItem("auth_token"));
//         loggedInUserId = userData.user.id;

//         const response = await axios.post(
//             "http://localhost:8000/api/chat/chatid-according-user/",
//             { user_id: loggedInUserId },
//             { headers: authHeader() }
//         );

//         return response.data.data;
//     } catch (error) {
//         console.error("Error fetching users:", error);
//         return [];
//     }
// };

// // FETCH MESSAGES ACCORDING TO CHAT UUID
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
//             const formattedUsers = data.map((chat) => ({
//                 id: chat.user_1,
//                 name: chat.user_1_username,
//                 uuid: chat.uuid,
//                 status: 'online',
//                 lastMessage: 'Last message here...',
//             }));
//             setUsers(formattedUsers);
//         };
//         fetchUsers();
//     }, []);

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

//     // WebSocket Initialization and Reconnection
//     const connectWebSocket = () => {
//         if (selectedUser?.uuid) {
//             ws = new WebSocket(`ws://localhost:8000/ws/chat-message/${selectedUser.uuid}/`);

//             ws.onopen = () => {
//                 console.log('WebSocket Connected');
//                 // Reset reconnect interval on successful connection
//                 reconnectInterval = 5000;

//                 // Start Heartbeat Ping
//                 const heartbeat = setInterval(() => {
//                     if (ws.readyState === WebSocket.OPEN) {
//                         ws.send(JSON.stringify({ type: 'ping' }));
//                     }
//                 }, 30000); // Ping every 30 seconds

//                 // Cleanup heartbeat on unmount or close
//                 return () => clearInterval(heartbeat);
//             };

//             ws.onmessage = (event) => {
//                 const messageData = JSON.parse(event.data);
//                 setMessages(prevMessages => [...prevMessages, {
//                     sender: messageData.sender_username,
//                     text: messageData.message,
//                     isOwnMessage: messageData.sender === loggedInUserId,
//                     timestamp: new Date(messageData.created_at).toLocaleTimeString([], {
//                         hour: '2-digit',
//                         minute: '2-digit'
//                     })
//                 }]);
//             };

//             ws.onerror = (error) => {
//                 console.error('WebSocket Error:', error);
//             };

//             ws.onclose = (event) => {
//                 console.log('WebSocket Closed:', event);
//                 // Attempt to reconnect
//                 setTimeout(() => {
//                     console.log('Reconnecting WebSocket...');
//                     reconnectInterval = Math.min(reconnectInterval * 2, 60000); // Exponential backoff
//                     connectWebSocket();
//                 }, reconnectInterval);
//             };
//         }
//     };

//     // UseEffect to Manage WebSocket Connection
//     useEffect(() => {
//         connectWebSocket();

//         // Cleanup on component unmount or when selectedUser changes
//         return () => {
//             if (ws) {
//                 ws.close();
//             }
//         };
//     }, [selectedUser?.uuid]);

//     const filteredUsers = users.filter((user) =>
//         user.name.toLowerCase().includes(userSearch.toLowerCase())
//     );

//     const handleSendMessage = () => {
//         if (ws && ws.readyState === WebSocket.OPEN) {
//             const messageData = {
//                 chatid: selectedUser?.uuid,
//                 sender: loggedInUserId,
//                 message: newMessage,
//             };
//             ws.send(JSON.stringify(messageData));
//             setNewMessage('');

//             // Update UI immediately for a better UX
//             setMessages(prevMessages => [...prevMessages, {
//                 sender: 'You',
//                 text: newMessage,
//                 isOwnMessage: true,
//                 timestamp: new Date().toLocaleTimeString([], {
//                     hour: '2-digit',
//                     minute: '2-digit'
//                 })
//             }]);
//         } else {
//             console.error('Cannot send message. WebSocket is not open.');
//         }
//     };


//     return (
//         <div className="chat-container">
//             <div className="sidebar">
//                 <div className="search-header">
//                     <div className="search-container">
//                         <Search className="search-icon" size={20} />
//                         <input
//                             className="search-input"
//                             placeholder="Search conversations..."
//                             value={userSearch}
//                             onChange={(e) => setUserSearch(e.target.value)}
//                         />
//                     </div>
//                 </div>

//                 <div className="users-list">
//                     {filteredUsers.map((user) => (
//                         <div
//                             key={user.id}
//                             className={`user-item ${selectedUser?.id === user.id ? 'active' : ''}`}
//                             onClick={() => setSelectedUser(user)}
//                         >
//                             <div className="avatar-container">
//                                 <div className="avatar">
//                                     <User size={24} color="#6b7280" />
//                                 </div>
//                                 {/* <div className={`status-indicator ${user.status === 'online' ? 'status-online' : 'status-offline'}`} /> */}
//                             </div>
//                             <div className="user-info">
//                                 <div className="user-name">{user.name}</div>
//                                 <div className="last-message">{user.lastMessage}</div>
//                             </div>
//                             <span className="timestamp">12:34 PM</span>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//             <div className="chat-area">
//                 {selectedUser ? (
//                     <>
//                         <div className="chat-header">
//                             <div className="chat-header-content">
//                                 <div className="avatar">
//                                     <User size={24} color="#6b7280" />
//                                 </div>
//                                 <div className="user-info">
//                                     <div className="user-name">{selectedUser.name}</div>
//                                     {/* <div className="last-message">
//                                          <span className={`status-indicator ${selectedUser.status === 'online' ? 'status-online' : 'status-offline'}`} />
//                                          {selectedUser.status === 'online' ? 'Online' : 'Offline'}
//                                     // </div> */}
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="message-container">
//                             {messages.map((msg, index) => (
//                                 <div key={index} className={`message-item ${msg.isOwnMessage ? 'right' : 'left'}`}>
//                                     <div className="message-bubble">{msg.text}</div>
//                                     <span className="timestamp">{msg.timestamp}</span>
//                                 </div>
//                             ))}
//                             <div ref={messagesEndRef} />
//                         </div>

//                         <div className="input-area">
//                             <input
//                                 className="message-input"
//                                 placeholder="Type your message..."
//                                 value={newMessage}
//                                 onChange={(e) => setNewMessage(e.target.value)}
//                                 onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
//                             />
//                             <button className="send-button" onClick={handleSendMessage}>
//                                 <Send size={20} />
//                             </button>
//                         </div>
//                     </>
//                 ) : (
//                     <div className="empty-state">
//                         <p>Select a conversation to start messaging</p>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default TeacherChat;
