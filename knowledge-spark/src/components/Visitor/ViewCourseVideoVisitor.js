import {
    EditOutlined,
    UploadOutlined,
    LockOutlined,
    MessageOutlined,
  } from "@ant-design/icons";
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
    List,
    Card,
  } from "antd";
  import axios from "axios";
  import React, { useEffect, useState } from "react";
  import { useLocation, useNavigate, useParams } from "react-router-dom";
  import "../../Styles/Main.css";
  import dayjs from "dayjs";
  
  const { Meta } = Card;
  const { Title, Paragraph, Text } = Typography;
  const { TextArea } = Input;
  
  const ViewCourseVideoVisitor = () => {
    const location = useLocation();
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
  
    const BASE_URL = "http://localhost:8000";
  
    useEffect(() => {
      const fetchCourseData = async () => {
        try {
          const response = await axios.get(`${BASE_URL}/api/course/${id}`);
          const courseData = response.data.data;
          setCourse(courseData);
          if (courseData?.videos?.length > 0) {
            setSelectedVideo(courseData.videos[0]);
          }
        } catch (error) {
          console.error("Error fetching course data:", error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchCourseData();
    }, [id]);
  
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };
  
    const handleVideoSelect = (video) => {
      setSelectedVideo(video);
    };
  
    if (loading) {
      return <div className="loader">Loading...</div>;
    }
  
    if (!course) {
      return <div className="loader">Course not found</div>;
    }
  
    return (
      <>
        <div className="course-container">
        <Button type="primary" onClick={()=>navigate('/')}>
                    Back
                </Button>
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
                            </div>
  
                            {/* Teacher Reply Section */}
                            {feedback.teacher_response && (
                              <div
                                style={{
                                  marginTop: 10,
                                  marginLeft: 62,
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
                        onClick={() => handleVideoSelect(video)}
                        style={{ position: "relative" }}
                      >
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <div className="lesson-number">{index + 1}</div>
                          <div className="lesson-info">
                            <div className="lesson-title">
                              {video.course_video_title}
                            </div>
                            <div className="lesson-date">
                              {formatDate(video.created_at)}
                            </div>
                          </div>
                          {index >= 2 && (
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
        </div>
      </>
    );
  };
  
  export default ViewCourseVideoVisitor;