import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Avatar, Typography, Row, Col, Card, Spin, Divider, Button } from "antd";
import {
  UserOutlined,
  MailOutlined,
  BookOutlined,
  IdcardOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import "../../../Styles/Main.css";

const { Title, Text, Paragraph } = Typography;

const TeacherProfile = () => {
  const { id } = useParams();
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
            <Text className="profile-email" style={{ color: "#fff" }}>
              <MailOutlined /> {teacher.email}
            </Text>
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