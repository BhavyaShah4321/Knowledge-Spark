import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
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
  Divider
} from 'antd';
import { SearchOutlined, BookOutlined, UserOutlined, DollarOutlined } from '@ant-design/icons';

const { Meta } = Card;
const { Title, Paragraph } = Typography;
const { Search } = Input;

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const authData = JSON.parse(localStorage.getItem("auth_token"));
        if (!authData || !authData.access_token) {
          message.error("Authentication tokens are missing. Please log in again.");
          return;
        }
        const accessToken = authData.access_token;
        
        const response = await fetch("http://localhost:8000/api/course/", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const data = await response.json();
        const activeCourses = data.results.data.filter(course => course.course_status === "active");
        setCourses(activeCourses);
        setFilteredCourses(activeCourses);
      } catch (err) {
        message.error("Failed to fetch courses.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleSearch = (value) => {
    const searchTerm = value.toLowerCase();
    const filtered = courses.filter(course => 
      course.course_title.toLowerCase().includes(searchTerm) ||
      course.course_teacher_username.toLowerCase().includes(searchTerm)
    );
    setFilteredCourses(filtered);
  };

  const handlePurchase = (course) => {
    setSelectedCourse(course);
    setModalVisible(true);
  };

  const initializeRazorpay = async () => {
    if (!selectedCourse) return;
    
    setPaymentProcessing(true);
    try {
      const authData = JSON.parse(localStorage.getItem("auth_token"));
      const accessToken = authData.access_token;

      const orderResponse = await fetch("http://localhost:8000/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          courseId: selectedCourse.id,
          amount: selectedCourse.course_price * 100,
        }),
      });
      
      const orderData = await orderResponse.json();

      const options = {
        key: "YOUR_RAZORPAY_KEY_ID",
        amount: selectedCourse.course_price * 100,
        currency: "INR",
        name: "Course Purchase",
        description: `Purchase of ${selectedCourse.course_title}`,
        order_id: orderData.orderId,
        handler: async (response) => {
          try {
            const verifyResponse = await fetch("http://localhost:8000/api/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                courseId: selectedCourse.id,
              }),
            });
            
            const verifyData = await verifyResponse.json();
            
            if (verifyData.success) {
              message.success("Payment successful!");
              navigate(`/view-course/${selectedCourse.id}`);
            }
          } catch (err) {
            message.error("Payment verification failed");
          }
        },
        prefill: {
          name: "Student Name",
          email: "student@example.com",
        },
        theme: {
          color: "#1890ff",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      message.error("Payment initialization failed");
    } finally {
      setPaymentProcessing(false);
      setModalVisible(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Title level={2}>
            <BookOutlined style={{ marginRight: '8px' }} />
            Available Courses
          </Title>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Search
            placeholder="Search courses by name or instructor"
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </Col>
      </Row>

      {filteredCourses.length === 0 ? (
        <Empty
          description="No courses found"
          style={{ marginTop: '48px' }}
        />
      ) : (
        <Row gutter={[24, 24]}>
          {filteredCourses.map((course) => (
            <Col xs={24} sm={12} md={8} lg={6} key={course.id}>
              <Card
                hoverable
                cover={
                  <img
                    alt={course.course_title}
                    src={
                      course.course_thumbnail
                        ? `http://localhost:8000${course.course_thumbnail}`
                        : course.videos && course.videos.length > 0
                        ? `http://localhost:8000${course.videos[0].course_video_thumbnail}`
                        : "/api/placeholder/400/320"
                    }
                    style={{ height: 200, objectFit: 'cover' }}
                    onClick={() => navigate(`/view-course/${course.id}`)}
                  />
                }
                actions={[
                  <Button 
                    type="primary" 
                    block
                    onClick={() => handlePurchase(course)}
                    // icon={<DollarOutlined />}
                  >
                    {course.course_price ? `Purchase ₹${course.course_price}` : "Enroll Free"}
                  </Button>
                ]}
              >
                <Tag color="blue" style={{ position: 'absolute', top: 12, right: 12 }}>
                  Available
                </Tag>
                <Meta
                  title={<Typography.Text strong>{course.course_title}</Typography.Text>}
                  description={
                    <Space direction="vertical" size={8}>
                      <Typography.Text type="secondary">
                        <UserOutlined style={{ marginRight: 8 }} />
                        {course.course_teacher_username}
                      </Typography.Text>
                      <Typography.Paragraph ellipsis={{ rows: 2 }}>
                        {course.course_description}
                      </Typography.Paragraph>
                    </Space>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title={
          <Space align="center">
            <BookOutlined />
            <span>Course Details</span>
          </Space>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="purchase"
            type="primary"
            loading={paymentProcessing}
            onClick={initializeRazorpay}
            // icon={<DollarOutlined />}
          >
            {paymentProcessing ? "Processing..." : "Proceed to Payment"}
          </Button>
        ]}
        width={700}
      >
        {selectedCourse && (
          <div>
            <img
              src={
                selectedCourse.course_thumbnail
                  ? `http://localhost:8000${selectedCourse.course_thumbnail}`
                  : selectedCourse.videos && selectedCourse.videos.length > 0
                  ? `http://localhost:8000${selectedCourse.videos[0].course_video_thumbnail}`
                  : "/api/placeholder/400/320"
              }
              alt={selectedCourse.course_title}
              style={{ width: '100%', height: 300, objectFit: 'cover', marginBottom: 16, borderRadius: 8 }}
            />
            
            <Title level={3}>{selectedCourse.course_title}</Title>
            <Paragraph type="secondary">
              <UserOutlined style={{ marginRight: 8 }} />
              {selectedCourse.course_teacher_username}
            </Paragraph>
            
            <Divider />
            
            <Title level={4}>Description</Title>
            <Paragraph>{selectedCourse.course_description}</Paragraph>
            
            {selectedCourse.course_outcomes && (
              <>
                <Title level={4}>What you'll learn</Title>
                <ul style={{ paddingLeft: 20 }}>
                  {selectedCourse.course_outcomes.split('\n').map((outcome, index) => (
                    <li key={index}>
                      <Paragraph>{outcome}</Paragraph>
                    </li>
                  ))}
                </ul>
              </>
            )}
            
            <Divider />
            
            <Row justify="space-between" align="middle">
              <Col>
                <Title level={3} style={{ margin: 0 }}>
                  Price: {selectedCourse.course_price ? `₹${selectedCourse.course_price}` : "Free"}
                </Title>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentCourses;