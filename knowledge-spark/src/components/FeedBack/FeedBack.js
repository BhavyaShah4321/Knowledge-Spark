import {
    DownOutlined,
    SearchOutlined,
  } from "@ant-design/icons";
  import {
      Avatar,
    Breadcrumb,
    Button,
    Col,
    Dropdown,
    Input,
    Menu,
    Row,
    Space,
    Table,
    Tooltip,
    message,
  } from "antd";
  import axios from "axios";
  import React, { useEffect, useState } from "react";
  import { Link, useNavigate } from "react-router-dom";
  import { ReactComponent as FilterIcon } from "../../Image/FilterIcon.svg";
  
  export default function FeedBack() {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(false);
    const [courseData, setCourseData] = useState([]);
    const navigate = useNavigate();
  
    const getAccessToken = () => {
      const authData = JSON.parse(localStorage.getItem("auth_token"));
      if (!authData?.access_token) {
        throw new Error("Authentication tokens are missing. Please log in again.");
      }
      return authData.access_token;
    };
  
    const fetchCourseDetails = async (page = 1) => {
      try {
        setLoading(true);
        const accessToken = getAccessToken();
        
        const response = await axios.get(`http://localhost:8000/api/course-feedback/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
  
        const FeedBackDetails = response.data;
        setCourseData(FeedBackDetails.results.data || []);
        setTotalItems(FeedBackDetails.count || 0);
      } catch (error) {
        console.error("Error fetching course details:", error);
        message.error("Failed to fetch course details");
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      fetchCourseDetails(currentPage);
    }, [currentPage]);
  
    const onSearchChange = (e) => {
      const value = e.target.value;
      setSearchText(value);
      
      // Filter data locally
      if (value) {
        const filteredData = courseData.filter(
          (item) =>
            item.course_title.toLowerCase().includes(value.toLowerCase()) ||
            item.course_description.toLowerCase().includes(value.toLowerCase()) ||
            item.course_teacher_username.toLowerCase().includes(value.toLowerCase())
        );
        setCourseData(filteredData);
      } else {
        fetchCourseDetails(currentPage);
      }
    };
  
    const resetFilter = () => {
      setSearchText("");
      setCurrentPage(1);
      fetchCourseDetails(1);
    };

    const getProfilePictureUrl = (feedback_student_profile_picture) => {
        if (!feedback_student_profile_picture) return null;
      
        // Ensure the URL is correctly formed
        return `http://localhost:8000/media/${feedback_student_profile_picture}`;
      };
      
  
  
    const columns = [
      {
        title: "Sr. No.",
        key: "index",
        render: (text, record, index) => (currentPage - 1) * 10 + index + 1,
      },
      {
        title: "Student Name",
        dataIndex: "feedback_student_username",
        key: "feedback_student_username",
      
      },
      {
        title: "Student Profile Picture",
        dataIndex: "feedback_student_profile_picture",
        key: "feedback_student_profile_picture",
        render: (feedback_student_profile_picture, record) => {
          const getInitials = (name) => {
            if (!name) return "N/A";
            return name.charAt(0).toUpperCase();
          };
  
          return (
            <Avatar
  size={64}
  src={feedback_student_profile_picture ? getProfilePictureUrl(feedback_student_profile_picture) : null}
  style={{
    backgroundColor: !feedback_student_profile_picture
      ? `#${Math.floor(Math.random() * 16777215).toString(16)}`
      : undefined,
  }}
>
  {!feedback_student_profile_picture && getInitials(record.feedback_student_username)}
</Avatar>
          );
        },
      },
      {
        title: "Student Email",
        dataIndex: "feedback_student_email",
        key: "feedback_student_email",
      
      },
      {
        title: "Course Name",
        dataIndex: "course_title",
        key: "course_title",
      },
    
      {
        title: "Feedback",
        dataIndex: "feedback_message",
        key: "feedback_message",
      },
    ];
  
    const rowSelection = {
      selectedRowKeys,
      onChange: (keys) => setSelectedRowKeys(keys),
    };
  
    const handleTableChange = (pagination) => {
      setCurrentPage(pagination.current);
    };
  
    return (
      <div>
        <Row className="pagenamerow mb-0" justify="space-between" align="middle">
          <Col>
            <h2>Feedback</h2>
            <div className="bredcrumbwrp">
              <Link to="/dashboard" className="back">
                BACK
              </Link>
              <Breadcrumb
                items={[
                  { title: <Link to="/dashboard">Home</Link> },
                  { title: "Feedback" },
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
                style={{ width: "200px" }}
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
      </div>
    );
  }