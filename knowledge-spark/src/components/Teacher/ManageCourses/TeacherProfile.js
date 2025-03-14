import {
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  IdcardOutlined,
  MessageOutlined,
  UserOutlined
} from "@ant-design/icons";
import { Avatar, Button, Card, Col, Divider, Row, Spin, Typography } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../../Styles/Main.css";

const { Title, Text, Paragraph } = Typography;

const TeacherProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:8000";

  const getAccessToken = () => {
    const authData = JSON.parse(localStorage.getItem("auth_token"));
    if (!authData?.access_token) {
      throw new Error("Authentication tokens are missing. Please log in again.");
    }
    return authData.access_token;
  };

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const accessToken = getAccessToken();
        const response = await axios.get(`${BASE_URL}/api/user/${id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setTeacher(response.data);
      } catch (error) {
        console.error("Error fetching teacher data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeacherData();
  }, [id]);

  if (loading) {
    return (
      <div className="loader-container">
        <Spin size="large" />
      </div>
    );
  }

  if (!teacher) {
    return <div className="loader-container">Teacher not found</div>;
  }

  const handleTeacherContact = async () => {
    try {
      const accessToken = getAccessToken();
      const userData = JSON.parse(localStorage.getItem("auth_token"));
      const user1 = userData.user.id; // ID from localStorage
      const user2 = parseInt(id); // Convert Teacher ID from useParams() to a number
  
      const payload = {
        user_1: user1,
        user_2: user2,
      };
  
      const response = await axios.post(`${BASE_URL}/api/chat/`, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
  
      // Get the uuid from the response data
      const uuid = response.data.data.uuid;
  
      // Navigate to the chat page and pass the uuid as state
      navigate("/teacher-chat", { state: { uuid } });
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  return (
    <div className="teacher-profile-container">
      {/* Profile Header */}
      <Card
        className="profile-card profile-header-card"
        style={{
          background: "linear-gradient(135deg, #1890ff, #0050b3)",
          color: "#fff",
        }}
      >
        <Row align="middle" gutter={24}>
          <Col xs={24} md={6} className="profile-avatar-container">
            <Avatar
              size={150}
              src={teacher.profile_picture}
              icon={<UserOutlined />}
              className="profile-avatar"
              style={{ border: "4px solid #fff" }}
            />
          </Col>
          <Col xs={24} md={18} className="profile-details">
            <Title level={2} className="profile-name" style={{ color: "#fff" }}>
              {teacher.username}
            </Title>
            {/* <Text className="profile-email" style={{ color: "#fff" }}>
              <MailOutlined /> {teacher.email}
            </Text> */}
            <Divider style={{ borderColor: "rgba(255, 255, 255, 0.3)" }} />
            <Text className="profile-meta" style={{ color: "#fff" }}>
              <IdcardOutlined /> {teacher.type} &nbsp;&nbsp;
              <CalendarOutlined /> {teacher.dob || "N/A"} &nbsp;&nbsp;
              <UserOutlined /> {teacher.gender || "N/A"}
            </Text>
            <Divider style={{ borderColor: "rgba(255, 255, 255, 0.3)" }} />
            <Text className="profile-status" style={{ color: "#fff" }}>
              {teacher.is_active ? (
                <CheckCircleOutlined style={{ color: "green" }} />
              ) : (
                <CheckCircleOutlined style={{ color: "red" }} />
              )}{" "}
              {teacher.is_active ? "Active" : "Inactive"}
            </Text>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="primary"
                icon={<MessageOutlined />}
                style={{ marginTop: 16 }}
                onClick={handleTeacherContact}
              >
                Contact Teacher
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Profile Content */}
      <Row gutter={[24, 24]} className="profile-content" style={{ marginTop: 24 }}>
        <Col xs={24} md={12}>
          <Card className="profile-card animated-card">
            <Title level={4} className="card-title">
              <BookOutlined style={{ fontSize: "24px", marginRight: "8px" }} /> About Me
            </Title>
            <Paragraph className="card-text">
              {teacher.bio || "No bio available."}
            </Paragraph>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          {/* Degree Certificate Section */}
          <Card className="profile-card animated-card">
            <Title level={4} className="card-title">
              Degree Certificate
            </Title>
            {teacher.user_degree_certificate ? (
              <div style={{ textAlign: "center" }}>
                <img
                  src={teacher.user_degree_certificate}
                  alt="Degree Certificate"
                  className="document-preview"
                  style={{ maxWidth: "100%", borderRadius: 8, cursor: "pointer" }}
                  onClick={() => window.open(teacher.user_degree_certificate, "_blank")}
                />
                {/* <Text type="secondary">Click to view full size</Text> */}
              </div>
            ) : (
              <Text>No certificate available.</Text>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TeacherProfile;