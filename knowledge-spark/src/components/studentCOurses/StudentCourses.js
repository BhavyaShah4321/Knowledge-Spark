// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { 
//   Card, 
//   Modal, 
//   Button, 
//   Tag, 
//   Spin, 
//   message, 
//   Input, 
//   Typography, 
//   Row, 
//   Col, 
//   Empty,
//   Space,
//   Divider
// } from 'antd';
// import { SearchOutlined, BookOutlined, UserOutlined, DollarOutlined } from '@ant-design/icons';

// const { Meta } = Card;
// const { Title, Paragraph } = Typography;
// const { Search } = Input;

// const StudentCourses = () => {
//   const [courses, setCourses] = useState([]);
//   const [filteredCourses, setFilteredCourses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedCourse, setSelectedCourse] = useState(null);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [paymentProcessing, setPaymentProcessing] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchCourses = async () => {
//       try {
//         const authData = JSON.parse(localStorage.getItem("auth_token"));
//         if (!authData || !authData.access_token) {
//           message.error("Authentication tokens are missing. Please log in again.");
//           return;
//         }
//         const accessToken = authData.access_token;
        
//         const response = await fetch("http://localhost:8000/api/course/", {
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//           },
//         });
//         const data = await response.json();
//         const activeCourses = data.results.data.filter(course => course.course_status === "active");
//         setCourses(activeCourses);
//         setFilteredCourses(activeCourses);
//       } catch (err) {
//         message.error("Failed to fetch courses.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchCourses();
//   }, []);

//   const handleSearch = (value) => {
//     const searchTerm = value.toLowerCase();
//     const filtered = courses.filter(course => 
//       course.course_title.toLowerCase().includes(searchTerm) ||
//       course.course_teacher_username.toLowerCase().includes(searchTerm)
//     );
//     setFilteredCourses(filtered);
//   };

//   const handlePurchase = (course) => {
//     setSelectedCourse(course);
//     setModalVisible(true);
//   };

//   const initializeRazorpay = async () => {
//     if (!selectedCourse) return;
    
//     setPaymentProcessing(true);
//     try {
//       const authData = JSON.parse(localStorage.getItem("auth_token"));
//       const accessToken = authData.access_token;

//       const orderResponse = await fetch("http://localhost:8000/api/create-order", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${accessToken}`,
//         },
//         body: JSON.stringify({
//           courseId: selectedCourse.id,
//           amount: selectedCourse.course_price * 100,
//         }),
//       });
      
//       const orderData = await orderResponse.json();

//       const options = {
//         key: "YOUR_RAZORPAY_KEY_ID",
//         amount: selectedCourse.course_price * 100,
//         currency: "INR",
//         name: "Course Purchase",
//         description: `Purchase of ${selectedCourse.course_title}`,
//         order_id: orderData.orderId,
//         handler: async (response) => {
//           try {
//             const verifyResponse = await fetch("http://localhost:8000/api/verify-payment", {
//               method: "POST",
//               headers: {
//                 "Content-Type": "application/json",
//                 Authorization: `Bearer ${accessToken}`,
//               },
//               body: JSON.stringify({
//                 razorpay_payment_id: response.razorpay_payment_id,
//                 razorpay_order_id: response.razorpay_order_id,
//                 razorpay_signature: response.razorpay_signature,
//                 courseId: selectedCourse.id,
//               }),
//             });
            
//             const verifyData = await verifyResponse.json();
            
//             if (verifyData.success) {
//               message.success("Payment successful!");
//               navigate(`/view-course/${selectedCourse.id}`);
//             }
//           } catch (err) {
//             message.error("Payment verification failed");
//           }
//         },
//         prefill: {
//           name: "Student Name",
//           email: "student@example.com",
//         },
//         theme: {
//           color: "#1890ff",
//         },
//       };

//       const razorpay = new window.Razorpay(options);
//       razorpay.open();
//     } catch (err) {
//       message.error("Payment initialization failed");
//     } finally {
//       setPaymentProcessing(false);
//       setModalVisible(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
//         <Spin size="large" />
//       </div>
//     );
//   }

//   return (
//     <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
//       <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
//         <Col>
//           <Title level={2}>
//             <BookOutlined style={{ marginRight: '8px' }} />
//             Available Courses
//           </Title>
//         </Col>
//         <Col xs={24} sm={12} md={8}>
//           <Search
//             placeholder="Search courses by name or instructor"
//             allowClear
//             enterButton={<SearchOutlined />}
//             size="large"
//             onChange={(e) => handleSearch(e.target.value)}
//           />
//         </Col>
//       </Row>

//       {filteredCourses.length === 0 ? (
//         <Empty
//           description="No courses found"
//           style={{ marginTop: '48px' }}
//         />
//       ) : (
//         <Row gutter={[24, 24]}>
//           {filteredCourses.map((course) => (
//             <Col xs={24} sm={12} md={8} lg={6} key={course.id}>
//               <Card
//                 hoverable
//                 cover={
//                   <img
//                     alt={course.course_title}
//                     src={
//                       course.course_thumbnail
//                         ? `http://localhost:8000${course.course_thumbnail}`
//                         : course.videos && course.videos.length > 0
//                         ? `http://localhost:8000${course.videos[0].course_video_thumbnail}`
//                         : "/api/placeholder/400/320"
//                     }
//                     style={{ height: 200, objectFit: 'cover' }}
//                     onClick={() => navigate(`/view-course/${course.id}`)}
//                   />
//                 }
//                 actions={[
//                   <Button 
//                     type="primary" 
//                     block
//                     onClick={() => handlePurchase(course)}
//                     // icon={<DollarOutlined />}
//                   >
//                     {course.course_price ? `Purchase ₹${course.course_price}` : "Enroll Free"}
//                   </Button>
//                 ]}
//               >
//                 <Tag color="blue" style={{ position: 'absolute', top: 12, right: 12 }}>
//                   Available
//                 </Tag>
//                 <Meta
//                   title={<Typography.Text strong>{course.course_title}</Typography.Text>}
//                   description={
//                     <Space direction="vertical" size={8}>
//                       <Typography.Text type="secondary">
//                         <UserOutlined style={{ marginRight: 8 }} />
//                         {course.course_teacher_username}
//                       </Typography.Text>
//                       <Typography.Paragraph ellipsis={{ rows: 2 }}>
//                         {course.course_description}
//                       </Typography.Paragraph>
//                     </Space>
//                   }
//                 />
//               </Card>
//             </Col>
//           ))}
//         </Row>
//       )}

//       <Modal
//         title={
//           <Space align="center">
//             <BookOutlined />
//             <span>Course Details</span>
//           </Space>
//         }
//         open={modalVisible}
//         onCancel={() => setModalVisible(false)}
//         footer={[
//           <Button key="cancel" onClick={() => setModalVisible(false)}>
//             Cancel
//           </Button>,
//           <Button
//             key="purchase"
//             type="primary"
//             loading={paymentProcessing}
//             onClick={initializeRazorpay}
//             // icon={<DollarOutlined />}
//           >
//             {paymentProcessing ? "Processing..." : "Proceed to Payment"}
//           </Button>
//         ]}
//         width={700}
//       >
//         {selectedCourse && (
//           <div>
//             <img
//               src={
//                 selectedCourse.course_thumbnail
//                   ? `http://localhost:8000${selectedCourse.course_thumbnail}`
//                   : selectedCourse.videos && selectedCourse.videos.length > 0
//                   ? `http://localhost:8000${selectedCourse.videos[0].course_video_thumbnail}`
//                   : "/api/placeholder/400/320"
//               }
//               alt={selectedCourse.course_title}
//               style={{ width: '100%', height: 300, objectFit: 'cover', marginBottom: 16, borderRadius: 8 }}
//             />
            
//             <Title level={3}>{selectedCourse.course_title}</Title>
//             <Paragraph type="secondary">
//               <UserOutlined style={{ marginRight: 8 }} />
//               {selectedCourse.course_teacher_username}
//             </Paragraph>
            
//             <Divider />
            
//             <Title level={4}>Description</Title>
//             <Paragraph>{selectedCourse.course_description}</Paragraph>
            
//             {selectedCourse.course_outcomes && (
//               <>
//                 <Title level={4}>What you'll learn</Title>
//                 <ul style={{ paddingLeft: 20 }}>
//                   {selectedCourse.course_outcomes.split('\n').map((outcome, index) => (
//                     <li key={index}>
//                       <Paragraph>{outcome}</Paragraph>
//                     </li>
//                   ))}
//                 </ul>
//               </>
//             )}
            
//             <Divider />
            
//             <Row justify="space-between" align="middle">
//               <Col>
//                 <Title level={3} style={{ margin: 0 }}>
//                   Price: {selectedCourse.course_price ? `₹${selectedCourse.course_price}` : "Free"}
//                 </Title>
//               </Col>
//             </Row>
//           </div>
//         )}
//       </Modal>
//     </div>
//   );
// };

// export default StudentCourses;

import React, { useEffect, useState, useRef } from 'react';
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
  Divider,
  Avatar,
  Carousel,
  Progress,
  Tooltip,
} from 'antd';
import {
  SearchOutlined,
  BookOutlined,
  UserOutlined,
  DollarOutlined,
  FireOutlined,
  StarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  RightCircleOutlined,
  LeftCircleOutlined,
  FilterOutlined,
  SortAscendingOutlined,
} from '@ant-design/icons';

const { Meta } = Card;
const { Title, Paragraph, Text } = Typography;
const { Search } = Input;

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hoveredCourse, setHoveredCourse] = useState(null);
  const [categories, setCategories] = useState([]);
   const [userId, setUserId] = useState(null);
  const carouselRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const authData = JSON.parse(localStorage.getItem("auth_token"));
    if (authData?.user?.id) {
      setUserId(authData.user.id);
    }
  }, []);

  // Fetch courses and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const authData = JSON.parse(localStorage.getItem('auth_token'));
        if (!authData || !authData.access_token) {
          message.error('Authentication tokens are missing. Please log in again.');
          return;
        }
        const accessToken = authData.access_token;

        // Fetch categories
        const categoryResponse = await fetch('http://localhost:8000/api/course-category/', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const categoryData = await categoryResponse.json();

        const apiCategories = categoryData.results.data
          .filter((category) => category.status === 'active')
          .map((category) => ({
            key: category.id.toString(),
            name: category.name,
          }));

        setCategories([{ key: 'all', name: 'All Courses' }, ...apiCategories]);

        // Fetch courses
        const courseResponse = await fetch('http://localhost:8000/api/course/', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const courseData = await courseResponse.json();

        const activeCourses = courseData.results.data
          .filter((course) => course.course_status === 'active')
          .map((course) => ({
            ...course,
            students_enrolled: Math.floor(Math.random() * 500) + 50,
            rating: (Math.random() * 2 + 3).toFixed(1),
            duration: `${Math.floor(Math.random() * 10) + 2} hours`,
            category_id: course.course_category,
            trending: Math.random() > 0.7,
          }));

        setCourses(activeCourses);
        setFilteredCourses(activeCourses);
      } catch (err) {
        console.error('Error fetching data:', err);
        message.error('Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle search functionality
  const handleSearch = (value) => {
    const searchTerm = value.toLowerCase();
    filterCourses(searchTerm, selectedCategory);
  };

  // Handle category filter change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    filterCourses('', category);
  };

  // Filter courses based on search term and category
  const filterCourses = (searchTerm, category) => {
    let filtered = courses;

    if (searchTerm) {
      filtered = filtered.filter(
        (course) =>
          course.course_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.course_teacher_username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (category && category !== 'all') {
      filtered = filtered.filter((course) => course.course_category.toString() === category.toString());
    }

    setFilteredCourses(filtered);
  };

  // Handle course purchase
 // Update the initializeRazorpay function to include user ID in the payload
const initializeRazorpay = async () => {
  if (!selectedCourse) return;

  setPaymentProcessing(true);
  try {
    const authData = JSON.parse(localStorage.getItem('auth_token'));
    const accessToken = authData.access_token;

    // Step 1: Create a purchase order
    const orderResponse = await fetch('http://127.0.0.1:8000/api/course-purchase/purchase-course/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        user: userId,
        course_id: selectedCourse.id,
        amount: selectedCourse.course_price,
      }),
    });

    if (!orderResponse.ok) {
      throw new Error('Failed to create order');
    }

    const orderData = await orderResponse.json();

    if (!orderData.success) {
      message.error(orderData.message || 'Failed to initiate payment');
      return;
    }

    const { order_id, amount: orderAmount } = orderData.data;

    // Step 2: Open Razorpay payment window
    const options = {
      key: 'rzp_test_KJQCW0zpmV0TnT', // Replace with your Razorpay key ID
      amount: orderAmount * 100, // Amount in paise
      currency: 'INR',
      name: selectedCourse.course_title,
      description: `Purchase of ${selectedCourse.course_title}`,
      order_id: order_id,
      handler: async function (response) {
        // Step 3: Verify payment
        try {
          const verifyResponse = await fetch('http://127.0.0.1:8000/api/course-purchase/verify-payment/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          if (!verifyResponse.ok) {
            throw new Error('Failed to verify payment');
          }

          const verifyData = await verifyResponse.json();

          if (verifyData.success) {
            message.success('Payment successful! Your course is now accessible.');
            navigate(`/view-course/${selectedCourse.id}`);
          } else {
            message.error(verifyData.message || 'Payment verification failed!');
          }
        } catch (err) {
          console.error('Payment verification error:', err);
          message.error('Payment verification failed');
        }
      },
      theme: {
        color: '#3399cc',
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (err) {
    console.error('Payment initialization error:', err);
    message.error(err.message || 'Payment initialization failed');
  } finally {
    setPaymentProcessing(false);
    setModalVisible(false);
  }
};

  // Render loading state
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Main Content */}
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <BookOutlined style={{ marginRight: '8px' }} />
            Explore Courses
          </Title>
        </Col>
        <Col xs={24} sm={12} md={8} style={{ marginTop: 'xs' in window ? '16px' : 0 }}>
          <Search
            placeholder="Search courses by name or instructor"
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onChange={(e) => handleSearch(e.target.value)}
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: '8px' }}
          />
        </Col>
      </Row>

      {/* Category Filters */}
      <div style={{ marginBottom: '24px', overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: '8px' }}>
        <Space size="middle" style={{ display: 'inline-flex' }}>
          <FilterOutlined style={{ fontSize: '18px', color: '#1890ff' }} />
          {categories.map((category) => (
            <Button
              key={category.key}
              type={selectedCategory === category.key ? 'primary' : 'default'}
              onClick={() => handleCategoryChange(category.key)}
              style={{
                borderRadius: '20px',
                ...(selectedCategory === category.key
                  ? {
                      background: 'linear-gradient(90deg, #1890ff, #36cfc9)',
                      border: 'none',
                      boxShadow: '0 2px 8px rgba(24,144,255,0.25)',
                    }
                  : {}),
              }}
            >
              {category.name}
            </Button>
          ))}
        </Space>
      </div>

      {/* Course List */}
      {filteredCourses.length === 0 ? (
        <Empty
          description="No courses found"
          style={{ marginTop: '48px' }}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <Row gutter={[24, 24]}>
          {filteredCourses.map((course) => (
            <Col xs={24} sm={12} md={8} lg={6} key={course.id}>
              <Card
                hoverable
                style={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  transform: hoveredCourse === course.id ? 'translateY(-8px)' : 'none',
                  boxShadow:
                    hoveredCourse === course.id
                      ? '0 12px 24px rgba(0,0,0,0.15)'
                      : '0 4px 12px rgba(0,0,0,0.1)',
                }}
                onMouseEnter={() => setHoveredCourse(course.id)}
                onMouseLeave={() => setHoveredCourse(null)}
                cover={
                  <div style={{ position: 'relative' }}>
                    <img
                      alt={course.course_title}
                      src={
                        course.course_thumbnail
                          ? `http://localhost:8000${course.course_thumbnail}`
                          : course.videos && course.videos.length > 0
                          ? `http://localhost:8000${course.videos[0].course_video_thumbnail}`
                          : '/api/placeholder/400/320'
                      }
                      style={{ height: 180, objectFit: 'cover', transition: 'transform 0.5s ease' }}
                      onClick={() => navigate(`/view-course/${course.id}`)}
                    />
                    {course.trending && (
                      <Tag color="red" style={{ position: 'absolute', top: 12, left: 12 }}>
                        <FireOutlined /> Trending
                      </Tag>
                    )}
                    <Tag
                      color="blue"
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        background: 'rgba(24,144,255,0.8)',
                        backdropFilter: 'blur(4px)',
                        border: 'none',
                      }}
                    >
                      Available
                    </Tag>
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                        padding: '16px 12px 12px',
                        transition: 'opacity 0.3s ease',
                        opacity: hoveredCourse === course.id ? 1 : 0,
                      }}
                    >
                      <Space>
                        <Button
                          type="primary"
                          size="small"
                          onClick={() => navigate(`/view-course/${course.id}`)}
                          style={{
                            background: 'white',
                            color: '#1890ff',
                            borderRadius: '4px',
                          }}
                        >
                          Preview
                        </Button>
                        <Button
                          type="primary"
                          size="small"
                          onClick={() => {
                            setSelectedCourse(course);
                            setModalVisible(true);
                          }}
                          style={{
                            background: 'linear-gradient(90deg, #1890ff, #36cfc9)',
                            border: 'none',
                            borderRadius: '4px',
                          }}
                        >
                          {course.course_price ? `₹${course.course_price}` : 'Free'}
                        </Button>
                      </Space>
                    </div>
                  </div>
                }
                bodyStyle={{ padding: '16px' }}
              >
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                  <Typography.Text strong style={{ fontSize: '16px', lineHeight: '22px', display: 'block' }}>
                    {course.course_title}
                  </Typography.Text>

                  <Space split={<Divider type="vertical" style={{ margin: '0 4px' }} />}>
                    <Space size={4}>
                      <StarOutlined style={{ color: '#fadb14' }} />
                      <Text>{course.rating}</Text>
                    </Space>
                    <Space size={4}>
                      <TeamOutlined style={{ color: '#1890ff' }} />
                      <Text>{course.students_enrolled}</Text>
                    </Space>
                    <Space size={4}>
                      <ClockCircleOutlined style={{ color: '#52c41a' }} />
                      <Text>{course.duration}</Text>
                    </Space>
                  </Space>

                  <Typography.Paragraph
                    ellipsis={{ rows: 2 }}
                    style={{
                      fontSize: '14px',
                      color: 'rgba(0,0,0,0.65)',
                      margin: '4px 0 8px',
                    }}
                  >
                    {course.course_description}
                  </Typography.Paragraph>

                  <Space align="center">
                    <Avatar src="/api/placeholder/32/32" icon={<UserOutlined />} size="small" />
                    <Typography.Text type="secondary" style={{ fontSize: '14px' }}>
                      {course.course_teacher_username}
                    </Typography.Text>
                  </Space>

                  <Button
                    type="primary"
                    block
                    onClick={() => {
                      setSelectedCourse(course);
                      setModalVisible(true);
                    }}
                    style={{
                      marginTop: '8px',
                      background: course.course_price
                        ? 'linear-gradient(90deg, #1890ff, #36cfc9)'
                        : 'linear-gradient(90deg, #52c41a, #36cfc9)',
                      border: 'none',
                      borderRadius: '6px',
                      boxShadow: '0 2px 8px rgba(24,144,255,0.25)',
                    }}
                  >
                    {course.course_price ? `Enroll for ₹${course.course_price}` : 'Enroll Free'}
                  </Button>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Purchase Modal */}
      <Modal
        title={null}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
        style={{ borderRadius: '16px', overflow: 'hidden' }}
        bodyStyle={{ padding: 0 }}
        centered
      >
        {selectedCourse && (
          <div>
            <div style={{ position: 'relative' }}>
              <img
                src={
                  selectedCourse.course_thumbnail
                    ? `http://localhost:8000${selectedCourse.course_thumbnail}`
                    : selectedCourse.videos && selectedCourse.videos.length > 0
                    ? `http://localhost:8000${selectedCourse.videos[0].course_video_thumbnail}`
                    : '/api/placeholder/400/320'
                }
                alt={selectedCourse.course_title}
                style={{ width: '100%', height: 300, objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '40px 24px 24px',
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                  color: 'white',
                }}
              >
                {selectedCourse.trending && (
                  <Tag color="red" style={{ marginBottom: '8px' }}>
                    <FireOutlined /> Trending
                  </Tag>
                )}
                <Title level={3} style={{ color: 'white', margin: '0 0 8px 0' }}>
                  {selectedCourse.course_title}
                </Title>
              </div>
            </div>

            <div style={{ padding: '24px' }}>
              <Row gutter={[24, 24]}>
                <Col xs={24} md={16}>
                  <Space direction="vertical" size={24} style={{ width: '100%' }}>
                    <Space size="middle">
                      <Avatar src="/api/placeholder/40/40" icon={<UserOutlined />} size={48} />
                      <div>
                        <Text strong style={{ display: 'block', fontSize: '16px' }}>
                          {selectedCourse.course_teacher_username}
                        </Text>
                        <Text type="secondary">Course Instructor</Text>
                      </div>
                    </Space>

                    <div>
                      <Title level={4} style={{ marginBottom: '16px' }}>
                        About This Course
                      </Title>
                      <Paragraph>{selectedCourse.course_description}</Paragraph>
                    </div>

                    {selectedCourse.course_outcomes && (
                      <div>
                        <Title level={4} style={{ marginBottom: '16px' }}>
                          What You'll Learn
                        </Title>
                        <Row gutter={[16, 16]}>
                          {selectedCourse.course_outcomes.split('\n').map((outcome, index) => (
                            <Col xs={24} md={12} key={index}>
                              <Card
                                size="small"
                                style={{
                                  borderRadius: '8px',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                }}
                              >
                                <Space align="start">
                                  <div
                                    style={{
                                      color: '#1890ff',
                                      backgroundColor: 'rgba(24,144,255,0.1)',
                                      borderRadius: '50%',
                                      width: '24px',
                                      height: '24px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      marginRight: '8px',
                                    }}
                                  >
                                    {index + 1}
                                  </div>
                                  <Text>{outcome}</Text>
                                </Space>
                              </Card>
                            </Col>
                          ))}
                        </Row>
                      </div>
                    )}

                    {/* <div>
                      <Title level={4} style={{ marginBottom: '16px' }}>
                        Course Info
                      </Title>
                      <Row gutter={[16, 16]}>
                        <Col xs={12} sm={8}>
                          <Card
                            size="small"
                            style={{
                              textAlign: 'center',
                              borderRadius: '8px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            }}
                          >
                            <Space direction="vertical" size={0}>
                              <ClockCircleOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                              <Text type="secondary">Duration</Text>
                              <Text strong>{selectedCourse.duration}</Text>
                            </Space>
                          </Card>
                        </Col>
                        <Col xs={12} sm={8}>
                          <Card
                            size="small"
                            style={{
                              textAlign: 'center',
                              borderRadius: '8px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            }}
                          >
                            <Space direction="vertical" size={0}>
                              <TeamOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                              <Text type="secondary">Students</Text>
                              <Text strong>{selectedCourse.students_enrolled}</Text>
                            </Space>
                          </Card>
                        </Col>
                        <Col xs={12} sm={8}>
                          <Card
                            size="small"
                            style={{
                              textAlign: 'center',
                              borderRadius: '8px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            }}
                          >
                            <Space direction="vertical" size={0}>
                              <StarOutlined style={{ fontSize: '24px', color: '#fadb14' }} />
                              <Text type="secondary">Rating</Text>
                              <Text strong>{selectedCourse.rating}/5.0</Text>
                            </Space>
                          </Card>
                        </Col>
                      </Row>
                    </div> */}
                  </Space>
                </Col>

                <Col xs={24} md={8}>
                  <div
                    style={{
                      position: 'sticky',
                      top: '24px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '12px',
                      padding: '24px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  >
                    <Title level={2} style={{ margin: '0 0 24px 0', textAlign: 'center' }}>
                      {selectedCourse.course_price ? (
                        <>
                          <span style={{ fontSize: '16px' }}>₹</span>
                          {selectedCourse.course_price}
                        </>
                      ) : (
                        'Free Access'
                      )}
                    </Title>

                    <Space direction="vertical" size={16} style={{ width: '100%' }}>
                      <Button
                        type="primary"
                        size="large"
                        block
                        loading={paymentProcessing}
                        onClick={initializeRazorpay}
                        style={{
                          height: '48px',
                          fontSize: '16px',
                          background: 'linear-gradient(90deg, #1890ff, #36cfc9)',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(24,144,255,0.25)',
                        }}
                      >
                        {paymentProcessing
                          ? 'Processing...'
                          : selectedCourse.course_price
                          ? 'Enroll Now'
                          : 'Start Learning Now'}
                      </Button>

                      <Button
                        type="default"
                        size="large"
                        block
                        onClick={() => setModalVisible(false)}
                        style={{
                          height: '48px',
                          borderRadius: '8px',
                        }}
                      >
                        Cancel
                      </Button>
                    </Space>

                    <Divider />

                    {/* <Space direction="vertical" size={12} style={{ width: '100%' }}>
                      <div>
                        <Text strong>This course includes:</Text>
                      </div>
                      <Space align="center">
                        <ClockCircleOutlined style={{ color: '#1890ff' }} />
                        <Text>{selectedCourse.duration} of video content</Text>
                      </Space>
                      <Space align="center">
                        <BookOutlined style={{ color: '#1890ff' }} />
                        <Text>Downloadable resources</Text>
                      </Space>
                      <Space align="center">
                        <TeamOutlined style={{ color: '#1890ff' }} />
                        <Text>Community access</Text>
                      </Space>
                      <Space align="center">
                        <DollarOutlined style={{ color: '#1890ff' }} />
                        <Text>Lifetime access</Text>
                      </Space>
                    </Space> */}
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentCourses;