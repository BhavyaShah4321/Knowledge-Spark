import {
  SearchOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {
  Breadcrumb,
  Button,
  Col,
  Input,
  Row,
  Space,
  Table,
  Tooltip,
  message,
  Form,
  Modal,
} from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ReactComponent as FilterIcon } from "../../Image/FilterIcon.svg";

export default function FeedBack() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [courseData, setCourseData] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
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

  const handleSearch = async () => {
    try {
      setLoading(true);
      setCurrentPage(1); // Reset to first page when searching
      const accessToken = getAccessToken();

      const response = await axios.get(
        `http://localhost:8000/api/course-feedback/`, // Base URL
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            search: searchQuery, // ✅ Correctly passing search parameter
          },
        }
      );

      const FeedBackDetails = response.data;
      setCourseData(FeedBackDetails.results.data || []); // ✅ Ensure data exists
      setTotalItems(FeedBackDetails.count || 0);
    } catch (error) {
      console.error("Error searching feedback:", error);
      message.error("Failed to fetch search results");
    } finally {
      setLoading(false);
    }
  };


  const fetchCourseDetails = async (page = 1) => {
    try {
      setLoading(true);
      const accessToken = getAccessToken();
  
      const response = await axios.get(`http://localhost:8000/api/course-feedback/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          page: page, // ✅ Ensure pagination works
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

  const handleEditClick = (record) => {
    setEditingFeedback(record);
    form.setFieldsValue({
      feedback_message: record.feedback_message,
    });
    setEditModalOpen(true);
  };

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
        setEditModalOpen(false);
        fetchCourseDetails(currentPage);
      }
    } catch (error) {
      console.error("Error updating feedback:", error);
      message.error("Failed to update feedback");
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
    fetchCourseDetails(1);
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
      title: "Course Name",
      dataIndex: "course_title",
      key: "course_title",
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
              placeholder="Search Feedback..."
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch();
              }}
            />
            <Tooltip placement="top" title="Reset Filter">
              <Button type="primary" className="iconlink" onClick={resetSearch}>
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
      <Modal
        title="Edit Feedback"
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        footer={null}
        centered
      >
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
      </Modal>
    </div>
  );
}
