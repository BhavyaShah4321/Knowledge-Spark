import React, { useEffect, useState } from "react";
import {
  Layout,
  Menu,
  Card,
  Input,
  Row,
  Col,
  message,
  Spin,
  Empty,
  Tag,
} from "antd";
import { UserOutlined, BookOutlined, SearchOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Header, Sider, Content } = Layout;
const { Meta } = Card;

const MyCourses = () => {
  const [search, setSearch] = useState("");
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [studentId, setStudentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const authData = JSON.parse(localStorage.getItem("auth_token"));
    if (authData?.user?.id) {
      setStudentId(authData.user.id);
    }
  }, []);

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
    if (!studentId) return;

    const fetchPurchasedCourses = async () => {
      try {
        setLoading(true);
        const accessToken = getAccessToken();
        const response = await axios.post(
          `http://localhost:8000/api/course-purchase/purchases-by-user/`,
          { user_id: studentId },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        setPurchasedCourses(response.data.results || []);
      } catch (error) {
        console.error("Error fetching purchased courses:", error);
        message.error("Failed to fetch your purchased courses.");
      } finally {
        setLoading(false);
      }
    };

    fetchPurchasedCourses();
  }, [studentId]);

  const filteredCourses = purchasedCourses.filter((course) =>
    course.course_title.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusTag = (status) => {
    switch (status) {
      case "PENDING":
        return <Tag color="orange">Pending</Tag>;
      case "COMPLETED":
        return <Tag color="green">Completed</Tag>;
      case "FAILED":
        return <Tag color="red">Failed</Tag>;
      default:
        return <Tag color="gray">Unknown</Tag>;
    }
  };

  const handleViewCourse = (courseId) => {
    navigate(`/view-course/${courseId}`,{state: "My Courses"});
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      {/* <Sider theme="light" width={250}>
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: 18,
          }}
        >
          Student Dashboard
        </div>
        <Menu mode="inline" defaultSelectedKeys={["1"]}>
          <Menu.Item key="1" icon={<BookOutlined />}>My Courses</Menu.Item>
          <Menu.Item key="2" icon={<UserOutlined />}>Profile</Menu.Item>
        </Menu>
      </Sider> */}

      <Layout>
        {/* Header */}
        <Header
          style={{
            background: "#fff",
            padding: "10px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2>My Purchased Courses</h2>
          <Input
            placeholder="Search courses..."
            prefix={<SearchOutlined />}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 250 }}
          />
        </Header>

        {}
        <Content style={{ padding: 20 }}>
          {loading ? (
            <Spin
              size="large"
              style={{ display: "block", textAlign: "center", marginTop: 50 }}
            />
          ) : filteredCourses.length > 0 ? (
            <Row gutter={[16, 16]}>
              {filteredCourses.map((course) => course.status==="COMPLETED" && ( 
                 
                <Col xs={24} sm={12} md={8} key={course.id}>
                  <Card
                    hoverable
                    cover={
                      <img
                        alt={course.course_title}
                        src={
                          course.course_thumbnail
                            ? `http://localhost:8000/media/${course.course_thumbnail}`
                            : course.videos?.[0]?.course_video_thumbnail
                            ? `http://localhost:8000${course.videos[0].course_video_thumbnail}`
                            : "/api/placeholder/400/320"
                        }
                        onClick={() => handleViewCourse(course.id)}
                      />
                    }
                  >
                    <Meta
                      title={course.course_title}
                      description={`Instructor: ${course.course_teacher}`}
                    />
                    <p style={{ marginTop: 10 }}>
                      Amount Paid: ₹{course.amount}
                    </p>
                    <p>Status: {getStatusTag(course.status)}</p>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Empty
              description="No purchased courses found."
              style={{ marginTop: 50 }}
            />
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MyCourses;
