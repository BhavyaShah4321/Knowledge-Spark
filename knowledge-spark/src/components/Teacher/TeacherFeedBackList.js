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
    Form,
    Modal,
  } from "antd";
  import axios from "axios";
  import React, { useEffect, useState } from "react";
  import { Link, useNavigate } from "react-router-dom";
  import { ReactComponent as FilterIcon } from "../../Image/FilterIcon.svg";
import TextArea from "antd/es/input/TextArea";
  
  export default function TeacherFeedBackList() {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
     const [isResponseModalVisible, setIsResponseModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
   const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingFeedback, setEditingFeedback] = useState(null);
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [feedbackData,setFeedbackData]=useState();
    const [teacherId, setTeacherId] = useState(null);
    //   const [selectedfee, setSelectedComplaint] = useState(null);

  
    const getAccessToken = () => {
      const authData = JSON.parse(localStorage.getItem("auth_token"));
      if (!authData?.access_token) {
        throw new Error("Authentication tokens are missing. Please log in again.");
      }
      return authData.access_token;
    };

    useEffect(() => {
        const authData = JSON.parse(localStorage.getItem("auth_token")); 
        if (authData?.user?.id) {
          setTeacherId(authData.user.id);
        }
      }, []); 
      
     
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
  
        const FeedBackDetails = response.data.data;
        console.log("FeedBackDetails",FeedBackDetails);
        
        setFeedbackData(FeedBackDetails || []);
        // setTotalItems(FeedBackDetails.count || 0);
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
        //   fetchCourseDetails(currentPage);
        }
      } catch (error) {
        console.error("Error updating feedback:", error);
        message.error("Failed to update feedback");
      } finally {
        setLoading(false);
      }
    };

    const showResponseModal = (feedback) => {
        setSelectedFeedback(feedback);
        setIsResponseModalVisible(true);
        form.setFieldsValue({ response: feedback.teacher_response || '' });
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
                {/* {response && <Text>{response}</Text>} */}
                <Button 
                  type="primary" 
                  onClick={() => showResponseModal(record)}
                >
                  {response ? "Edit Response" : "Add Response"}
                </Button>
              </Space>
            ),
          },
    ];

    const handleAddResponse = async (values) => {
        try {
          const accessToken = getAccessToken();
          await axios.patch(
            `http://localhost:8000/api/course-feedback/${selectedFeedback.id}/`,
            { teacher_response: values.response ,
                
            },
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );
          message.success("Response added successfully");
          setIsResponseModalVisible(false);
          form.resetFields();
          fetchFeedBackDetails(currentPage);
        } catch (error) {
          console.error("Error adding response:", error);
          message.error("Failed to add response");
        }
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
              <Breadcrumb items={[{ title: <Link to="/dashboard">Home</Link> }, { title: "Feedback" }]} />
            </div>
          </Col>
        </Row>
        <Table
          dataSource={Array.isArray(feedbackData) ? feedbackData : []}
          columns={columns}
          rowKey="id"
          pagination={{
            current: currentPage,
            total: totalItems,
            pageSize: 15,
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
        <Modal
                title="Teacher Response"
                open={isResponseModalVisible}
                onCancel={() => {
                  setIsResponseModalVisible(false);
                  form.resetFields();
                }}
                footer={null}
              >
                <Form
                  form={form}
                  onFinish={handleAddResponse}
                  layout="vertical"
                >
                  <Form.Item
                    name="response"
                    label="Response"
                    rules={[{ required: true, message: 'Please enter your response' }]}
                  >
                    <TextArea rows={4} placeholder="Enter your response to the complaint" />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      Submit Response
                    </Button>
                  </Form.Item>
                </Form>
              </Modal>
      </div>
    );
  }
  