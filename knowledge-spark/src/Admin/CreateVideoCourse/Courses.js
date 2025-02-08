import {
  EditOutlined,
  SearchOutlined
} from "@ant-design/icons";
import {
  Breadcrumb,
  Button,
  Col,
  Drawer,
  Form,
  Input,
  Row,
  Space,
  Table,
  Tooltip,
  message
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
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form] = Form.useForm();
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

  const openEditDrawer = (course) => {
    setEditingCourse(course);
    form.setFieldsValue(course);
    setEditDrawerOpen(true);
  };

  const handleEditSubmit = async (values) => {
    try {
      if (!editingCourse?.id) {
        message.error("No course selected for editing");
        return;
      }

      const formData = new FormData();

  
      const form_data = {
        course_description: values.course_description,
        course_title: values.course_title,
        course_price: values.course_price,
      };
  
      formData.append("form_data", JSON.stringify(form_data));
      setLoading(true);
      const accessToken = getAccessToken();
  
      const response = await axios.patch(
        `http://localhost:8000/api/course/${editingCourse.id}/`,
         formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      if (response.status === 200) {
        message.success("Course updated successfully");
        setEditDrawerOpen(false);
        fetchCourseDetails(currentPage); // Refresh course list
      }
    } catch (error) {
      console.error("Error updating course:", error);
      message.error("Failed to update course");
    } finally {
      setLoading(false);
    }
  };
  

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
        <Tooltip title="View Course Video">
        <a
          onClick={() => navigate(`/view-course/${record.id}`)}
          style={{ color: "#1890ff", cursor: "pointer" }}
        >
          {text}
        </a>
        </Tooltip>
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
      title: "Course Category",
      dataIndex: "course_category",
      key: "course_category",
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (text, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button icon={<EditOutlined/>} style={{ cursor: "pointer" }} onClick={() => openEditDrawer(record)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

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
              // onChange={onSearchChange}
              style={{ width: "100%" }}
            />
            <Tooltip placement="top" title="Reset Filter">
              <Button type="primary" className="iconlink"
              //  onClick={resetFilter}
               >
                <FilterIcon />
              </Button>
            </Tooltip>
            {/* <Tooltip title="Add Student">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                // onClick={showDrawer}
              >
                Add Student
              </Button>
            </Tooltip> */}
          </Space>
        </Col>
      </Row>

      <Table
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
      />

      {/* Edit Drawer */}
      <Drawer
        title="Edit Course"
        placement="right"
        width={400}
        onClose={() => setEditDrawerOpen(false)}
        open={editDrawerOpen}
      >
        <Form form={form} layout="vertical" onFinish={handleEditSubmit}>
          <Form.Item
            label="Course Title"
            name="course_title"
            rules={[{ required: true, message: "Please enter course title" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Course Description"
            name="course_description"
            rules={[{ required: true, message: "Please enter course description" }]}
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item
            label="Course Price"
            name="course_price"
            rules={[{ required: true, message: "Please enter course price" }]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Update Course
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
