import {
  DownOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
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

export default function Courses() {
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
      
      const response = await axios.get(`http://localhost:8000/api/course/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const CourseDetails = response.data;
      setCourseData(CourseDetails.results.data || []);
      setTotalItems(CourseDetails.count || 0);
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

  const updateCourseStatus = async (id, status) => {
    try {
      setLoading(true);
      const accessToken = getAccessToken();

      const formData = new FormData();
      const form_data = {
         course_status:status,
      };

      // Add form_data as a stringified JSON
      formData.append("form_data", JSON.stringify(form_data));
  
  
      const response = await axios.patch(
        `http://localhost:8000/api/course/${id}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      if (response.status === 200) {
        // Update the local state immediately
        setCourseData((prevData) =>
          prevData.map((course) =>
            course.id === id ? { ...course, course_status: status } : course
          )
        );
        message.success("Course status updated successfully");
      }
    } catch (error) {
      console.error("Error updating course status:", error);
      message.error("Failed to update course status");
    } finally {
      setLoading(false);
    }
  };
  

  const handleCourseClick = (course) => {
    navigate(`/view-course/${course.id}`);
  };

  const menu = (record) => (
    <Menu
      onClick={({ key }) => {
        updateCourseStatus(record.id, key); // Pass active/inactive
      }}
    >
      <Menu.Item key="active" disabled={record.course_status === "active"}>
        Set to Active
      </Menu.Item>
      <Menu.Item key="inactive" disabled={record.course_status === "inactive"}>
        Set to Inactive
      </Menu.Item>
    </Menu>
  );

  const columns = [
    {
      title: "Sr. No.",
      key: "index",
      render: (text, record, index) => (currentPage - 1) * 10 + index + 1,
    },
    {
      title: "Course Title",
      dataIndex: "course_title",
      key: "course_title",
      render: (text, record) => (
        <a
          onClick={() => handleCourseClick(record)}
          style={{ color: "#1890ff", cursor: "pointer" }}
        >
          {text}
        </a>
      ),
    },
    {
      title: "Course Description",
      dataIndex: "course_description",
      key: "course_description",
    },
    {
      title: "Course Price",
      dataIndex: "course_price",
      key: "course_price",
      render: (price) => `₹${price}`,
    },
    {
      title: "Teacher Name",
      dataIndex: "course_teacher_username",
      key: "course_teacher_username",
    },
    {
      title: "Status",
      key: "status",
      render: (text, record) => (
        <Space>
          <Tooltip title="Change Status">
            <Dropdown overlay={menu(record)} trigger={["click"]}>
              <Button
                // type={record.course_status === "active" ? "primary" : "default"}
                className={
                  record.course_status === "active"
                    ? "bg-green-500"
                    : "bg-red-500"
                }
              >
                {record.course_status === "active" ? "Active" : "Inactive"}{" "}
                <DownOutlined />
              </Button>
            </Dropdown>
          </Tooltip>
        </Space>
      ),
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
          <h2>Courses</h2>
          <div className="bredcrumbwrp">
            <Link to="/dashboard" className="back">
              BACK
            </Link>
            <Breadcrumb
              items={[
                { title: <Link to="/dashboard">Home</Link> },
                { title: "Courses" },
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
        // rowSelection={rowSelection}
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