import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  Menu,
  Divider,
  Avatar,
  Descriptions,
  Dropdown, 
} from "antd";
import {
  SearchOutlined,
  BookOutlined,
  UserOutlined,
  FireOutlined,
  FilterOutlined,
  EyeOutlined,
  DownOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import axios from "axios";
import "../../Styles/Main.css";
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
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [hoveredCourse, setHoveredCourse] = useState(null);
  const [categories, setCategories] = useState([]);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");


  useEffect(() => {
    const authData = JSON.parse(localStorage.getItem("auth_token"));
    if (authData?.user?.id) {
      console.log("myid", authData?.user?.id);

      setUserId(authData.user.id);
    }
  }, []);

  // Fetch user's purchased courses
  useEffect(() => {
    const fetchPurchasedCourses = async () => {
      if (!userId) return;

      try {
        const authData = JSON.parse(localStorage.getItem("auth_token"));
        if (!authData || !authData.access_token) {
          return;
        }
        const accessToken = authData.access_token;

        const response = await axios.post(
          `http://localhost:8000/api/course-purchase/purchases-by-user/`,
          { user_id: userId },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        // Filter for completed purchases only
        const completedPurchases = response.data.results.filter(
          (purchase) => purchase.status === "paid"
        );

        const purchasedCourseIds = completedPurchases.map(
          (purchase) => purchase.course
        );
        console.log("purchasedCourseIds", purchasedCourseIds);

        setPurchasedCourses(purchasedCourseIds);
      } catch (err) {
        console.error("Error fetching purchased courses:", err);
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
        const authData = JSON.parse(localStorage.getItem("auth_token"));
        if (!authData || !authData.access_token) {
          message.error("Authentication tokens are missing. Please log in again.");
          return;
        }
        const accessToken = authData.access_token;

        // Fetch categories with no pagination
        const categoryResponse = await fetch(
          "http://localhost:8000/api/course-category/?no_pagination=true",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const categoryData = await categoryResponse.json();

        // Ensure `categoryData.data` exists before mapping
        const apiCategories = categoryData.data
          ? categoryData.data
            .filter((category) => category.status === "active")
            .map((category) => ({
              key: category.id.toString(),
              name: category.name,
            }))
          : [];

        setCategories([{ key: "all", name: "All Courses" }, ...apiCategories]);

        // Fetch courses with no pagination
        const courseResponse = await fetch(
          "http://localhost:8000/api/course/?no_pagination=true",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const courseData = await courseResponse.json();

        console.log("Fetched Course Data:", courseData); // Debugging

        // Ensure `courseData.data` exists before mapping
        const activeCourses = courseData.data
          ? courseData.data
            .filter((course) => course.course_status === "active")
            .map((course) => ({
              ...course,
              students_enrolled: Math.floor(Math.random() * 500) + 50,
              rating: (Math.random() * 2 + 3).toFixed(1),
              duration: `${Math.floor(Math.random() * 10) + 2} hours`,
              category_id: course.course_category,
              trending: Math.random() > 0.7,
            }))
          : [];

        setCourses(activeCourses);
        setFilteredCourses(activeCourses);
      } catch (err) {
        console.error("Error fetching data:", err);
        message.error("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCategoryChange = (categoryKey) => {
    setSelectedCategory(categoryKey);
    if (categoryKey === "all") {
      setFilteredCourses(courses);
    } else {
      setFilteredCourses(courses.filter((course) => course.category_id.toString() === categoryKey));
    }
  };

  useEffect(() => {
    setFilteredCategories(
      categories.filter((category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, categories]);

  const menu = (
    <Menu className="category-menu">
      <div className="category-search-container">
        <Input
          placeholder="Search Category..."
          className="category-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="category-list">
        <Menu.Item key="all" onClick={() => handleCategoryChange("all")}>
          All Courses
        </Menu.Item>
        {filteredCategories.map((category) => (
          <Menu.Item key={category.key} onClick={() => handleCategoryChange(category.key)}>
            {category.name}
          </Menu.Item>
        ))}
      </div>
    </Menu>
  );



  // Check if user has purchased a course
  // Check if user has purchased a course with completed status
  const isCoursePurchased = (courseId) => {
    if (!purchasedCourses || !userId) return false;

    return purchasedCourses.includes(courseId);
  };

  // Handle search functionality
  const handleSearch = (value) => {
    const searchTerm = value.toLowerCase();
    filterCourses(searchTerm, selectedCategory);
  };

  // Filter courses based on search term and category
  const filterCourses = (searchTerm, category) => {
    let filtered = courses;

    if (searchTerm) {
      filtered = filtered.filter(
        (course) =>
          course.course_title
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          course.course_teacher_username
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (category && category !== "all") {
      filtered = filtered.filter(
        (course) => course.course_category.toString() === category.toString()
      );
    }

    setFilteredCourses(filtered);
  };

  // Handle course purchase
  // Add this inside the StudentCourses component, before the useEffect hooks
  const calculatePriceWithGST = (basePrice) => {
    // Convert basePrice to a number if it's not already
    const price = Number(basePrice);

    // Check if price is a valid number
    if (isNaN(price)) {
      return {
        basePrice: 0,
        gstAmount: 0,
        totalAmount: 0,
        gstRate: 18,
      };
    }

    const GST_RATE = 0.18; // 18%
    const gstAmount = price * GST_RATE;
    const totalAmount = price + gstAmount;

    return {
      basePrice: price,
      gstAmount: gstAmount,
      totalAmount: totalAmount,
      gstRate: GST_RATE * 100,
    };
  };

  const initializeRazorpay = async () => {
    if (!selectedCourse) return;

    setPaymentProcessing(true);
    try {
      const authData = JSON.parse(localStorage.getItem("auth_token"));
      const accessToken = authData.access_token;
      const pricing = calculatePriceWithGST(selectedCourse.course_price);

      // Step 1: Create a purchase order
      const orderResponse = await fetch(
        "http://127.0.0.1:8000/api/course-purchase/purchase-course/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            user: userId,
            course_id: selectedCourse.id,
            amount: pricing.totalAmount,
            gst_amount: pricing.gstAmount,
            total_amount: pricing.totalAmount, // Correct total amount with GST
            platform_share: pricing.basePrice * 0.20, // 15% to platform
            teacher_share: pricing.basePrice * 0.80, // 85% to teacher
          }),
        }
      );

      if (!orderResponse.ok) {
        throw new Error("Failed to create order");
      }

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        message.error(orderData.message || "Failed to initiate payment");
        setPaymentProcessing(false);
        return;
      }

      const { order_id } = orderData.data;

      // Step 2: Open Razorpay payment window with correct total amount (including GST)
      const options = {
        key: "rzp_test_KJQCW0zpmV0TnT", // Replace with your Razorpay key ID
        amount: pricing.totalAmount * 100, // Total amount with GST in paise, rounded to avoid decimal issues
        currency: "INR",
        name: "Knowldge Spark", // Your platform name
        description: `Enrollment for: ${selectedCourse.course_title}`,
        order_id: order_id,
        // prefill: {
        //   name: userData?.name || '', // If you have user data available
        //   email: userData?.email || '',
        //   contact: userData?.phone || ''
        // },
        notes: {
          course_id: selectedCourse.id,
          course_title: selectedCourse.course_title,
          base_price: pricing.basePrice,
          gst_amount: pricing.gstAmount.toFixed(2),
          total_amount: pricing.totalAmount.toFixed(2),
        },
        handler: async function (response) {
          // Step 3: Verify payment
          console.log('newqeuie',response);
          
          try {
            const verifyResponse = await fetch(
              "http://127.0.0.1:8000/api/course-purchase/verify-payment/",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              }
            );

            // if (!verifyResponse.ok) {
            //   throw new Error("Failed to verify payment");
            // }

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              // Show success message and update UI
              message.success(
                "Payment successful! Your course is now accessible."
              );
              setPurchasedCourses([...purchasedCourses, selectedCourse.id]);

              // Redirect to the course page
              setTimeout(() => {
                navigate(`/view-course/${selectedCourse.id}`);
              }, 1000);
            } else {
              message.error(
                verifyData.message || "Payment verification failed!"
              );
            }
          } catch (err) {
            console.error("Payment verification error:", err);
            message.error("Payment verification failed");
          } finally {
            setPaymentProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setPaymentProcessing(false);
          },
        },
        theme: {
          color: "#1890ff", // Match your primary color
        },
      };

      const rzp = new window.Razorpay(options);

      // Handle payment failures
      rzp.on("payment.failed", function (response) {
        message.error("Payment failed. Please try again later.");
        console.error("Payment failed:", response.error);
        setPaymentProcessing(false);
      });

      rzp.open();
    } catch (err) {
      console.error("Payment initialization error:", err);
      message.error(err.message || "Payment initialization failed");
      setPaymentProcessing(false);
    }
  };

  // Navigate to course view page
  const handleViewCourse = (courseId) => {
    navigate(`/view-course/${courseId}`);
  };

  // Render loading state
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
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
      <div className="category-dropdown">
        <Dropdown overlay={menu} trigger={["click"]}>
          <button className="dropdown-btn">
            {selectedCategory ? categories.find((c) => c.key === selectedCategory)?.name : "Select Category"}
            <DownOutlined className="dropdown-icon" />
          </button>
        </Dropdown>
      </div>

      {/* Course List */}
      {filteredCourses.length === 0 ? (
        <div className="empty-state">
          <Empty description="No courses found" className="empty-icon" />
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
                          : "/api/placeholder/400/320"
                    }
                    onClick={() => navigate(`/view-course/${course.id}`)}
                    className="course-thumbnail"
                  />
                  <span
                    className={`course-badge ${purchased ? "enrolled" : "active"
                      }`}
                  >
                    {purchased ? "Enrolled" : "Available"}
                  </span>

                  {hoveredCourse === course.id && (
                    <div className="image-overlay">
                      {purchased ? (
                        <Button
                          type="default"
                          // className="view-course-button"
                          onClick={() => handleViewCourse(course.id)}
                          icon={<EyeOutlined />}
                        >
                          View Course
                        </Button>
                      ) : (
                        <Button
                          className="price-button"
                          onClick={() => navigate(`/view-course/${course.id}`)}
                        // type="primary"
                        // onClick={() => {
                        //   setSelectedCourse(course);
                        //   setModalVisible(true);
                        // }}
                        >
                          Preview
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                <div className="course-card-content">
                  <h3 className="course-title">{course.course_title}</h3>
                  <p className="course-description">
                    {course.course_description}
                  </p>
                  <div className="teacher-info">
                    <span className="teacher-avatar">
                      <UserOutlined />
                    </span>
                    <span className="course-teacher">
                      {course.course_teacher_username}
                    </span>
                  </div>
                  <div className="course-footer">
                    <span
                      className={`course-price ${!course.course_price ? "free" : ""
                        }`}
                    >
                      {course.course_price ? `₹${course.course_price}` : "Free"}
                    </span>
                    {purchased ? (
                      <Button
                        type="primary"

                        onClick={() => handleViewCourse(course.id)}
                        icon={<EyeOutlined />}
                      >
                        View Course
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        onClick={() => {
                          setSelectedCourse(course);
                          setModalVisible(true);
                        }}
                      >
                        {course.course_price ? "Enroll Now" : "Start Free"}
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
        width={800}
        className="course-modal"
        centered
      >
        {selectedCourse && (
          <div className="modal-content">
            {/* Header Section with improved overlay */}
            <div
              className="modal-header"
              style={{
                position: "relative",
                borderRadius: "8px 8px 0 0",
                overflow: "hidden",
              }}
            >
              <img
                src={
                  selectedCourse.course_thumbnail
                    ? `http://localhost:8000${selectedCourse.course_thumbnail}`
                    : "/api/placeholder/400/320"
                }
                alt={selectedCourse.course_title}
                className="modal-image"
                style={{ width: "100%", height: "240px", objectFit: "cover" }}
              />
              <div
                className="modal-overlay"
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                  padding: "20px",
                }}
              >
                <Title
                  level={3}
                  className="modal-title"
                  style={{ color: "white", margin: 0 }}
                >
                  {selectedCourse.course_title}
                </Title>
              </div>
            </div>

            {/* Course Info */}
            <Row
              gutter={[24, 24]}
              className="modal-body"
              style={{ padding: "24px" }}
            >
              <Col xs={24} md={16}>
                <Space
                  direction="vertical"
                  size={24}
                  className="course-details"
                  style={{ width: "100%" }}
                >
                  <div
                    className="instructor-info"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <Avatar
                      icon={<UserOutlined />}
                      size={48}
                      className="instructor-avatar"
                    />
                    <div className="instructor-details">
                      <Text
                        strong
                        className="instructor-name"
                        style={{ display: "block", fontSize: "16px" }}
                      >
                        {selectedCourse.course_teacher_username}
                      </Text>
                      <Text type="secondary" className="instructor-role">
                        Instructor
                      </Text>
                    </div>
                  </div>

                  {/* Description with better formatting */}
                  <div>
                    <Title
                      level={4}
                      className="section-title"
                      style={{ marginBottom: "12px" }}
                    >
                      About This Course
                    </Title>
                    <Paragraph
                      className="course-desc"
                      style={{ fontSize: "15px", lineHeight: "1.6" }}
                    >
                      {selectedCourse.course_description}
                    </Paragraph>
                  </div>

                  {/* Outcomes with improved card design */}
                  {selectedCourse.course_outcomes && (
                    <div className="course-outcomes">
                      <Title
                        level={4}
                        className="section-title"
                        style={{ marginBottom: "16px" }}
                      >
                        What You'll Learn
                      </Title>
                      <Row gutter={[16, 16]}>
                        {selectedCourse.course_outcomes
                          .split("\n")
                          .map((outcome, index) => (
                            <Col xs={24} md={12} key={index}>
                              <Card
                                className="outcome-card"
                                style={{
                                  height: "100%",
                                  borderRadius: "8px",
                                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                }}
                                bodyStyle={{ padding: "16px" }}
                              >
                                <Space align="start">
                                  <CheckCircleFilled
                                    style={{
                                      color: "#52c41a",
                                      fontSize: "16px",
                                      marginTop: "3px",
                                    }}
                                  />
                                  <Text>{outcome}</Text>
                                </Space>
                              </Card>
                            </Col>
                          ))}
                      </Row>
                    </div>
                  )}
                </Space>
              </Col>

              {/* Sidebar with improved pricing display */}
              <Col xs={24} md={8}>
                <div
                  className="purchase-sidebar"
                  style={{
                    background: "#f9f9f9",
                    padding: "20px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  {/* Price information */}
                  <Title
                    level={4}
                    style={{ marginTop: 0, marginBottom: "16px" }}
                  >
                    Price Details
                  </Title>

                  <div
                    className="price-breakdown"
                    style={{ marginBottom: "20px" }}
                  >
                    <Descriptions
                      bordered
                      size="small"
                      column={1}
                      style={{ background: "white", borderRadius: "6px" }}
                    >
                      <Descriptions.Item
                        label="Base Price"
                        labelStyle={{ fontWeight: "normal" }}
                      >
                        ₹{selectedCourse.course_price}
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={`GST (18%)`}
                        labelStyle={{ fontWeight: "normal" }}
                      >
                        ₹
                        {calculatePriceWithGST(
                          selectedCourse.course_price
                        ).gstAmount.toFixed(2)}
                      </Descriptions.Item>
                      <Descriptions.Item
                        label="Total Price"
                        className="total-price"
                        labelStyle={{ fontWeight: "bold" }}
                        contentStyle={{ fontWeight: "bold" }}
                      >
                        ₹
                        {calculatePriceWithGST(
                          selectedCourse.course_price
                        ).totalAmount.toFixed(2)}
                      </Descriptions.Item>
                    </Descriptions>
                  </div>

                  {/* CTA Buttons with improved styling */}
                  <div
                    className="action-buttons"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    {isCoursePurchased(selectedCourse.id) ? (
                      <Button
                        type="primary"
                        size="large"
                        icon={<EyeOutlined />}
                        onClick={() => {
                          setModalVisible(false);
                          handleViewCourse(selectedCourse.id);
                        }}
                        // className="view-button"
                        style={{ height: "48px", fontSize: "16px" }}
                      >
                        View Course
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        size="large"
                        loading={paymentProcessing}
                        onClick={initializeRazorpay}
                        // className="enroll-button"
                        style={{
                          height: "48px",
                          fontSize: "16px",
                          // background: "#1890ff",
                          // borderColor: "#1890ff",
                        }}
                        block
                      >
                        {paymentProcessing ? "Processing..." : "Enroll Now"}
                      </Button>
                    )}
                    <Button
                      danger
                      type="default"
                      size="large"
                      onClick={() => setModalVisible(false)}
                      className="cancel-button"
                      style={{ height: "44px" }}
                      block
                    >
                      Cancel
                    </Button>
                  </div>

                  {/* Additional course information */}
                  <Divider style={{ margin: "20px 0 12px" }} />
                  <div
                    className="course-meta"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text type="secondary">Duration:</Text>
                      <Text>
                        {selectedCourse.course_duration || "Self-paced"}
                      </Text>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text type="secondary">Level:</Text>
                      <Text>{selectedCourse.course_level || "All Levels"}</Text>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text type="secondary">Access:</Text>
                      <Text>Lifetime</Text>
                    </div>
                  </div>
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
