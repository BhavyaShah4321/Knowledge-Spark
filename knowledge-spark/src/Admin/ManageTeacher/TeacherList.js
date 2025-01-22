import { DownOutlined, SearchOutlined } from '@ant-design/icons';
import { Avatar, Breadcrumb, Button, Col, Dropdown, Input, Menu, Row, Space, Table, Tooltip } from 'antd';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ReactComponent as FilterIcon } from '../../Image/FilterIcon.svg';

function TeacherList() {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchTeacherDetails = async (page = 1) => {
    try {
      setLoading(true);
      const authData = JSON.parse(localStorage.getItem('auth_token'));
      if (!authData || !authData.access_token) {
        console.error('Authentication tokens are missing. Please log in again.');
        return;
      }
      const accessToken = authData.access_token;
      const response = await axios.get(
        `http://localhost:8000/api/user/?page=${page}&search=Teacher`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const teacherDetails = response.data;
      setData(teacherDetails.results.data || []);
      setTotalItems(teacherDetails.count || 0);
    } catch (error) {
      console.error('Error fetching teacher details:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    fetchTeacherDetails(1, value);
  };

  const resetFilter = () => {
    setSearchText('');
    setCurrentPage(1);
    fetchTeacherDetails(1);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  };

  useEffect(() => {
    fetchTeacherDetails(currentPage);
  }, [currentPage]);


  const menu = (record) => (
    <Menu>
      <Menu.Item key="active">{record.isActive ? 'Active' : 'Set to Active'}</Menu.Item>
      <Menu.Item key="inactive">{record.isActive ? 'Set to Inactive' : 'Inactive'}</Menu.Item>
    </Menu>
  );

  const columns = [
    {
      title: 'Sr. No.',
      key: 'index',
      render: (text, record, index) => (currentPage - 1) * 10 + index + 1,
    },
    {
      title: 'Profile Picture',
      dataIndex: 'email',
      key: 'profile_picture',
      render: (email) => {
        const getInitials = (email) => {
          if (!email) return 'N/A';
          const namePart = email.split('@')[0];
          const initials = namePart
            .split(/[\W_]/)
            .map((word) => word.charAt(0).toUpperCase())
            .join('');
          return initials.slice(0, 2);
        };

        const backgroundColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
        return (
          <Avatar
            style={{
              backgroundColor: backgroundColor,
              color: '#fff',
            }}
          >
            {getInitials(email)}
          </Avatar>
        );
      },
    },
    {
      title: 'Teacher Name',
      dataIndex: 'username',
      key: 'username',
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    // {
    //   title: 'Bio',
    //   dataIndex: 'bio',
    //   key: 'bio',
    // },
    // {
    //   title: 'DOB',
    //   dataIndex: 'dob',
    //   key: 'dob',
    // },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Space>
          <Tooltip title="View">
            <Dropdown overlay={menu(record)} trigger={['click']}>
              <Button>
                {record.isActive ? 'Active' : 'Inactive'} <DownOutlined />
              </Button>
            </Dropdown>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    fetchTeacherDetails(pagination.current);
  };

  return (
    <div>
      <Row className="pagenamerow mb-0" justify="space-between" align="middle">
        <Col>
          <h2>Teachers</h2>
          <div className="bredcrumbwrp">
            <Link to="/dashboard" className="back">
              BACK
            </Link>
            <Breadcrumb
              items={[
                { title: <Link to="/dashboard">Home</Link> },
                { title: 'Teachers' },
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

export default TeacherList;
