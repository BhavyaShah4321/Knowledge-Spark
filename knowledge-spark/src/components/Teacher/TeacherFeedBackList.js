import {
  SearchOutlined,
} from "@ant-design/icons";
import {
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
  Select,
} from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ReactComponent as FilterIcon } from "../../Image/FilterIcon.svg";
import TextArea from "antd/es/input/TextArea";

const { Option } = Select;

export default function TeacherFeedBackList() {
  const [searchText, setSearchText] = useState("");
  const [filterCourse, setFilterCourse] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [feedbackData, setFeedbackData] = useState([]);
  const [teacherId, setTeacherId] = useState(null);
  const [originalData, setOriginalData] = useState([]); // Store original data

  const [form] = Form.useForm();

  const [isResponseModalVisible, setIsResponseModalVisible] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  const showResponseModal = (feedback) => {
    setSelectedFeedback(feedback);
    setIsResponseModalVisible(true);
    form.setFieldsValue({ response: feedback.teacher_response || "" });
  };


  useEffect(() => {
    const authData = JSON.parse(localStorage.getItem("auth_token"));
    if (authData?.user?.id) {
      setTeacherId(authData.user.id);
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
        `http://localhost:8000/api/course-feedback/get-course-feedback-according-course-teacher/`,
        { teacher_id: teacherId },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const FeedBackDetails = response.data.results || [];
      setFeedbackData(FeedBackDetails);
      setOriginalData(FeedBackDetails); // Store original data for filtering
    } catch (error) {
      console.error("Error fetching course details:", error);
      message.error("Failed to fetch course details");
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    if (teacherId) {
      fetchFeedBackDetails(currentPage);
    }
  }, [teacherId, currentPage]);

  /** Handle Search */
  const handleSearch = (value) => {
    setSearchText(value);
    if (!value) {
      setFeedbackData(originalData);
      return;
    }

    const filteredData = originalData.filter((item) =>
      item.feedback_student_username.toLowerCase().includes(value.toLowerCase()) ||
      item.course_title.toLowerCase().includes(value.toLowerCase()) ||
      item.feedback_message.toLowerCase().includes(value.toLowerCase())
    );

    setFeedbackData(filteredData);
  };

  /** Handle Reset */
  const handleReset = () => {
    setSearchText("");
    setFilterCourse(null);
    setFeedbackData(originalData);
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
      title: "Teacher Response",
      dataIndex: "teacher_response",
      key: "teacher_response",
      render: (response, record) => (
        <Space direction="vertical">
          <Button type="primary" onClick={() => showResponseModal(record)}>
            {response ? "Edit Response" : "Add Response"}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row className="pagenamerow mb-0" justify="space-between" align="middle">
        <Col>
          <h2>Feedback</h2>
          <div className="bredcrumbwrp">
            <Link to="/dashboard" className="back">BACK</Link>
          </div>
        </Col>
        <Col>
          <Space size="small">
            <Input
              placeholder="Search feedback..."
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              prefix={<SearchOutlined />}
            />
            <Tooltip placement="top" title="Reset Filter">
              <Button type="primary" className="iconlink" onClick={handleReset} disabled={!searchText.trim() && !filterCourse}>
                <FilterIcon />
              </Button>
            </Tooltip>
          </Space>
        </Col>
      </Row>

      <Table
        dataSource={Array.isArray(feedbackData) ? feedbackData : []}
        columns={columns}
        rowKey="id"
        pagination={{
          current: currentPage,
          pageSize: 15,
          showSizeChanger: false,
        }}
        loading={loading}
        scroll={{ x: 1500 }}
      />
    </div>
  );
}
