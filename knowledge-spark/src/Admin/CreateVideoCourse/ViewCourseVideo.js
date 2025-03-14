import { EditOutlined, UploadOutlined, LockOutlined } from "@ant-design/icons";
import {
  Form,
  Upload,
  Modal,
  Button,
  Tag,
  Spin,
  message,
  Input,
  Typography,
  Row,
  Col,
  Empty,
  Space,
  Divider,
  Avatar,
  Carousel,
  Progress,
  Tooltip,
} from "antd";
import axios from "axios";
import {
  SearchOutlined,
  BookOutlined,
  UserOutlined,
  DollarOutlined,
  FireOutlined,
  StarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  RightCircleOutlined,
  LeftCircleOutlined,
  FilterOutlined,
  SortAscendingOutlined,
} from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { List, Card } from "antd";
import "../../Styles/Main.css";
import dayjs from "dayjs";
const { Meta } = Card;
const { Title, Paragraph, Text } = Typography;
const { Search } = Input;

const ViewCourseVideo = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [courseVideoDrawerOpen, setCourseVideoDrawerOpen] = useState(false);
  const [editingCourseVideo, setEditingCourseVideo] = useState(null);
  const [courseVideoForm] = Form.useForm();
  const { TextArea } = Input;
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [hoveredCourse, setHoveredCourse] = useState(null);
  const [categories, setCategories] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });
  const [currentUser, setCurrentUser] = useState(null);
  const [isResponseModalVisible, setIsResponseModalVisible] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [responseForm] = Form.useForm();
  const navigate = useNavigate();
  // Add a new state to track enrollment status
  const [isEnrolled, setIsEnrolled] = useState(false);
  // Add a new state to track which videos have been watched
  const [watchedVideos, setWatchedVideos] = useState([]);
  // Add a state for enrollment modal
  const [enrollmentModalVisible, setEnrollmentModalVisible] = useState(false);

  const BASE_URL = "http://localhost:8000";

  const getAccessToken = () => {
    const authData = JSON.parse(localStorage.getItem("auth_token"));
    if (!authData?.access_token) {
      throw new Error(
        "Authentication tokens are missing. Please log in again."
      );
    }
    return authData.access_token;
  };

  useEffect(() => {
    const authData = JSON.parse(localStorage.getItem("auth_token"));
    if (authData?.user.type) {
      setCurrentUser(authData.user);
    }
  }, []);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const accessToken = getAccessToken();
        const response = await axios.get(`${BASE_URL}/api/course/${id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const courseData = response.data.data;
        setCourse(courseData);
        if (courseData?.videos?.length > 0) {
          setSelectedVideo(courseData.videos[0]);
        }

        // Check if user is enrolled in this course
        if (currentUser?.type === "Student") {
          const enrollmentResponse = await axios.get(
            `${BASE_URL}/api/enrollments/check/${id}/${currentUser.id}/`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          setIsEnrolled(enrollmentResponse.data.is_enrolled);

          // Get watched videos from local storage
          const storedWatched = localStorage.getItem(`watched_videos_${id}`);
          if (storedWatched) {
            setWatchedVideos(JSON.parse(storedWatched));
          }
        }
      } catch (error) {
        console.error("Error fetching course data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id, currentUser]);

  const fetchFeedBackData = async () => {
    try {
      const accessToken = getAccessToken();
      const response = await axios.get(
        `${BASE_URL}/api/course-feedback/${id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const FeddbackData = response.data.data;
      console.log("FeddbackData", FeddbackData);

      setFeedback(FeddbackData);
    } catch (error) {
      console.error("Error fetching course data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedBackData();
  }, [id]);

  // Function to mark a video as watched
  const markVideoAsWatched = (videoId) => {
    if (!watchedVideos.includes(videoId)) {
      const newWatchedVideos = [...watchedVideos, videoId];
      setWatchedVideos(newWatchedVideos);
      localStorage.setItem(
        `watched_videos_${id}`,
        JSON.stringify(newWatchedVideos)
      );
    }
  };

  // Function to check if a video can be watched
  const canWatchVideo = (videoIndex) => {
    // Teachers can watch any video
    if (currentUser?.type === "Teacher") return true;

    // Students who are enrolled can watch any video
    if (isEnrolled) return true;

    // Non-enrolled students can only watch first two videos
    return videoIndex < 2;
  };

  // Handle video selection with access control
  const handleVideoSelect = (video, index) => {
    if (canWatchVideo(index)) {
      setSelectedVideo(video);
      markVideoAsWatched(video.id);
    } else {
      setEnrollmentModalVisible(true);
    }
  };
  const initializeRazorpay = async () => {
    if (!selectedCourse) return;

    setPaymentProcessing(true);
    try {
      const authData = JSON.parse(localStorage.getItem("auth_token"));
      const accessToken = authData.access_token;

      // Step 1: Create a purchase order
      const orderResponse = await fetch(
        "http://127.0.0.1:8000/api/course-purchase/purchase-course/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            user: userId,
            course_id: selectedCourse.id,
            amount: selectedCourse.course_price,
          }),
        }
      );

      if (!orderResponse.ok) {
        throw new Error("Failed to create order");
      }

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        message.error(orderData.message || "Failed to initiate payment");
        return;
      }

      const { order_id, amount: orderAmount } = orderData.data;

      // Step 2: Open Razorpay payment window
      const options = {
        key: "rzp_test_KJQCW0zpmV0TnT", // Replace with your Razorpay key ID
        amount: orderAmount * 100, // Amount in paise
        currency: "INR",
        name: selectedCourse.course_title,
        description: `Purchase of ${selectedCourse.course_title}`,
        order_id: order_id,
        handler: async function (response) {
          // Step 3: Verify payment
          try {
            const verifyResponse = await fetch(
              "http://127.0.0.1:8000/api/course-purchase/verify-payment/",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              }
            );

            if (!verifyResponse.ok) {
              throw new Error("Failed to verify payment");
            }

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              message.success(
                "Payment successful! Your course is now accessible."
              );
              navigate(`/view-course/${selectedCourse.id}`);
            } else {
              message.error(
                verifyData.message || "Payment verification failed!"
              );
            }
          } catch (err) {
            console.error("Payment verification error:", err);
            message.error("Payment verification failed");
          }
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment initialization error:", err);
      message.error(err.message || "Payment initialization failed");
    } finally {
      setPaymentProcessing(false);
      setModalVisible(false);
    }
  };

  // Handle enrollment button click
  const handleEnrollNow = async () => {
    try {
      const accessToken = getAccessToken();
      await axios.post(
        `${BASE_URL}/api/enrollments/`,
        {
          student: currentUser.id,
          course: parseInt(id),
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setIsEnrolled(true);
      setEnrollmentModalVisible(false);
      message.success("Successfully enrolled in this course!");
    } catch (error) {
      console.error("Error enrolling in course:", error);
      message.error("Failed to enroll in course. Please try again.");
    }
  };

  const handleEditVideo = (video) => {
    setEditingCourseVideo({
      videoId: video.id,
      ...video,
    });
    courseVideoForm.setFieldsValue({
      course_video_title: video.course_video_title,
      course_video_description: video.course_video_description,
    });
    setModalVisible(true);
  };

  const handleCourseVideoSubmit = async (values) => {
    try {
      const accessToken = getAccessToken();
      const formData = new FormData();

      const form_data = {
        course_video_title: values.course_video_title,
        course_video_description: values.course_video_description,
        course: id,
      };

      // Handle video file
      if (values.course_video?.[0]?.originFileObj) {
        formData.append("course_video", values.course_video[0].originFileObj);
      } else if (editingCourseVideo && editingCourseVideo.course_video) {
        form_data.course_video = editingCourseVideo.course_video;
      }

      // Handle thumbnail
      if (values.course_video_thumbnail?.[0]?.originFileObj) {
        formData.append(
          "course_video_thumbnail",
          values.course_video_thumbnail[0].originFileObj
        );
      } else if (
        editingCourseVideo &&
        editingCourseVideo.course_video_thumbnail
      ) {
        form_data.course_video_thumbnail =
          editingCourseVideo.course_video_thumbnail;
      }

      formData.append("form_data", JSON.stringify(form_data));

      const endpoint = editingCourseVideo?.videoId
        ? `${BASE_URL}/api/course-video/${editingCourseVideo.videoId}/`
        : `${BASE_URL}/api/course-video/`;

      const method = editingCourseVideo?.videoId ? "patch" : "post";

      const response = await axios({
        method,
        url: endpoint,
        data: formData,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        message.success(
          `Video ${
            editingCourseVideo?.videoId ? "updated" : "added"
          } successfully`
        );
        setModalVisible(false);
        courseVideoForm.resetFields();
        // fetchCourseData();
      }
    } catch (error) {
      console.error("Error submitting course video:", error);
      message.error(
        error.response?.data?.message || "Failed to save video details"
      );
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleSubmitFeedback = async (values) => {
    const form_data = {
      feedback_student: currentUser.id,
      feedback_message: values.feedback, // Use the value from the form
      course: parseInt(id),
    };

    try {
      const accessToken = getAccessToken();
      await axios.post(`${BASE_URL}/api/course-feedback/`, form_data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setSubmitStatus({
        type: "success",
        message: "Feedback submitted successfully!",
      });

      fetchFeedBackData();

      setFeedback("");
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: "Failed to submit feedback. Please try again.",
      });
    }
  };

  if (loading) {
    return <div className="loader">Loading...</div>;
  }

  if (!course) {
    return <div className="loader">Course not found</div>;
  }

  const viewTeacherProfile = (teacherId) => {
    navigate(`/profile/${teacherId}`);
  };

  const handleAddResponse = async (values) => {
    try {
      const accessToken = getAccessToken();
      await axios.patch(
        `${BASE_URL}/api/course-feedback/${selectedFeedback.id}/`,
        { teacher_response: values.response },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      message.success("Response added successfully");
      fetchFeedBackData();
      setIsResponseModalVisible(false);
      responseForm.resetFields();
    } catch (error) {
      console.error("Error adding response:", error);
      message.error("Failed to add response");
    }
  };

  const showResponseModal = (feedback) => {
    setSelectedFeedback(feedback);
    setIsResponseModalVisible(true);

    responseForm.setFieldsValue({ response: feedback.teacher_response || "" });
    fetchFeedBackData();
  };

  return (
    <>
      <div className="course-container">
        <div className="course-wrapper">
          <div className="main-content">
            <div className="video-section">
              <div className="video-container">
                {selectedVideo ? (
                  <video
                    src={`${BASE_URL}${selectedVideo.course_video}`}
                    className="video-player"
                    controls
                    playsInline
                    onPlay={() => markVideoAsWatched(selectedVideo.id)}
                  />
                ) : (
                  <div className="video-player no-video">
                    No video available
                  </div>
                )}
              </div>
              <div className="video-info">
                <h3 className="video-title">
                  {selectedVideo?.course_video_title}
                </h3>
                <p className="video-description">
                  {selectedVideo?.course_video_description}
                </p>
                {currentUser?.type === "Student" && !isEnrolled && (
                  <div style={{ marginTop: "20px", marginBottom: "10px" }}>
                    <Tag color="warning">Free Preview: 2 videos only</Tag>
                    <Button
                      type="primary"
                      onClick={() => setEnrollmentModalVisible(true)}
                      style={{ marginLeft: "10px" }}
                    >
                      Enroll Now to Unlock All Videos
                    </Button>
                  </div>
                )}
              </div>
              <div className="feedback-complaint-section">
                {/* Feedback List with Scrollbar */}
                <Card title="Students Feedback" style={{ marginBottom: 24 }}>
                  <div
                    style={{
                      maxHeight: "300px",
                      overflowY: "auto",
                      paddingRight: "8px",
                    }}
                  >
                    <List
                      dataSource={course.feedbacks}
                      renderItem={(feedback) => (
                        <List.Item
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              width: "100%",
                            }}
                          >
                            {/* Student Avatar */}
                            <Avatar
                              src={
                                feedback.feedback_student_profile_picture
                                  ? `http://localhost:8000/media/${feedback.feedback_student_profile_picture}/`
                                  : "https://via.placeholder.com/50"
                              }
                              alt={feedback.feedback_student_username}
                              size={50}
                              style={{ marginRight: 12 }}
                            />
                            {/* Student Feedback */}
                            <div style={{ flex: 1 }}>
                              <strong>
                                {feedback.feedback_student_username}
                              </strong>
                              <p style={{ margin: 0 }}>
                                {feedback.feedback_message}
                              </p>
                              <small style={{ color: "rgba(0, 0, 0, 0.45)" }}>
                                {dayjs(feedback.created_at).format(
                                  "DD-MM-YYYY:hh:mm"
                                )}
                              </small>
                            </div>
                            {currentUser?.type === "Teacher" && (
                              <Button
                                type="primary"
                                onClick={() => showResponseModal(feedback)}
                              >
                                {feedback.teacher_response
                                  ? "Edit Response"
                                  : "Add Response"}
                              </Button>
                            )}
                          </div>

                          {/* Teacher Reply Section */}
                          {feedback.teacher_response && (
                            <div
                              style={{
                                marginTop: 10,
                                marginLeft: 62, // Indent to align under student feedback
                                padding: "8px 8px",
                                background: "#f6f6f6",
                                borderLeft: "4px solid #1890ff",
                                borderRadius: 4,
                              }}
                            >
                              <strong>Teacher's Reply:</strong>
                              <p style={{ margin: "4px 0 0" }}>
                                {feedback.teacher_response}
                              </p>
                            </div>
                          )}
                        </List.Item>
                      )}
                    />
                  </div>
                </Card>

                {/* Feedback Form */}
                {currentUser?.type === "Student" && (
                  <Card title="Submit Your Feedback">
                    {submitStatus.message && (
                      <div
                        style={{
                          marginBottom: 16,
                          color:
                            submitStatus.type === "success"
                              ? "#52c41a"
                              : "#ff4d4f",
                        }}
                      >
                        {submitStatus.message}
                      </div>
                    )}
                    <Form onFinish={handleSubmitFeedback}>
                      <Form.Item
                        name="feedback"
                        rules={[
                          {
                            required: true,
                            message: "Please enter your feedback",
                          },
                          {
                            max: 500,
                            message: "Feedback cannot exceed 500 characters",
                          },
                        ]}
                      >
                        <TextArea
                          rows={4}
                          placeholder="Share your thoughts about this course..."
                          maxLength={500}
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                        />
                      </Form.Item>
                      <div style={{ textAlign: "right", marginBottom: 16 }}>
                        {500 - feedback.length} characters remaining
                      </div>
                      <Form.Item>
                        <Button type="primary" htmlType="submit">
                          Submit Feedback
                        </Button>
                      </Form.Item>
                    </Form>
                  </Card>
                )}
                <Col>
                  {currentUser.type === "Student" && (
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      onClick={() => {
                        if (course && course.course_teacher) {
                          viewTeacherProfile(course.course_teacher);
                        } else {
                          message.error(
                            "Teacher information is not available."
                          );
                        }
                      }}
                    >
                      View Profile
                    </Button>
                  )}
                </Col>
              </div>
            </div>

            <div className="sidebar">
              <div className="sidebar-header">
                <h2 className="sidebar-title">Course Content</h2>
                <p className="video-count">
                  {course.videos.length} video lessons
                </p>
              </div>
              <div className="video-list">
                {course.videos.map((video, index) => (
                  <div
                    key={video.id}
                    className={`video-item ${
                      selectedVideo?.id === video.id ? "active" : ""
                    }`}
                  >
                    <button
                      onClick={() => handleVideoSelect(video, index)}
                      style={{ position: "relative" }}
                      disabled={
                        !canWatchVideo(index) && currentUser?.type === "Student"
                      }
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <div className="lesson-number">{index + 1}</div>
                        <div className="lesson-info">
                          <div className="lesson-title">
                            {video.course_video_title}
                            {watchedVideos.includes(video.id) && (
                              <Tag
                                color="success"
                                style={{ marginLeft: "8px" }}
                              >
                                Watched
                              </Tag>
                            )}
                          </div>
                          <div className="lesson-date">
                            {formatDate(video.created_at)}
                          </div>
                        </div>
                        {currentUser?.type === "Student" &&
                          !isEnrolled &&
                          index >= 2 && (
                            <LockOutlined
                              style={{ marginLeft: "8px", color: "#ff4d4f" }}
                            />
                          )}
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div
          style={{ display: "flex", justifyContent: "end", marginTop: "20px" }}
        >
          {currentUser?.type === "Teacher" && (
            <Col>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => handleEditVideo(selectedVideo)}
                disabled={!selectedVideo}
              >
                Edit Course Video
              </Button>
            </Col>
          )}
        </div>
      </div>

      {/* Enrollment Modal */}
      <Modal
        title="Enroll in this Course"
        open={enrollmentModalVisible}
        onCancel={() => setEnrollmentModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setEnrollmentModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="enroll"
            type="primary"
            onClick={() => {
              setSelectedCourse(course);
              setModalVisible(true);
            }}
          >
            Enroll Now
          </Button>,
        ]}
      >
        <p>
          You have reached the limit of free preview videos for this course.
        </p>
        <p>
          Enroll now to get access to all {course?.videos?.length} videos and
          complete the course!
        </p>
      </Modal>

      <Modal
        title={`${editingCourseVideo?.videoId ? "Edit" : "Add"} Course Video`}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          courseVideoForm.resetFields();
        }}
        // footer={null}
        width={600}
        centered
      >
        <Form
          layout="vertical"
          form={courseVideoForm}
          onFinish={handleCourseVideoSubmit}
          className="p-4"
        >
          <Form.Item
            name="course_video_title"
            label="Video Title"
            rules={[
              { required: true, message: "Please enter video title" },
              {
                pattern: /^[a-zA-Z\s]+$/,
                message: "Video title can only include letters and spaces",
              },
            ]}
          >
            <Input placeholder="Enter video title" />
          </Form.Item>

          <Form.Item
            name="course_video_description"
            label="Video Description"
            rules={[
              { required: true, message: "Please enter video description" },
            ]}
          >
            <Input.TextArea placeholder="Enter video description" rows={4} />
          </Form.Item>

          <Form.Item
            name="course_video_thumbnail"
            label="Video Thumbnail"
            rules={[
              {
                required: !editingCourseVideo?.videoId,
                message: "Please upload video thumbnail",
              },
            ]}
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) return e;
              return e?.fileList;
            }}
          >
            <Upload
              name="course_video_thumbnail"
              listType="picture"
              beforeUpload={() => false}
              accept="image/*"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Upload Thumbnail</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="course_video"
            label="Video File"
            rules={[
              {
                required: !editingCourseVideo?.videoId,
                message: "Please upload video file",
              },
            ]}
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) return e;
              return e?.fileList;
            }}
          >
            <Upload
              name="course_video"
              listType="text"
              beforeUpload={() => false}
              accept="video/*"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Upload Video</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            className="text-right mb-0 "
            style={{ display: "flex", justifyContent: "flex-end" }}
          >
            <Button
              className="mr-2 "
              type="primary"
              onClick={() => setModalVisible(false)}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              style={{ marginLeft: "10px" }}
            >
              {editingCourseVideo?.videoId ? "Edit" : "Add"} Video
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Teacher Response"
        open={isResponseModalVisible}
        onCancel={() => {
          setIsResponseModalVisible(false);
          responseForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={responseForm}
          onFinish={handleAddResponse}
          layout="vertical"
        >
          <Form.Item
            name="response"
            label="Response"
            rules={[{ required: true, message: "Please enter your response" }]}
          >
            <TextArea
              rows={4}
              placeholder="Enter your response to the feedback"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit Response
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={null}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
        style={{ borderRadius: "16px", overflow: "hidden" }}
        bodyStyle={{ padding: 0 }}
        centered
      >
        {selectedCourse && (
          <div>
            <div style={{ position: "relative" }}>
              <img
                src={
                  selectedCourse.course_thumbnail
                    ? `http://localhost:8000${selectedCourse.course_thumbnail}`
                    : selectedCourse.videos && selectedCourse.videos.length > 0
                    ? `http://localhost:8000${selectedCourse.videos[0].course_video_thumbnail}`
                    : "/api/placeholder/400/320"
                }
                alt={selectedCourse.course_title}
                style={{ width: "100%", height: 300, objectFit: "cover" }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "40px 24px 24px",
                  background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
                  color: "white",
                }}
              >
                {selectedCourse.trending && (
                  <Tag color="red" style={{ marginBottom: "8px" }}>
                    <FireOutlined /> Trending
                  </Tag>
                )}
                <Title
                  level={3}
                  style={{ color: "white", margin: "0 0 8px 0" }}
                >
                  {selectedCourse.course_title}
                </Title>
              </div>
            </div>

            <div style={{ padding: "24px" }}>
              <Row gutter={[24, 24]}>
                <Col xs={24} md={16}>
                  <Space
                    direction="vertical"
                    size={24}
                    style={{ width: "100%" }}
                  >
                    <Space size="middle">
                      <Avatar
                        src="/api/placeholder/40/40"
                        icon={<UserOutlined />}
                        size={48}
                      />
                      <div>
                        <Text
                          strong
                          style={{ display: "block", fontSize: "16px" }}
                        >
                          {selectedCourse.course_teacher_username}
                        </Text>
                        <Text type="secondary">Course Instructor</Text>
                      </div>
                    </Space>

                    <div>
                      <Title level={4} style={{ marginBottom: "16px" }}>
                        About This Course
                      </Title>
                      <Paragraph>{selectedCourse.course_description}</Paragraph>
                    </div>

                    {selectedCourse.course_outcomes && (
                      <div>
                        <Title level={4} style={{ marginBottom: "16px" }}>
                          What You'll Learn
                        </Title>
                        <Row gutter={[16, 16]}>
                          {selectedCourse.course_outcomes
                            .split("\n")
                            .map((outcome, index) => (
                              <Col xs={24} md={12} key={index}>
                                <Card
                                  size="small"
                                  style={{
                                    borderRadius: "8px",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                  }}
                                >
                                  <Space align="start">
                                    <div
                                      style={{
                                        color: "#1890ff",
                                        backgroundColor: "rgba(24,144,255,0.1)",
                                        borderRadius: "50%",
                                        width: "24px",
                                        height: "24px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginRight: "8px",
                                      }}
                                    >
                                      {index + 1}
                                    </div>
                                    <Text>{outcome}</Text>
                                  </Space>
                                </Card>
                              </Col>
                            ))}
                        </Row>
                      </div>
                    )}

                    {/* <div>
                      <Title level={4} style={{ marginBottom: '16px' }}>
                        Course Info
                      </Title>
                      <Row gutter={[16, 16]}>
                        <Col xs={12} sm={8}>
                          <Card
                            size="small"
                            style={{
                              textAlign: 'center',
                              borderRadius: '8px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            }}
                          >
                            <Space direction="vertical" size={0}>
                              <ClockCircleOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                              <Text type="secondary">Duration</Text>
                              <Text strong>{selectedCourse.duration}</Text>
                            </Space>
                          </Card>
                        </Col>
                        <Col xs={12} sm={8}>
                          <Card
                            size="small"
                            style={{
                              textAlign: 'center',
                              borderRadius: '8px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            }}
                          >
                            <Space direction="vertical" size={0}>
                              <TeamOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                              <Text type="secondary">Students</Text>
                              <Text strong>{selectedCourse.students_enrolled}</Text>
                            </Space>
                          </Card>
                        </Col>
                        <Col xs={12} sm={8}>
                          <Card
                            size="small"
                            style={{
                              textAlign: 'center',
                              borderRadius: '8px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            }}
                          >
                            <Space direction="vertical" size={0}>
                              <StarOutlined style={{ fontSize: '24px', color: '#fadb14' }} />
                              <Text type="secondary">Rating</Text>
                              <Text strong>{selectedCourse.rating}/5.0</Text>
                            </Space>
                          </Card>
                        </Col>
                      </Row>
                    </div> */}
                  </Space>
                </Col>

                <Col xs={24} md={8}>
                  <div
                    style={{
                      position: "sticky",
                      top: "24px",
                      backgroundColor: "#f8f9fa",
                      borderRadius: "12px",
                      padding: "24px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  >
                    <Title
                      level={2}
                      style={{ margin: "0 0 24px 0", textAlign: "center" }}
                    >
                      {selectedCourse.course_price ? (
                        <>
                          <span style={{ fontSize: "16px" }}>₹</span>
                          {selectedCourse.course_price}
                        </>
                      ) : (
                        "Free Access"
                      )}
                    </Title>

                    <Space
                      direction="vertical"
                      size={16}
                      style={{ width: "100%" }}
                    >
                      <Button
                        type="primary"
                        size="large"
                        block
                        loading={paymentProcessing}
                        onClick={initializeRazorpay}
                        style={{
                          height: "48px",
                          fontSize: "16px",
                          background:
                            "linear-gradient(90deg, #1890ff, #36cfc9)",
                          border: "none",
                          borderRadius: "8px",
                          boxShadow: "0 4px 12px rgba(24,144,255,0.25)",
                        }}
                      >
                        {paymentProcessing
                          ? "Processing..."
                          : selectedCourse.course_price
                          ? "Enroll Now"
                          : "Start Learning Now"}
                      </Button>

                      <Button
                        type="default"
                        size="large"
                        block
                        onClick={() => setModalVisible(false)}
                        style={{
                          height: "48px",
                          borderRadius: "8px",
                        }}
                      >
                        Cancel
                      </Button>
                    </Space>

                    <Divider />

                    {/* <Space direction="vertical" size={12} style={{ width: '100%' }}>
                      <div>
                        <Text strong>This course includes:</Text>
                      </div>
                      <Space align="center">
                        <ClockCircleOutlined style={{ color: '#1890ff' }} />
                        <Text>{selectedCourse.duration} of video content</Text>
                      </Space>
                      <Space align="center">
                        <BookOutlined style={{ color: '#1890ff' }} />
                        <Text>Downloadable resources</Text>
                      </Space>
                      <Space align="center">
                        <TeamOutlined style={{ color: '#1890ff' }} />
                        <Text>Community access</Text>
                      </Space>
                      <Space align="center">
                        <DollarOutlined style={{ color: '#1890ff' }} />
                        <Text>Lifetime access</Text>
                      </Space>
                    </Space> */}
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default ViewCourseVideo;
