import { DownOutlined, SearchOutlined } from '@ant-design/icons';
import { Avatar, Breadcrumb, Button, Col, Dropdown, Input, Menu, Row, Space, Table, Tooltip } from 'antd';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ReactComponent as FilterIcon } from '../../Image/FilterIcon.svg';


export default function Courses() {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
        const [searchText, setSearchText] = useState('');
        const [data, setData] = useState([]);
        const [currentPage, setCurrentPage] = useState(1);
        const [totalItems, setTotalItems] = useState(0);
        const [loading, setLoading] = useState(false);
        const onSearchChange = (e) => {
            const value = e.target.value;
            setSearchText(value);
            // fetchTeacherDetails(1, value);
        };
    
        const resetFilter = () => {
            setSearchText('');
            setCurrentPage(1);
            // fetchTeacherDetails(1);
        };
    
        const rowSelection = {
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
        };
        const columns = [
                {
                    title: 'Sr. No.',
                    key: 'index',
                    render: (text, record, index) => (currentPage - 1) * 10 + index + 1,
                },
                {
                    title: 'Course Number',
                    dataIndex: 'course_number',
                    key: 'course_number',
                   
                },
                {
                    title: 'Course Name',
                    dataIndex: 'course_name',
                    key: 'course_name',
                    sorter: (a, b) => a.username.localeCompare(b.username),
                },
                {
                    title: 'Course Title',
                    dataIndex: 'course_title',
                    key: 'course_title',
                    sorter: (a, b) => a.email.localeCompare(b.email),
                },
                {
                    title: 'Course Description',
                    dataIndex: 'course_description',
                    key: 'course_description',
                    sorter: (a, b) => a.email.localeCompare(b.email),
                },
               
                {
                    title: 'Action',
                    key: 'action',
                    render: (text, record) => (
                        <Space>
                            <Tooltip title="View">
                                <Dropdown overlay={Menu(record)} trigger={['click']}>
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
                // fetchTeacherDetails(pagination.current);
            };
  return (

    <div>
            <Row className="pagenamerow mb-0" justify="space-between" align="middle">
                <Col>
                    <h2>Courses</h2>
                    <div className="bredcrumbwrp">
                        <Link to="/dashboard" className="back">
                            BACK
                        </Link>
                        <Breadcrumb
                            items={[
                                { title: <Link to="/dashboard">Home</Link> },
                                { title: 'Courses' },
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
  )
}
