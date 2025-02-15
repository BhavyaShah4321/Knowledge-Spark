import { EditOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, message, Modal, Upload } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../Styles/Main.css";

const ViewCourseVideo = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });
  const [currentUser, setCurrentUser] = useState(null);
  const [courseVideoDrawerOpen, setCourseVideoDrawerOpen] = useState(false);
  const [editingCourseVideo, setEditingCourseVideo] = useState(null);
  const [courseVideoForm] = Form.useForm();
  const navigate = useNavigate();

  const BASE_URL = "http://localhost:8000";

  const getAccessToken = () => {
    const authData = JSON.parse(localStorage.getItem("auth_token"));
    if (!authData?.access_token) {
      throw new Error("Authentication tokens are missing. Please log in again.");
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
      } catch (error) {
        console.error("Error fetching course data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id]);

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
        course: id
      };

      // Handle video file
      if (values.course_video?.[0]?.originFileObj) {
        formData.append("course_video", values.course_video[0].originFileObj);
      } else if (editingCourseVideo && editingCourseVideo.course_video) {
        form_data.course_video = editingCourseVideo.course_video;
      }

      // Handle thumbnail
      if (values.course_video_thumbnail?.[0]?.originFileObj) {
        formData.append("course_video_thumbnail", values.course_video_thumbnail[0].originFileObj);
      } else if (editingCourseVideo && editingCourseVideo.course_video_thumbnail) {
        form_data.course_video_thumbnail = editingCourseVideo.course_video_thumbnail;
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
        message.success(`Video ${editingCourseVideo?.videoId ? "updated" : "added"} successfully`);
        setModalVisible(false);
        courseVideoForm.resetFields();
        // fetchCourseData();
      }
    } catch (error) {
      console.error("Error submitting course video:", error);
      message.error(error.response?.data?.message || "Failed to save video details");
    }
  };

  // const viewTeacherProfile = (id) => {
  //   navigate(`/profile/${id}`);
  //   console.log("Teacher",id)
  // };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    const form_data = {
      feedback_student: currentUser.id,
      feedback_message: feedback,
      course: parseInt(id),
    };

    try {
      const accessToken = getAccessToken();
      await axios.post(
        `${BASE_URL}/api/course-feedback/`,
        form_data,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setSubmitStatus({
        type: "success",
        message: "Feedback submitted successfully!",
      });
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
                  />
                ) : (
                  <div className="video-player no-video">No video available</div>
                )}
              </div>
              <div className="video-info">
                <h3 className="video-title">{selectedVideo?.course_video_title}</h3>
                <p className="video-description">{selectedVideo?.course_video_description}</p>
              </div>

              {currentUser?.type === "Student" && (
                <>
                  <div className="feedback-complaint-section">
                    {submitStatus.message && (
                      <div className={`status-message ${submitStatus.type === "success" ? "status-success" : "status-error"}`}>
                        {submitStatus.message}
                      </div>
                    )}
                    <div className="form-container feedback-form">
                      <h3 className="form-title">Course Feedback</h3>
                      <form onSubmit={handleSubmitFeedback}>
                        <textarea
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          className="form-textarea"
                          placeholder="Share your thoughts about this course..."
                          maxLength={500}
                          required
                        />
                        <div className={`char-count ${feedback.length > 400 ? "limit-near" : ""} ${feedback.length === 500 ? "limit-reached" : ""}`}>
                          {500 - feedback.length} characters remaining
                        </div>
                        <button
                          type="submit"
                          className="feedback-submit-btn"
                          disabled={!feedback.trim()}
                        >
                          Submit Feedback
                        </button>
                      </form>
                    </div>
                  </div>
                  <Button
                    type="primary"
                 
                    onClick={() => viewTeacherProfile(course.course_teacher)}
                  >
                    View Teacher Profile
                  </Button>

                </>
              )}
            </div>

            <div className="sidebar">
              <div className="sidebar-header">
                <h2 className="sidebar-title">Course Content</h2>
                <p className="video-count">{course.videos.length} video lessons</p>
              </div>
              <div className="video-list">
                {course.videos.map((video, index) => (
                  <div
                    key={video.id}
                    className={`video-item ${selectedVideo?.id === video.id ? "active" : ""}`}
                  >
                    <button onClick={() => setSelectedVideo(video)}>
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
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
        <div style={{ display: 'flex', justifyContent: 'end', marginTop: '20px' }}>
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


      <Modal
        title={`${editingCourseVideo?.videoId ? "Edit" : "Add"} Course Video`}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          courseVideoForm.resetFields();
        }}
        footer={null}
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
            <Input.TextArea
              placeholder="Enter video description"
              rows={4}
            />
          </Form.Item>

          <Form.Item
            name="course_video_thumbnail"
            label="Video Thumbnail"
            rules={[
              { required: !editingCourseVideo?.videoId, message: "Please upload video thumbnail" }
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
              { required: !editingCourseVideo?.videoId, message: "Please upload video file" }
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
              <Button icon={<UploadOutlined />}  >Upload Video</Button>
            </Upload>
          </Form.Item>

          <Form.Item className="text-right mb-0 " style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button className="mr-2 " type="primary" onClick={() => setModalVisible(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" style={{ marginLeft: '10px' }}>
              {editingCourseVideo?.videoId ? "Edit" : "Add"} Video
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ViewCourseVideo;