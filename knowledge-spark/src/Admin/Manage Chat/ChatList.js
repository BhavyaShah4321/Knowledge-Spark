import { UserOutlined } from "@ant-design/icons";
import { Avatar, Input, message, Modal, Spin, Pagination } from "antd";
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
    const pageSize = 10;
    const authData = JSON.parse(localStorage.getItem("auth_token"));
    const accessToken = authData?.access_token;
    const loggedInUserId = authData?.user_id;

    useEffect(() => {
        fetchChats();
    }, [currentPage, search]);

    const fetchChats = async () => {
        try {
            if (!accessToken) {
                message.error("Unauthorized. Please log in again.");
                return;
            }

            const response = await axios.get("http://localhost:8000/api/chat/", {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: {
                    search,
                    page: currentPage,
                    page_size: pageSize,
                },
            });

            setChats(response.data.results);
            setTotalItems(response.data.count);
        } catch (error) {
            console.error("Error fetching chats:", error);
            message.error("Error fetching chat list.");
        } finally {
            setLoading(false);
        }
    };

    const openChatModal = (chat) => {
        setSelectedChat(chat);
        setIsModalOpen(true);
    };

    const closeChatModal = () => {
        setIsModalOpen(false);
        setSelectedChat(null);
    };

    // Function to determine row styling based on ID
    const getRowClassName = (record) => {
        return record.id % 2 === 0 ? "even-row" : "odd-row";
    };

    return (
        <div className="table-chat-container">
            <div className="table-header">
                <h1>Conversations</h1>
                <div className="table-search-wrapper">
                    <Input
                        placeholder="Search conversations..."
                        onChange={(e) => setSearch(e.target.value)}
                        className="table-search"
                        allowClear
                    />
                </div>
            </div>

            {loading ? (
                <div className="table-loading">
                    <Spin size="large" />
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Teacher</th>
                                <th>Student</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {chats.map((chat) => (
                                <tr 
                                    key={chat.id} 
                                    className={getRowClassName(chat)}
                                    onClick={() => openChatModal(chat)}
                                >
                                    <td className="chat-id">
                                        <div className="id-badge">{chat.id}</div>
                                    </td>
                                    <td className="user-cell">
                                        <Avatar 
                                            size="large" 
                                            icon={<UserOutlined />} 
                                            style={{ backgroundColor: "#1890ff" }}
                                        />
                                        <span className="username">{chat.user_1_username}</span>
                                    </td>
                                    <td className="user-cell">
                                        <Avatar 
                                            size="large" 
                                            icon={<UserOutlined />} 
                                            style={{ backgroundColor: "#f759ab" }}
                                        />
                                        <span className="username">{chat.user_2_username}</span>
                                    </td>
                                    <td>
                                        <button className="view-btn">View Chat</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {chats.length === 0 && (
                        <div className="no-results">
                            <h3>No conversations found</h3>
                            <p>Try adjusting your search query</p>
                        </div>
                    )}
                </div>
            )}

            <div className="pagination-container">
                <Pagination
                    current={currentPage}
                    total={totalItems}
                    pageSize={pageSize}
                    onChange={(page) => setCurrentPage(page)}
                    showSizeChanger={false}
                />
            </div>

            <Modal
                title={selectedChat ? `Conversation: ${selectedChat.user_1_username} & ${selectedChat.user_2_username}` : "Chat Messages"}
                open={isModalOpen}
                onCancel={closeChatModal}
                footer={null}
                width={700}
                className="chat-modal"
            >
                {selectedChat ? (
                    <ChatMessage chatUuid={selectedChat.uuid} loggedInUserId={loggedInUserId} />
                ) : (
                    <p>No chat selected</p>
                )}
            </Modal>
        </div>
    );
};

export default ChatList;