import {
  DownOutlined,
  SearchOutlined,
  EditOutlined,
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
  Drawer,
  Form,
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
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState(null);
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

    if (value) {
      const filteredData = courseData.filter(
        (item) =>
          item.course_title.toLowerCase().includes(value.toLowerCase()) ||
          item.feedback_message.toLowerCase().includes(value.toLowerCase()) ||
          item.feedback_student_username.toLowerCase().includes(value.toLowerCase())
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
    return `http://localhost:8000/media/${feedback_student_profile_picture}`;
  };

  const handleEditClick = (record) => {
    setEditingFeedback(record);
    form.setFieldsValue({
      feedback_message: record.feedback_message,
    });
    setEditDrawerOpen(true);
  };

  // const handleEditClick = (record) => {
  //   setEditingFeedback(record);
  //   form.setFieldsValue({
  //     feedback_message: record.feedback_message,
  //   });
  //   setEditDrawerOpen(true);
  // };

  const handleEditSubmit = async (values) => {
    try {
      if (!editingFeedback?.id || !editingFeedback?.feedback_student || !editingFeedback?.course) {
        message.error("No feedback, student ID, or course ID selected for editing");
        return;
      }

      const formData = {
        feedback_message: values.feedback_message,
        feedback_student: editingFeedback.feedback_student,
        course: editingFeedback.course,
      };

      setLoading(true);
      const accessToken = getAccessToken();

      const response = await axios.patch(
        `http://localhost:8000/api/course-feedback/${editingFeedback.id}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        message.success("Feedback updated successfully");
        setEditDrawerOpen(false);
        fetchCourseDetails(currentPage);
      }
    } catch (error) {
      console.error("Error updating feedback:", error);
      message.error("Failed to update feedback");
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
      title: "Student Name",
      dataIndex: "feedback_student_username",
      key: "feedback_student_username",
    },
    {
      title: "Student ID",
      dataIndex: "feedback_student",
      key: "feedback_student",
    },
    {
      title: "Feedback",
      dataIndex: "feedback_message",
      key: "feedback_message",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Tooltip title="Edit Feedback">
          <Button icon={<EditOutlined />} onClick={() => handleEditClick(record)} />
        </Tooltip>
      ),
    },
  ];

  return (

    <div>
      <Row className="pagenamerow mb-0" justify="space-between" align="middle">
        <Col>
          <h2>Feedback</h2>
          <div className="bredcrumbwrp">
            <Link to="/dashboard" className="back">
              BACK
            </Link>
            <Breadcrumb items={[{ title: <Link to="/dashboard">Home</Link> }, { title: "Feedback" }]} />
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
        scroll={{ x: 1500 }}
      />

      <Drawer title="Edit Feedback" placement="right" onClose={() => setEditDrawerOpen(false)} open={editDrawerOpen}>
        <Form form={form} layout="vertical" onFinish={handleEditSubmit}>
          <Form.Item label="Feedback" name="feedback_message" rules={[{ required: true, message: "Enter feedback" }]}> 
            <Input.TextArea />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Update Feedback
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}