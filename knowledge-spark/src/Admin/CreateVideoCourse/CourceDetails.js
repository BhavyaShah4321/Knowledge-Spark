import { Col, Row, Space, Switch, Tag, Typography } from 'antd';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { useParams } from 'react-router-dom'; // Import useParams to access route params

const { Title, Text } = Typography;

function CourceDetails() {
  const { id } = useParams(); // Get the course ID from the URL
  const [course, setCourse] = useState(null);
  const [courseStatus, setCourseStatus] = useState(false);  // State to toggle active/inactive

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        const authData = JSON.parse(localStorage.getItem('auth_token'));
        if (!authData || !authData.access_token) {
          console.error('Authentication tokens are missing. Please log in again.');
          return;
        }
        const accessToken = authData.access_token;
        const response = await axios.get(`http://localhost:8000/api/course/${id}/`, {  // Use dynamic course ID
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setCourse(response.data.data); // Assuming the data is inside a 'data' field
        setCourseStatus(response.data.data.course_status === 'active'); // Set initial status
      } catch (error) {
        console.error('Error fetching course details:', error);
      }
    };

    fetchCourseDetail();
  }, [id]);  // Re-fetch course details when the ID changes

  if (!course) return <div>Loading...</div>;

  const toggleStatus = async (checked) => {
    setCourseStatus(checked);
    // Call API to update status (Active/Inactive)
    try {
      const authData = JSON.parse(localStorage.getItem('auth_token'));
      if (!authData || !authData.access_token) {
        console.error('Authentication tokens are missing. Please log in again.');
        return;
      }
      const accessToken = authData.access_token;
      await axios.put(
        `http://localhost:8000/api/course/${course.id}/`,
        { course_status: checked ? 'active' : 'inactive' }, // 'active' and 'inactive' are string literals
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
    } catch (error) {
      console.error('Error updating course status:', error);
    }
  };

  return (
    <div className="course-detail-container">
      <Row justify="center" className="course-detail-row">
        <Col xs={24} sm={20} md={18} lg={16} xl={14}>
          <div className="course-detail-card">
            {/* Course Title & Status */}
            <Title level={1} className="course-title">{course.course_title}</Title>
            <Space size="large" className="course-status">
              <Text strong className="course-teacher">
                Teacher: {course.course_teacher}
              </Text>
              <div className="course-status-toggle">
                <span>Status:  &nbsp;</span>
                <Switch
                  checked={courseStatus}
                  onChange={toggleStatus}  // Pass checked to the toggleStatus function
                  checkedChildren="Active"
                  unCheckedChildren="Inactive"
                />
              </div>
            </Space>

            {/* Course Description */}
            <div className="course-description">
              <Text className="course-description-text">{course.course_description}</Text>
            </div>

            {/* Video Player */}
            <div className="course-video">
              <ReactPlayer 
                url={course.course_video} // Assuming the video URL is provided in the response
                controls
                width="100%"
                height="400px"
              />
            </div>

            {/* Course Tags */}
            <div className="course-tags">
              <Tag color="blue">Programming</Tag>
              <Tag color="green">Development</Tag>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default CourceDetails;
