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
  Button,
  Typography,
  Divider,
  Tooltip
} from "antd";
import {
  UserOutlined,
  BookOutlined,
  SearchOutlined,
  DownloadOutlined,
  ShoppingOutlined
} from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ProfileCompletionPrompt from "../../Common/ProfileCompletionPrompt";

const { Header, Sider, Content } = Layout;
const { Meta } = Card;
const { Title, Text } = Typography;

const MyCourses = () => {
  const [search, setSearch] = useState("");
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [studentId, setStudentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloadingReceipt, setDownloadingReceipt] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const authData = JSON.parse(localStorage.getItem("auth_token"));
    if (authData?.user?.id) {
      setStudentId(authData.user.id);
    } else {
      message.error("User information not found. Please log in again.");
      navigate("/login");
    }
  }, [navigate]);

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

    const fetchPurchasedCourses = async (page = 1) => {
      try {
        setLoading(true);
        const accessToken = getAccessToken();
        const response = await axios.post(
          `http://localhost:8000/api/course-purchase/purchases-by-user/?no_pagination=true`,
          { user_id: studentId },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        setPurchasedCourses(response.data.data || []);
        console.log("hfhwfh", response)
      } catch (error) {
        console.error("Error fetching purchased courses:", error);
        message.error("Failed to fetch your purchased courses.");
      } finally {
        setLoading(false);
      }
    };

    fetchPurchasedCourses();
  }, [studentId]);

  const handleDownloadReceipt = async (purchaseId) => {
    try {
      setDownloadingReceipt(purchaseId);
      const accessToken = getAccessToken();
      const response = await axios.get(
        `http://localhost:8000/api/course-purchase/${purchaseId}/download-receipt/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          responseType: 'blob', // Important for handling PDF/file downloads
        }
      );

      // Create a blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${purchaseId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      message.success("Receipt downloaded successfully");
    } catch (error) {
      console.error("Error downloading receipt:", error);
      message.error("Failed to download receipt. Please try again.");
    } finally {
      setDownloadingReceipt(null);
    }
  };

  const filteredCourses = purchasedCourses.filter((course) =>
    course.course_title.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusTag = (status) => {
    switch (status) {
      case "PENDING":
        return <Tag color="orange">Pending</Tag>;
      case "paid":
        return <Tag color="green">Completed</Tag>;
      case "FAILED":
        return <Tag color="red">Failed</Tag>;
      default:
        return <Tag color="gray">Unknown</Tag>;
    }
  };

  const handleViewCourse = (courseId) => {
    navigate(`/view-course/${courseId}`, { state: "My Courses" });
  };

  return (
    <>
      <ProfileCompletionPrompt />
      <Layout style={{ minHeight: "100vh" }}>
        <Layout className="site-layout">
          <Header
            style={{
              background: "#fff",
              padding: "16px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              position: "sticky",
              top: 0,
              zIndex: 1,
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <ShoppingOutlined style={{ fontSize: 24, marginRight: 16, color: "#1890ff" }} />
              <Title level={3} style={{ margin: 0 }}>My Purchased Courses</Title>
            </div>
            <Input
              placeholder="Search courses..."
              prefix={<SearchOutlined />}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 300, borderRadius: 4 }}
              size="large"
            />
          </Header>

          <Content style={{ padding: "24px", backgroundColor: "#f5f5f5" }}>
            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
                <Spin size="large" />
              </div>
            ) : filteredCourses.length > 0 ? (
              <>
                <Text type="secondary" style={{ marginBottom: 24, display: "block" }}>
                  Showing {filteredCourses.filter(course => course.status === "paid").length} completed purchases out of {purchasedCourses.length} total purchases
                </Text>
                <Row gutter={[24, 24]}>
                  {filteredCourses.map((course) =>
                    course.status === "paid" && (
                      <Col xs={24} sm={12} md={8} lg={8} key={course.id}>
                        <Card
                          hoverable
                          style={{ borderRadius: 8, overflow: "hidden", height: "100%" }}
                          cover={
                            <div style={{ position: "relative", overflow: "hidden", height: 200 }}>
                              <img
                                alt={course.course_title}
                                src={
                                  course.course_thumbnail
                                    ? `http://localhost:8000/media/${course.course_thumbnail}`
                                    : course.videos?.[0]?.course_video_thumbnail
                                      ? `http://localhost:8000${course.videos[0].course_video_thumbnail}`
                                      : "/api/placeholder/400/320"
                                }
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  transition: "transform 0.3s ease"
                                }}
                                className="course-image"
                              />
                              <style>{`
                              .course-image:hover {
                                transform: scale(1.05);
                                }
                                `}</style>
                            </div>
                          }
                          actions={[
                            <Tooltip title="View Course Content">
                              <Button
                                type="link"
                                icon={<BookOutlined />}
                                onClick={() => handleViewCourse(course.course)}
                              >
                                View Course
                              </Button>
                            </Tooltip>,
                            <Tooltip title="Download Purchase Receipt">
                              <Button
                                type="link"
                                icon={<DownloadOutlined />}
                                onClick={() => handleDownloadReceipt(course.id)}
                                loading={downloadingReceipt === course.id}
                              >
                                Receipt
                              </Button>
                            </Tooltip>
                          ]}
                        >
                          <Meta
                            title={
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Tooltip title={course.course_title}>
                                  <span style={{
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxWidth: "200px",
                                    display: "inline-block"
                                  }}>
                                    {course.course_title}
                                  </span>
                                </Tooltip>
                                {getStatusTag(course.status)}
                              </div>
                            }
                            description={
                              <div>
                                <Text type="secondary">Instructor: {course.course_teacher}</Text>
                                <Divider style={{ margin: "12px 0" }} />
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                  <Text strong>Amount Paid:</Text>
                                  <Text style={{ color: "#52c41a", fontWeight: "bold" }}>₹{course.amount}</Text>
                                </div>
                              </div>
                            }
                          />
                        </Card>
                      </Col>
                    )
                  )}
                </Row>
              </>
            ) : (
              <Empty
                description="No purchased courses found."
                style={{
                  margin: "100px auto",
                  background: "white",
                  padding: "40px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                }}
              />
            )}
          </Content>
        </Layout>
      </Layout>
    </>
  );
};

export default MyCourses;