import React, { useEffect, useState } from "react";
import { 
  SearchOutlined, 
  FilterOutlined, 
  ArrowLeftOutlined,
  MessageOutlined,
  CommentOutlined,
  BookOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined
} from "@ant-design/icons";
import {
  Input,
  Row,
  Col,
  Card,
  Button,
  Empty,
  Spin,
  message,
  Typography,
  Space,
  Divider,
  Avatar,
  Pagination,
  Tag,
  Modal,
  Form,
  Select,
  Tooltip
} from "antd";
import axios from "axios";
import { Link } from "react-router-dom";
import TextArea from "antd/es/input/TextArea";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function StudentFeedback() {
  const [searchText, setSearchText] = useState("");
  const [filterCourse, setFilterCourse] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [feedbackData, setFeedbackData] = useState([]);
  const [userId, setUserId] = useState(null);
  const [originalData, setOriginalData] = useState([]);
  const [form] = Form.useForm();
  const [editingFeedbackId, setEditingFeedbackId] = useState(null);
  const [editingMessage, setEditingMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const authData = JSON.parse(localStorage.getItem("auth_token"));
    if (authData?.user?.id) {
      setUserId(authData.user.id);
    }
  }, []);

  const getAccessToken = () => {
    const authData = JSON.parse(localStorage.getItem("auth_token"));
    if (!authData?.access_token) {
      throw new Error("Authentication tokens are missing. Please log in again.");
    }
    return authData.access_token;
  };

  const fetchFeedBackDetails = async (page = 1) => {
    try {
      setLoading(true);
      const accessToken = getAccessToken();
      const response = await axios.post(
        `http://localhost:8000/api/course-feedback/get-course-feedback-according-student/`,
        { student_id: userId },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const FeedBackDetails = response.data.results || [];
      setFeedbackData(FeedBackDetails);
      setOriginalData(FeedBackDetails);
      setTotalItems(FeedBackDetails.length);
    } catch (error) {
      console.error("Error fetching course details:", error);
      message.error("Failed to fetch feedback details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchFeedBackDetails(currentPage);
    }
  }, [userId, currentPage]);

  const handleSearch = (value) => {
    setSearchText(value);
    if (!value) {
      setFeedbackData(originalData);
      return;
    }

    const filteredData = originalData.filter((item) =>
      item.feedback_student_username?.toLowerCase().includes(value.toLowerCase()) ||
      item.course_title?.toLowerCase().includes(value.toLowerCase()) ||
      item.feedback_message?.toLowerCase().includes(value.toLowerCase())
    );

    setFeedbackData(filteredData);
  };

  const handleReset = () => {
    setSearchText("");
    setFilterCourse(null);
    setFeedbackData(originalData);
  };

  const getPageItems = () => {
    const startIndex = (currentPage - 1) * 5;
    const endIndex = startIndex + 5;
    return feedbackData.slice(startIndex, endIndex);
  };

  const startEditingFeedback = (feedback) => {
    setEditingFeedbackId(feedback.id);
    setEditingMessage(feedback.feedback_message);
  };

  const cancelEditingFeedback = () => {
    setEditingFeedbackId(null);
    setEditingMessage("");
  };

  const updateFeedback = async (feedbackId) => {
    if (!editingMessage.trim()) {
      message.error("Feedback message cannot be empty");
      return;
    }
    
    try {
      setSubmitting(true);
      const accessToken = getAccessToken();
      
      // This is the API call to update the feedback
      // Ensure the endpoint and payload match your backend API
      await axios.put(
        `http://localhost:8000/api/course-feedback/update/${feedbackId}/`,
        { 
          feedback_message: editingMessage,
          student_id: userId
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
        }
      );

      // Update local state after successful API call
      const updatedData = feedbackData.map(item => 
        item.id === feedbackId ? { ...item, feedback_message: editingMessage } : item
      );
      
      setFeedbackData(updatedData);
      setOriginalData(updatedData);
      
      cancelEditingFeedback();
      message.success("Feedback updated successfully");
    } catch (error) {
      console.error("Error updating feedback:", error);
      message.error(error.response?.data?.message || "Failed to update feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const responseStatusTag = (response) => {
    if (response) {
      return <Tag color="green">Responded</Tag>;
    }
    return <Tag color="orange">Awaiting Response</Tag>;
  };

  const formatDateIfAvailable = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return "";
    }
  };

  return (
    <div className="feedback-page" style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
      <Row className="header-container" align="middle" justify="space-between" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ marginBottom: 4,}}>My Feedback</Title>
          <Link to="/dashboard" className="back-link" style={{ color: "#1890ff", display: "flex", alignItems: "center", fontSize: "14px" }}>
            <ArrowLeftOutlined style={{ marginRight: 8 }} /> Back to Dashboard
          </Link>
        </Col>
        <Col>
          <Space size="middle">
            <Input
              placeholder="Search by course or feedback..."
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              prefix={<SearchOutlined style={{ color: "#1890ff" }} />}
              style={{ width: 300, borderRadius: "8px" }}
              allowClear
            />
            <Button 
              type="primary" 
              icon={<FilterOutlined />} 
              onClick={handleReset} 
              disabled={!searchText.trim() && !filterCourse}
              style={{ borderRadius: "8px" }}
            >
              Reset
            </Button>
          </Space>
        </Col>
      </Row>

      {loading ? (
        <div className="loading-container" style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
          <Text style={{ display: 'block', marginTop: 16 }}>Loading your feedback...</Text>
        </div>
      ) : feedbackData.length === 0 ? (
        <Empty 
          description={
            <div>
              <Text strong style={{ fontSize: "16px" }}>No feedback available yet</Text>
              <div style={{ marginTop: "8px" }}>
                <Text type="secondary">Your submitted feedback will appear here</Text>
              </div>
            </div>
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
          style={{ margin: '100px 0', background: "#f5f5f5", padding: "40px", borderRadius: "12px" }}
        />
      ) : (
        <>
          <div className="feedback-cards">
            {getPageItems().map((feedback, index) => (
              <Card 
                key={feedback.id || index} 
                className="feedback-card"
                style={{ 
                  marginBottom: 16, 
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                }}
                hoverable
              >
                <Row gutter={16} align="top">
                  <Col xs={24} md={6}>
                    <div className="course-info" style={{ display: "flex", alignItems: "flex-start" }}>
                      <Avatar 
                        size={40} 
                        style={{ 
                          backgroundColor: "#1890ff", 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center" 
                        }}
                      >
                        <BookOutlined style={{ fontSize: 20 }} />
                      </Avatar>
                      <div style={{ marginLeft: 12 }}>
                        <Text strong style={{ fontSize: 16, display: "block" }}>{feedback.course_title}</Text>
                        <div style={{ marginTop: 8 }}>
                          {responseStatusTag(feedback.teacher_response)}
                        </div>
                        <Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 8 }}>
                          {formatDateIfAvailable(feedback.created_at)}
                        </Text>
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} md={18}>
                    <div className="feedback-content">
                      <div className="feedback-message" style={{ position: "relative" }}>
                        <Title 
                          level={5} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            marginBottom: 12,
                            color: "#1890ff"
                          }}
                        >
                          <MessageOutlined style={{ marginRight: 8 }} /> Your Feedback
                          
                          {!feedback.teacher_response && editingFeedbackId !== feedback.id && (
                            <Tooltip title="Edit feedback">
                              <Button 
                                type="text" 
                                icon={<EditOutlined />} 
                                size="small"
                                onClick={() => startEditingFeedback(feedback)}
                                style={{ marginLeft: 'auto' }}
                              />
                            </Tooltip>
                          )}
                        </Title>
                        
                        {editingFeedbackId === feedback.id ? (
                          <div style={{ marginBottom: 16 }}>
                            <TextArea
                              value={editingMessage}
                              onChange={(e) => setEditingMessage(e.target.value)}
                              autoSize={{ minRows: 3, maxRows: 6 }}
                              style={{ borderRadius: "8px", marginBottom: 12 }}
                            />
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                              <Button 
                                icon={<CloseOutlined />} 
                                onClick={cancelEditingFeedback}
                                disabled={submitting}
                              >
                                Cancel
                              </Button>
                              <Button 
                                type="primary" 
                                icon={<CheckOutlined />} 
                                onClick={() => updateFeedback(feedback.id)}
                                loading={submitting}
                              >
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ 
                            background: "#f5f5f5", 
                            padding: "16px", 
                            borderRadius: "8px",
                            marginBottom: 16
                          }}>
                            <Paragraph style={{ margin: 0 }}>
                              {feedback.feedback_message}
                            </Paragraph>
                          </div>
                        )}
                      </div>
                      
                      {feedback.teacher_response && (
                        <div className="teacher-response">
                          <Divider style={{ margin: '16px 0' }} />
                          <Title 
                            level={5} 
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              color: "#52c41a",
                              marginBottom: 12
                            }}
                          >
                            <CommentOutlined style={{ marginRight: 8 }} /> Teacher's Response
                          </Title>
                          <div style={{ 
                            background: "#f6ffed", 
                            padding: "16px", 
                            borderRadius: "8px",
                            border: "1px solid #b7eb8f"
                          }}>
                            <Paragraph style={{ margin: 0 }}>
                              {feedback.teacher_response}
                            </Paragraph>
                          </div>
                        </div>
                      )}
                    </div>
                  </Col>
                </Row>
              </Card>
            ))}
          </div>
          
          <Row justify="end" style={{ marginTop: 24 }}>
            <Pagination
              current={currentPage}
              total={feedbackData.length}
              pageSize={5}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false}
              style={{ 
                padding: "8px 16px", 
                background: "#fff", 
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
              }}
            />
          </Row>
        </>
      )}
    </div>
  );
}