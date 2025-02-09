import axios from "axios";
import React, { useEffect, useState } from "react";

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const authData = JSON.parse(localStorage.getItem("auth_token"));
        if (!authData || !authData.access_token) {
          console.error("Authentication tokens are missing. Please log in again.");
          return;
        }
        const accessToken = authData.access_token;

        const response = await axios.get("http://localhost:8000/api/course/", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setCourses(response.data.results.data);
      } catch (error) {
        setError("Failed to fetch courses.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading)
    return <p className="text-center text-gray-500">Loading courses...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="container">
      <h1 className="text-center">Available Courses</h1>
      <div className="course-grid">
        {courses.map((course) => (
          <div key={course.id} className="course-card">
            <div className="course-image">
              <img
                src={
                  course.course_thumbnail
                    ? `http://localhost:8000${course.course_thumbnail}`
                    : course.videos && course.videos.length > 0
                      ? `http://localhost:8000${course.videos[0].course_video_thumbnail}`
                      : "https://via.placeholder.com/300x200?text=No+Image"
                }
                alt={course.course_title}
              />
              <div className="course-badge">
                <span className={`badge ${course.course_status}`}>
                  {course.course_status === "active" ? "Available" : "Coming Soon"}
                </span>
              </div>
            </div>
            <div className="course-card-content">
              <h2 className="course-title">{course.course_title}</h2>
              <p className="course-teacher">By {course.course_teacher_username}</p>
              <p className="course-description">{course.course_description}</p>
              <div className="course-footer">
                <p className="course-price">₹{course.course_price || "Free"}</p>
                <button className="course-button">Enroll Now</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentCourses;
