import { UserOutlined } from "@ant-design/icons";
import { Avatar, Input, Spin, Table, message } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";

const ChatList = () => {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

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

                if (response.data.success) {
                    setChats(response.data.data);
                } else {
                    message.error("Failed to fetch chats.");
                }
            } catch (error) {
                console.error("Error fetching chats:", error);
                message.error("Error fetching chat list.");
            } finally {
                setLoading(false);
            }
        };

        fetchChats();
    }, []);

    // Filtered chats based on search
    const filteredChats = chats.filter(chat =>
        chat.user_1_username.toLowerCase().includes(search.toLowerCase()) ||
        chat.user_2_username.toLowerCase().includes(search.toLowerCase())
    );

    const columns = [
        {
            title: "Sr. No.",
            key: "srNo",
            render: (text, record, index) => filteredChats.indexOf(record) + 1, // Ensures continuous numbering
        },
        {
            title: "User 1",
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
            title: "User 2",
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
                    pagination={{ pageSize: 10 }} // ✅ Set pagination to 10 rows per page
                    bordered
                />
            )}
        </div>
    );
};

export default ChatList;
