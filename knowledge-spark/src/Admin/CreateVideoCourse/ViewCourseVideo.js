import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../Styles/Main.css";

const ViewCourseVideo = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [complaint, setComplaint] = useState("");
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });

  const BASE_URL = "http://localhost:8000";

  const getAccessToken = () => {
    const authData = JSON.parse(localStorage.getItem("auth_token"));
    if (!authData?.access_token) {
      throw new Error("Authentication tokens are missing. Please log in again.");
    }
    return authData.access_token;
  };

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    try {
      const accessToken = getAccessToken();
      await axios.post(
        `${BASE_URL}/api/course/${id}/feedback`,
        { feedback },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setSubmitStatus({ type: "success", message: "Feedback submitted successfully!" });
      setFeedback("");
    } catch (error) {
      setSubmitStatus({ type: "error", message: "Failed to submit feedback. Please try again." });
    }
  };

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    try {
      const accessToken = getAccessToken();
      await axios.post(
        `${BASE_URL}/api/course/${id}/complaint`,
        { complaint },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setSubmitStatus({ type: "success", message: "Complaint submitted successfully!" });
      setComplaint("");
    } catch (error) {
      setSubmitStatus({ type: "error", message: "Failed to submit complaint. Please try again." });
    }
  };

  if (loading) {
    return <div className="loader">Loading...</div>;
  }

  if (!course) {
    return <div className="loader">Course not found</div>;
  }

  return (
    <div className="course-container">
      <div className="course-wrapper">
        {/* Main Content */}
        <div className="main-content">
          {/* Video Player */}
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
              <h2 className="video-title">{selectedVideo?.course_video_title}</h2>
              <p className="video-description">{selectedVideo?.course_video_description}</p>
            </div>

            {/* Feedback and Complaint Section */}
            <div className="feedback-complaint-section">
              {submitStatus.message && (
                <div className={`status-message ${submitStatus.type === "success" ? "status-success" : "status-error"
                  }`}>
                  {submitStatus.message}
                </div>
              )}

              {/* Feedback Form */}
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
                  <div className={`char-count ${feedback.length > 400 ? "limit-near" : ""
                    } ${feedback.length === 500 ? "limit-reached" : ""}`}>
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
          </div>

          {/* Sidebar */}
          <div className="sidebar">
            <div className="sidebar-header">
              <h2 className="sidebar-title">Course Content</h2>
              <p className="video-count">{course.videos.length} video lessons</p>
            </div>
            <div className="video-list">
              {course.videos.map((video, index) => (
                <div
                  key={video.id}
                  className={`video-item ${selectedVideo?.id === video.id ? 'active' : ''}`}
                >
                  <button onClick={() => setSelectedVideo(video)}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div className="lesson-number">{index + 1}</div>
                      <div className="lesson-info">
                        <div className="lesson-title">{video.course_video_title}</div>
                        <div className="lesson-date">{formatDate(video.created_at)}</div>
                      </div>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCourseVideo;