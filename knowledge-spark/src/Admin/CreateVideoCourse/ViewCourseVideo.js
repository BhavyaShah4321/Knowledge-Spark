import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../Styles/Main.css";
import axios from "axios";

const ViewCourseVideo = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);

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

  if (loading) {
    return <div className="loader">Loading...</div>;
  }

  if (!course) {
    return <div className="loader">Course not found</div>;
  }

  return (
    <div className="course-container">
      <div className="course-wrapper">
        {/* Course Header */}
        <div className="course-header">
          <div className="course-header-content">
            <div>
              <h1 className="course-title">{course.course_title}</h1>
              <p className="course-description">{course.course_description}</p>
              <div className="course-meta">
                <span className="course-price">₹{course.course_price}</span>
                <span className={`course-status ${
                  course.course_status === 'active' ? 'status-active' : 'status-inactive'
                }`}>
                  {course.course_status.charAt(0).toUpperCase() + course.course_status.slice(1)}
                </span>
                <span className="course-date">
                  Last Updated: {formatDate(course.updated_at)}
                </span>
              </div>
            </div>
            <div className="instructor-info">
              <div>Instructor: {course.course_teacher_username}</div>
              <div>Contact: {course.course_teacher_email}</div>
            </div>
          </div>
        </div>

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