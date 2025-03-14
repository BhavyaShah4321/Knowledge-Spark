// import { UserOutlined } from "@ant-design/icons";
// import { Avatar, Input, message, Modal, Spin, Table } from "antd";
// import axios from "axios";
// import { useEffect, useState } from "react";
// import ChatMessage from "../../Admin/Manage Chat/ChatMessage";

// const ChatList = () => {
//     const [chats, setChats] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [search, setSearch] = useState("");
//     const [selectedChat, setSelectedChat] = useState(null);
//     const [isModalOpen, setIsModalOpen] = useState(false);

//     useEffect(() => {
//         const fetchChats = async () => {
//             try {
//                 const authData = JSON.parse(localStorage.getItem("auth_token"));
//                 const accessToken = authData?.access_token;
//                 if (!accessToken) {
//                     message.error("Unauthorized. Please log in again.");
//                     return;
//                 }

//                 const response = await axios.get("http://localhost:8000/api/chat/", {
//                     headers: { Authorization: `Bearer ${accessToken}` },
//                 });

//                 if (response.data.success) {
//                     setChats(response.data.data);
//                 } else {
//                     message.error("Failed to fetch chats.");
//                 }
//             } catch (error) {
//                 console.error("Error fetching chats:", error);
//                 message.error("Error fetching chat list.");
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchChats();
//     }, []);

//     // Filtered chats based on search input
//     const filteredChats = chats.filter(chat =>
//         chat.user_1_username.toLowerCase().includes(search.toLowerCase()) ||
//         chat.user_2_username.toLowerCase().includes(search.toLowerCase())
//     );

//     const openChatModal = (chat) => {
//         setSelectedChat(chat.uuid); // Ensure correct UUID is stored
//         setIsModalOpen(true);
//         console.log("Selected Chat:", chat.uuid);
//     };

//     useEffect(() => {
//         console.log("Updated SelectedChat:", selectedChat);
//     }, [selectedChat]);

//     const closeChatModal = () => {
//         setIsModalOpen(false);
//         setSelectedChat(null);
//     };

//     const columns = [
//         {
//             title: "Sr. No.",
//             key: "srNo",
//             render: (text, record, index) => filteredChats.indexOf(record) + 1,
//         },
//         {
//             title: "Teacher",
//             dataIndex: "user_1_username",
//             key: "user_1",
//             render: (text) => (
//                 <div className="user-cell">
//                     <Avatar size="large" icon={<UserOutlined />} />
//                     <span>{text}</span>
//                 </div>
//             ),
//         },
//         {
//             title: "Student",
//             dataIndex: "user_2_username",
//             key: "user_2",
//             render: (text) => (
//                 <div className="user-cell">
//                     <Avatar size="large" icon={<UserOutlined />} />
//                     <span>{text}</span>
//                 </div>
//             ),
//         },
//     ];

//     return (
//         <div className="chat-container">
//             <div className="chat-header">
//                 <h1>Chat List</h1>
//                 <Input
//                     placeholder="Search chats..."
//                     onChange={(e) => setSearch(e.target.value)}
//                     className="chat-search"
//                 />
//             </div>

//             {loading ? (
//                 <div className="loading-container">
//                     <Spin size="large" />
//                 </div>
//             ) : (
//                 <Table
//                     className="chat-table"
//                     dataSource={filteredChats}
//                     columns={columns}
//                     rowKey={(record) => record.id}
//                     pagination={{ pageSize: 10 }}
//                     bordered
//                     onRow={(record) => ({
//                         onClick: () => openChatModal(record),
//                     })}
//                 />
//             )}

//             {/* Chat Modal */}
//             <Modal
//                 title="Chat Messages"
//                 open={isModalOpen}
//                 onCancel={closeChatModal}
//                 footer={null}
//                 width={600}
//             >
//                 {selectedChat ? (
//                     <ChatMessage chatUuid={selectedChat} /> // Corrected prop name
//                 ) : (
//                     <p>No chat selected</p>
//                 )}
//             </Modal>
//         </div>
//     );
// };

// export default ChatList;


import { UserOutlined } from "@ant-design/icons";
import { Avatar, Input, message, Modal, Spin, Table } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import ChatMessage from "../../Admin/Manage Chat/ChatMessage";

const ChatList = () => {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedChat, setSelectedChat] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
     const [currentPage, setCurrentPage] = useState(1);
      const [totalItems, setTotalItems] = useState(0);

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

                setChats(response.data.results);
            } catch (error) {
                console.error("Error fetching chats:", error);
                message.error("Error fetching chat list.");
            } finally {
                setLoading(false);
            }
        };

        fetchChats();
    }, []);

    // Filtered chats based on search input
    const filteredChats = chats.filter(chat =>
        chat.user_1_username.toLowerCase().includes(search.toLowerCase()) ||
        chat.user_2_username.toLowerCase().includes(search.toLowerCase())
    );

    const openChatModal = (chat) => {
        setSelectedChat(chat);
        setIsModalOpen(true);
    };

    const closeChatModal = () => {
        setIsModalOpen(false);
        setSelectedChat(null);
    };

    const columns = [
        {
            title: "Sr. No.",
            key: "srNo",
            render: (text, record, index) => filteredChats.indexOf(record) + 1,
        },
        {
            title: "Teacher",
            dataIndex: "user_1_username",
            key: "user_1",
            render: (text) => (
                <div className="user-cell">
                    <Avatar size="large" icon={<UserOutlined />} />
                    <span>{text}</span>
                </div>
            ),
        },
        {
            title: "Student",
            dataIndex: "user_2_username",
            key: "user_2",
            render: (text) => (
                <div className="user-cell">
                    <Avatar size="large" icon={<UserOutlined />} />
                    <span>{text}</span>
                </div>
            ),
        },
    ];

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h1>Chat List</h1>
                <Input
                    placeholder="Search chats..."
                    onChange={(e) => setSearch(e.target.value)}
                    className="chat-search"
                />
            </div>

            {loading ? (
                <div className="loading-container">
                    <Spin size="large" />
                </div>
            ) : (
                <Table
                    className="chat-table"
                    dataSource={filteredChats}
                    columns={columns}
                    rowKey={(record) => record.id}
                    pagination={{
                        current: currentPage,
                        total: totalItems,
                        showTotal: (total) => `Total ${total} items`, // This will display the total records
                      }}
                    bordered
                    onRow={(record) => ({
                        onClick: () => openChatModal(record),
                    })}
                />
            )}

            {/* Chat Modal */}
            <Modal
                title={selectedChat ? `${selectedChat.user_1_username} & ${selectedChat.user_2_username}` : "Chat Messages"}
                open={isModalOpen}
                onCancel={closeChatModal}
                footer={null}
                width={600}
            >
                {selectedChat ? (
                    <ChatMessage chatUuid={selectedChat.uuid} />
                ) : (
                    <p>No chat selected</p>
                )}
            </Modal>
        </div>
    );
};

export default ChatList;
