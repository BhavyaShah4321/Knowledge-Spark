import { DownOutlined, SearchOutlined } from '@ant-design/icons';
import { Avatar, Breadcrumb, Button, Col, Dropdown, Input, Menu, Row, Space, Table, Tooltip } from 'antd';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ReactComponent as FilterIcon } from '../../Image/FilterIcon.svg';

function StudentList() {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(false);

    // Fetch students details from the API
    const fetchStudentDetails = async (page = 1, searchQuery = '') => {
        try {
            setLoading(true);
            const authData = JSON.parse(localStorage.getItem('auth_token'));
            if (!authData || !authData.access_token) {
                console.error('Authentication tokens are missing. Please log in again.');
                return;
            }
            const accessToken = authData.access_token;
            const response = await axios.get(
                `http://localhost:8000/api/user/?page=${page}&search=Student&search_text=${searchQuery}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            const studentDetails = response.data;
            setData(studentDetails.results.data || []);
            setTotalItems(studentDetails.count || 0);
        } catch (error) {
            console.error('Error fetching student details:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle search text change
    const onSearchChange = (e) => {
        const value = e.target.value;
        setSearchText(value);

        // Filter data locally
        const filteredData = data.filter((item) =>
            item.username.toLowerCase().includes(value.toLowerCase()) ||
            item.email.toLowerCase().includes(value.toLowerCase())
        );

        setData(filteredData);
    };

    // Reset filter to the default
    const resetFilter = () => {
        setSearchText('');
        setCurrentPage(1);
        fetchStudentDetails(1);
    };

    // Handle row selection
    const rowSelection = {
        selectedRowKeys,
        onChange: (keys) => setSelectedRowKeys(keys),
    };

    useEffect(() => {
        fetchStudentDetails(currentPage);
    }, [currentPage]);

    // Update student status (Active/Inactive)
    const updateStudentStatus = async (id, isActive) => {
        try {
            const authData = JSON.parse(localStorage.getItem('auth_token'));
            if (!authData || !authData.access_token) {
                console.error('Authentication tokens are missing. Please log in again.');
                return;
            }
            const accessToken = authData.access_token;
            const response = await axios.patch(
                `http://localhost:8000/api/user/${id}/`,
                { is_active: isActive },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            if (response.status === 200) {
                fetchStudentDetails(currentPage); // Refresh the student list after updating
            }
        } catch (error) {
            console.error('Error updating student status:', error);
        }
    };

    // Menu for Active/Inactive toggle
    const menu = (record) => (
        <Menu
            onClick={({ key }) => {
                const newStatus = key === 'active';
                updateStudentStatus(record.id, newStatus);
            }}
        >
            <Menu.Item key="active" disabled={record.is_active}>
                Set to Active
            </Menu.Item>
            <Menu.Item key="inactive" disabled={!record.is_active}>
                Set to Inactive
            </Menu.Item>
        </Menu>
    );

    // Table columns configuration
    const columns = [
        {
            title: 'Sr. No.',
            key: 'index',
            render: (text, record, index) => (currentPage - 1) * 10 + index + 1,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (email) => {
                const getInitials = (email) => {
                    if (!email) return 'N/A';
                    return email.charAt(0).toUpperCase();
                };

                const backgroundColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;

                return (
                    <Space>
                        <Avatar
                            style={{
                                backgroundColor,
                                color: '#fff',
                            }}
                        >
                            {getInitials(email)}
                        </Avatar>
                        <span>{email}</span>
                    </Space>
                );
            },
            sorter: (a, b) => a.email.localeCompare(b.email),
        },
        {
            title: 'Student Name',
            dataIndex: 'username',
            key: 'username',
            sorter: (a, b) => a.username.localeCompare(b.username),
        },
        {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <Space>
                    <Tooltip title="Change Status">
                        <Dropdown overlay={menu(record)} trigger={['click']}>
                            <Button>
                                {record.is_active ? 'Active' : 'Inactive'} <DownOutlined />
                            </Button>
                        </Dropdown>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const handleTableChange = (pagination) => {
        setCurrentPage(pagination.current);
        fetchStudentDetails(pagination.current);
    };

    return (
        <div>
            <Row className="pagenamerow mb-0" justify="space-between" align="middle">
                <Col>
                    <h2>Students</h2>
                    <div className="bredcrumbwrp">
                        <Link to="/dashboard" className="back">
                            BACK
                        </Link>
                        <Breadcrumb
                            items={[
                                { title: <Link to="/dashboard">Home</Link> },
                                { title: 'Students' },
                            ]}
                        />
                    </div>
                </Col>
                <Col>
                    <Space size="small">
                        <Input
                            placeholder="Search"
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={onSearchChange}
                            style={{ width: '100%' }}
                        />
                        <Tooltip placement="top" title="Reset Filter">
                            <Button type="primary" className="iconlink" onClick={resetFilter}>
                                <FilterIcon />
                            </Button>
                        </Tooltip>
                    </Space>
                </Col>
            </Row>

            <Table
                rowSelection={rowSelection}
                dataSource={Array.isArray(data) ? data : []}
                columns={columns}
                rowKey="id"
                pagination={{
                    current: currentPage,
                    total: totalItems,
                    pageSize: 10,
                    showSizeChanger: false,
                }}
                loading={loading}
                onChange={handleTableChange}
                scroll={{
                    x: 1500,
                }}
            />
        </div>
    );
}

export default StudentList;
