import { DownOutlined, SearchOutlined } from '@ant-design/icons';
import { Avatar, Breadcrumb, Button, Col, Dropdown, Input, Modal, Row, Space, Table, Tooltip } from 'antd';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ReactComponent as FilterIcon } from '../../Image/FilterIcon.svg';

export default function Courses() {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(false);
    const [courseData, setCourseData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);

    useEffect(() => {
        const fetchCourseDetails = async (page = 1) => {
            try {
                setLoading(true);
                const authData = JSON.parse(localStorage.getItem('auth_token'));
                if (!authData || !authData.access_token) {
                    console.error('Authentication tokens are missing. Please log in again.');
                    return;
                }
                const accessToken = authData.access_token;
                const response = await axios.get(`http://localhost:8000/api/course/`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                const CourseDetails = response.data;
                setCourseData(CourseDetails.results.data || []);
                setTotalItems(CourseDetails.count || 0);
            } catch (error) {
                console.error('Error fetching course details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourseDetails();
    }, []);

    const onSearchChange = (e) => {
        const value = e.target.value;
        setSearchText(value);
    };

    const resetFilter = () => {
        setSearchText('');
        setCurrentPage(1);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: (keys) => setSelectedRowKeys(keys),
    };

    const handleCourseClick = (course) => {
        setSelectedCourse(course);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedCourse(null);
    };

    const columns = [
        {
            title: 'Sr. No.',
            key: 'index',
            render: (text, record, index) => (currentPage - 1) * 10 + index + 1,
        },
        {
            title: 'Course Title',
            dataIndex: 'course_title',
            key: 'course_title',
            render: (text, record) => (
                <a onClick={() => handleCourseClick(record)} style={{ color: '#1890ff', cursor: 'pointer' }}>
                    {text}
                </a>
            ),
        },
        {
            title: 'Course Description',
            dataIndex: 'course_description',
            key: 'course_description',
        },
        {
            title: 'Teacher Name',
            dataIndex: 'course_teacher',
            key: 'course_teacher',
        },
        {
            title: 'Status',
            dataIndex: 'course_status',
            key: 'course_status',
        },
    ];

    const handleTableChange = (pagination) => {
        setCurrentPage(pagination.current);
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
                dataSource={Array.isArray(courseData) ? courseData : []}
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

            <Modal
                title="Course Details"
                visible={isModalOpen}
                onCancel={closeModal}
                footer={[
                    <Button key="close" type='primary' className="iconlink"  onClick={closeModal}>
                        Close
                    </Button>,
                ]}
            >
                {selectedCourse && (
                    <div>
                        <p><strong>Title:</strong> {selectedCourse.course_title}</p>
                        <p><strong>Description:</strong> {selectedCourse.course_description}</p>
                        <p><strong>Teacher Name:</strong> {selectedCourse.course_teacher}</p>
                        <p><strong>Status:</strong> {selectedCourse.course_status}</p>
                        {selectedCourse.video_url && (
                            <div>
                                <strong>Video:</strong>
                                <div style={{ marginTop: '10px' }}>
                                    <iframe
                                        width="100%"
                                        height="315"
                                        src={selectedCourse.video_url}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}
