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
} from 'antd';
import {
  SearchOutlined,
  BookOutlined,
  UserOutlined,
  FireOutlined,
  FilterOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import '../../Styles/Main.css';
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
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hoveredCourse, setHoveredCourse] = useState(null);
  const [categories, setCategories] = useState([]);
  const [userId, setUserId] = useState(null);
  // const [purchasedCourses, setPurchasedCourses] = useState([]);
  const navigate = useNavigate();
  
  
  useEffect(() => {
    const authData = JSON.parse(localStorage.getItem("auth_token"));
    if (authData?.user?.id) {
      console.log('myid',authData?.user?.id);
      
      setUserId(authData.user.id);
    }
  }, []);

  // Fetch user's purchased courses
  useEffect(() => {
    const fetchPurchasedCourses = async () => {
      if (!userId) return;
      
      try {
        const authData = JSON.parse(localStorage.getItem('auth_token'));
        if (!authData || !authData.access_token) {
          return;
        }
        const accessToken = authData.access_token;

      
         const response = await axios.post(
                `http://localhost:8000/api/course-purchase/purchases-by-user/`,
                { user_id: userId},
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                }
              );

      
        // const data = await response.json();
        
      
          const purchasedCourseIds = response.data.results.map(purchase => purchase.course);
          console.log('purchasedCourseIds',purchasedCourseIds);
          
          setPurchasedCourses(purchasedCourseIds);
        
      } catch (err) {
        console.error('Error fetching purchased courses:', err);
      }
    };

     
    if (userId) {
      fetchPurchasedCourses();
    }
  }, [userId]);

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

  // Check if user has purchased a course
  const isCoursePurchased = (courseId) => {
    return purchasedCourses.includes(courseId);
  };

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
              // Add the purchased course to purchasedCourses state
              setPurchasedCourses([...purchasedCourses, selectedCourse.id]);
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

  // Navigate to course view page
  const handleViewCourse = (courseId) => {
    navigate(`/view-course/${courseId}`);
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
    <div className="container">
      {/* Main Content */}
      <Row justify="space-between" align="middle" className="search-header">
        <Col>
          <Title level={2} className="page-title">
            <BookOutlined className="title-icon" />
            Explore Courses
          </Title>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <div className="search-container">
            <Search
              placeholder="Search courses by name or instructor"
              allowClear
              enterButton
              size="large"
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
          </div>
        </Col>
      </Row>

      {/* Category Filters */}
      <div className="category-container">
        {categories.map((category) => (
          <Button
            key={category.key}
            className={`category-pill ${selectedCategory === category.key ? 'active' : ''}`}
            onClick={() => handleCategoryChange(category.key)}
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* Course List */}
      {filteredCourses.length === 0 ? (
  <div className="empty-state">
    <Empty
      description="No courses found"
      className="empty-icon"
    />
    <p className="empty-text">Try adjusting your search criteria</p>
  </div>
) : (
  <div className="course-grid">
    {filteredCourses.map((course, index) => {
      const purchased = isCoursePurchased(course.id);
      
      return (
        <div
          className="course-card"
          key={course.id}
          style={{ "--animation-order": index }}
          onMouseEnter={() => setHoveredCourse(course.id)}
          onMouseLeave={() => setHoveredCourse(null)}
        >
          <div className="course-image">
            <img
              alt={course.course_title}
              src={
                course.course_thumbnail
                  ? `http://localhost:8000${course.course_thumbnail}`
                  : course.videos?.[0]?.course_video_thumbnail
                    ? `http://localhost:8000${course.videos[0].course_video_thumbnail}`
                    : '/api/placeholder/400/320'
              }
              onClick={() => navigate(`/view-course/${course.id}`)}
              className="course-thumbnail"
            />
            <span className={`course-badge ${purchased ? 'enrolled' : 'active'}`}>
              {purchased ? 'Enrolled' : 'Available'}
            </span>
            {hoveredCourse === course.id && (
              <div className="image-overlay">
                {purchased ? (
                  <Button
                    className="view-button"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewCourse(course.id)}
                  >
                    View Course
                  </Button>
                ) : (
                  <Button
                    className="price-button"
                    onClick={() => navigate(`/view-course/${course.id}`)}
                  >
                    Preview
                  </Button>
                )}
              </div>
            )}
          </div>
          <div className="course-card-content">
            <h3 className="course-title">{course.course_title}</h3>
            <p className="course-description">{course.course_description}</p>
            <div className="teacher-info">
              <span className="teacher-avatar">
                <UserOutlined />
              </span>
              <span className="course-teacher">{course.course_teacher_username}</span>
            </div>
            <div className="course-footer">
              <span className={`course-price ${!course.course_price ? 'free' : ''}`}>
                {course.course_price ? `₹${course.course_price}` : 'Free'}
              </span>
              {purchased ? (
                <Button
                  className="view-course-button"
                  onClick={() => handleViewCourse(course.id)}
                  icon={<EyeOutlined />}
                >
                  View Course
                </Button>
              ) : (
                <Button
                  className="primary"
                  onClick={() => {
                    setSelectedCourse(course);
                    setModalVisible(true);
                  }}
                >
                  {course.course_price ? 'Enroll Now' : 'Start Free'}
                </Button>
              )}
            </div>
          </div>
        </div>
      );
    })}
  </div>
)}
      {/* Purchase Modal */}
      <Modal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={750}
        className="course-modal"
        centered
      >
       {selectedCourse && (
          <div className="modal-content">
            {/* Header Section */}
            <div className="modal-header">
              <img
                src={
                  selectedCourse.course_thumbnail
                    ? `http://localhost:8000${selectedCourse.course_thumbnail}`
                    : "/api/placeholder/400/320"
                }
                alt={selectedCourse.course_title}
                className="modal-image"
              />
              <div className="modal-overlay">
                <Title level={3} className="modal-title">
                  {selectedCourse.course_title}
                </Title>
              </div>
            </div>

            {/* Course Info */}
            <Row gutter={[24, 24]} className="modal-body">
              <Col xs={24} md={16}>
                <Space direction="vertical" size={24} className="course-details">
                  <div className="instructor-info">
                    <Avatar icon={<UserOutlined />} size={48} className="instructor-avatar" />
                    <div className="instructor-details">
                      <Text strong className="instructor-name">
                        {selectedCourse.course_teacher_username}
                      </Text>
                      <Text type="secondary" className="instructor-role">
                        Instructor
                      </Text>
                    </div>
                  </div>

                  {/* Description */}
                  <Paragraph className="course-desc">{selectedCourse.course_description}</Paragraph>

                  {/* Outcomes */}
                  {selectedCourse.course_outcomes && (
                    <div className="course-outcomes">
                      <Title level={4} className="section-title">What You'll Learn</Title>
                      <Row gutter={[16, 16]}>
                        {selectedCourse.course_outcomes.split("\n").map((outcome, index) => (
                          <Col xs={24} md={12} key={index}>
                            <Card className="outcome-card">
                              <Text>{outcome}</Text>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  )}
                </Space>
              </Col>

              {/* Sidebar */}
              <Col xs={24} md={8}>
                <div className="purchase-sidebar">
                  <Title level={2} className="course-price">
                    {selectedCourse.course_price ? `₹${selectedCourse.course_price}` : "Free"}
                  </Title>
                  {isCoursePurchased(selectedCourse.id) ? (
                    <Button
                      type="primary"
                      size="large"
                      icon={<EyeOutlined />}
                      onClick={() => {
                        setModalVisible(false);
                        handleViewCourse(selectedCourse.id);
                      }}
                      className="view-button"
                    >
                      View Course
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      size="large"
                      loading={paymentProcessing}
                      onClick={initializeRazorpay}
                      className="enroll-button"
                    >
                      {paymentProcessing ? "Processing..." : "Enroll Now"}
                    </Button>
                  )}
                  <Button
                    type="default"
                    size="large"
                    onClick={() => setModalVisible(false)}
                    className="cancel-button"
                  >
                    Cancel
                  </Button>
                  <Divider />
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};
export default StudentCourses;