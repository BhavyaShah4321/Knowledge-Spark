import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Spin,
  Input,
  Typography,
  Row,
  Col,
  Empty,
  Space,
  Menu,
  Dropdown,
  Tag,
  Rate,
  Badge,
  Card,
  Divider
} from "antd";
import { 
  SearchOutlined, 
  BookOutlined, 
  DownOutlined, 
  UserOutlined, 
  ClockCircleOutlined,
  FireOutlined,
  StarOutlined
} from "@ant-design/icons";
import axios from "axios";
import "../../Styles/Main.css";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

const VisitorCourses = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Fetch courses and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoryResponse = await axios.get(
          "http://localhost:8000/api/course-category/?no_pagination=true"
        );
        const categoryData = categoryResponse.data;

        const apiCategories = categoryData.data
          ? categoryData.data
            .filter((category) => category.status === "active")
            .map((category) => ({
              key: category.id.toString(),
              name: category.name,
            }))
          : [];

        setCategories([{ key: "all", name: "All Courses" }, ...apiCategories]);
        setFilteredCategories([{ key: "all", name: "All Courses" }, ...apiCategories]);

        // Fetch courses
        const courseResponse = await axios.get(
          "http://localhost:8000/api/course/?no_pagination=true"
        );
        const courseData = courseResponse.data;

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
      setFilteredCourses(
        courses.filter((course) => course.category_id.toString() === categoryKey)
      );
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
    <Menu className="category-menu" style={{ maxHeight: '300px', overflow: 'auto' }}>
      <div className="category-search-container" style={{ padding: '8px' }}>
        <Input
          placeholder="Search Category..."
          className="category-search"
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <Menu.Divider />
      <div className="category-list">
        {filteredCategories.map((category) => (
          <Menu.Item
            key={category.key}
            onClick={() => handleCategoryChange(category.key)}
            style={{ 
              backgroundColor: selectedCategory === category.key ? '#f0f7ff' : 'transparent',
              fontWeight: selectedCategory === category.key ? '600' : 'normal'
            }}
          >
            {category.name}
          </Menu.Item>
        ))}
      </div>
    </Menu>
  );

  const handleSearch = (value) => {
    const searchTerm = value.toLowerCase();
    filterCourses(searchTerm, selectedCategory);
  };

  const filterCourses = (searchTerm, category) => {
    let filtered = courses;

    if (searchTerm) {
      filtered = filtered.filter(
        (course) =>
          course.course_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.key === categoryId.toString());
    return category ? category.name : 'Uncategorized';
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "#f5f7fa"
        }}
      >
        <div style={{ textAlign: "center" }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text>Loading courses...</Text>
          </div>
        </div>
      </div>
    );
  }

  const trendingCourses = filteredCourses.filter(course => course.trending);

  return (
    <div style={{ background: "#f5f7fa", minHeight: "100vh" }}>
      {/* Header */}
      <header style={{ 
        background: "white", 
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        position: "sticky", 
        top: 0, 
        zIndex: 1000,
        padding: "12px 24px"
      }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          maxWidth: 1200,
          margin: "0 auto"
        }}>
          <Title level={3} style={{ margin: 0, color: "#1890ff" }}>
             Knowledge Spark
          </Title>
          <Space size="middle">
            <Button type="primary"  onClick={() => navigate("/login")}>
              Login
            </Button>
            <Button type="primary" onClick={() => navigate("/register")}>
              Register
            </Button>
          </Space>
        </div>
      </header>

      {/* Hero Section */}
      <div style={{ 
        background: "linear-gradient(135deg, #1890ff 0%, #0050b3 100%)",
        padding: "60px 24px",
        color: "white",
        textAlign: "center"
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <Title level={1} style={{ color: "white", marginBottom: 16 }}>
            Expand Your Knowledge
          </Title>
          <Paragraph style={{ 
            fontSize: 18, 
            color: "rgba(255,255,255,0.85)", 
            marginBottom: 40
          }}>
            Discover expert-led courses designed to help you master new skills and achieve your goals
          </Paragraph>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <Search
              placeholder="Search for courses or instructors..."
              allowClear
              enterButton="Search"
              size="large"
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
        {/* Filters and Category Selection */}
        <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Title level={3} style={{ margin: 0 }}>
            Courses {selectedCategory !== "all" && `in ${getCategoryName(selectedCategory)}`}
          </Title>
          <Dropdown overlay={menu} trigger={["click"]}>
            <Button style={{ 
              display: "flex", 
              alignItems: "center", 
              borderRadius: 4,
              background: "white",
              height: 40
            }}>
              <Text>{categories.find((c) => c.key === selectedCategory)?.name || "All Courses"}</Text>
              <DownOutlined style={{ marginLeft: 8 }} />
            </Button>
          </Dropdown>
        </div>

        {/* Trending Courses Section (if any) */}
        {trendingCourses.length > 0 && (
          <>
            <div style={{ marginBottom: 24 }}>
              <Title level={4} style={{ 
                display: "flex", 
                alignItems: "center",
                marginBottom: 16
              }}>
                <FireOutlined style={{ color: "#ff4d4f", marginRight: 8 }} /> 
                Trending Courses
              </Title>
              <Row gutter={[24, 24]}>
                {trendingCourses.slice(0, 4).map((course) => (
                  <Col key={`trending-${course.id}`} xs={24} sm={12} md={8} lg={6}>
                    <Badge.Ribbon text="Trending" color="#ff4d4f">
                      <Card
                        hoverable
                        cover={
                          <div style={{ position: "relative", height: 160, overflow: "hidden" }}>
                            <img
                              alt={course.course_title}
                              src={
                                course.course_thumbnail
                                  ? `http://localhost:8000${course.course_thumbnail}`
                                  : "/api/placeholder/400/320"
                              }
                              style={{ 
                                width: "100%", 
                                height: "100%", 
                                objectFit: "cover" 
                              }}
                            />
                          </div>
                        }
                        onClick={() => navigate(`/visitor-view-course/${course.id}`)}
                        style={{ height: "100%" }}
                      >
                        <Tag color="blue" style={{ marginBottom: 8 }}>
                          {getCategoryName(course.category_id)}
                        </Tag>
                        <Title level={5} ellipsis={{ rows: 2 }} style={{ height: 48, marginTop: 0 }}>
                          {course.course_title}
                        </Title>
                        <Paragraph ellipsis={{ rows: 2 }} style={{ color: "rgba(0,0,0,0.45)", height: 44 }}>
                          {course.course_description}
                        </Paragraph>
                        <Divider style={{ margin: "12px 0" }} />
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <Text strong style={{ display: "block", color: course.course_price ? "#1890ff" : "#52c41a" }}>
                              {course.course_price ? `₹${course.course_price}` : "Free"}
                            </Text>
                            <Space size="small" style={{ display: "flex", marginTop: 4 }}>
                              <Rate disabled defaultValue={parseFloat(course.rating)} count={1} />
                              <Text type="secondary">{course.rating}</Text>
                            </Space>
                          </div>
                          <div>
                            <Text type="secondary" style={{ display: "flex", alignItems: "center" }}>
                              <UserOutlined style={{ marginRight: 4 }} /> {course.students_enrolled}
                            </Text>
                            <Text type="secondary" style={{ display: "flex", alignItems: "center", marginTop: 4 }}>
                              <ClockCircleOutlined style={{ marginRight: 4 }} /> {course.duration}
                            </Text>
                          </div>
                        </div>
                      </Card>
                    </Badge.Ribbon>
                  </Col>
                ))}
              </Row>
            </div>
            <Divider />
          </>
        )}

        {/* All Courses Section */}
        <Title level={4} style={{ marginBottom: 16 }}>
          {selectedCategory === "all" ? "All Courses" : "Category Courses"}
        </Title>

        {filteredCourses.length === 0 ? (
          <div style={{ 
            background: "white", 
            padding: 48, 
            borderRadius: 8, 
            textAlign: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)" 
          }}>
            <Empty description={
              <span>
                No courses found for your search criteria
              </span>
            } />
            <Text type="secondary" style={{ display: "block", marginTop: 16 }}>
              Try adjusting your filters or search for different terms
            </Text>
            <Button 
              type="primary" 
              style={{ marginTop: 24 }}
              onClick={() => {
                setSelectedCategory("all");
                setSearchTerm("");
                setFilteredCourses(courses);
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <Row gutter={[24, 24]}>
            {filteredCourses.map((course) => (
              <Col key={course.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  cover={
                    <div style={{ position: "relative", height: 160, overflow: "hidden" }}>
                      <img
                        alt={course.course_title}
                        src={
                          course.course_thumbnail
                            ? `http://localhost:8000${course.course_thumbnail}`
                            : "/api/placeholder/400/320"
                        }
                        style={{ 
                          width: "100%", 
                          height: "100%", 
                          objectFit: "cover" 
                        }}
                      />
                      {course.course_price ? null : (
                        <Tag color="#52c41a" style={{ 
                          position: "absolute", 
                          top: 8, 
                          right: 8,
                          padding: "2px 8px",
                          fontSize: 12
                        }}>
                          Free
                        </Tag>
                      )}
                    </div>
                  }
                  onClick={() => navigate(`/visitor-view-course/${course.id}`)}
                  style={{ height: "100%" }}
                >
                  <Tag color="blue" style={{ marginBottom: 8 }}>
                    {getCategoryName(course.category_id)}
                  </Tag>
                  <Title level={5} ellipsis={{ rows: 2 }} style={{ height: 48, marginTop: 0 }}>
                    {course.course_title}
                  </Title>
                  <Paragraph ellipsis={{ rows: 2 }} style={{ color: "rgba(0,0,0,0.45)", height: 44 }}>
                    {course.course_description}
                  </Paragraph>
                  {/* <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    marginBottom: 12 
                  }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <StarOutlined style={{ color: "#faad14", marginRight: 4 }} />
                      <Text>{course.rating}</Text>
                    </div>
                    <Text type="secondary">
                      <UserOutlined style={{ marginRight: 4 }} />
                      {course.students_enrolled} students
                    </Text>
                  </div> */}
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center" 
                  }}>
                    <Text strong style={{ fontSize: 16, color: "#1890ff" }}>
                      {course.course_price ? `₹${course.course_price}` : "Free"}
                    </Text>
                    <Button type="primary" size="small">
                      View Details
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* Footer */}
      <div style={{ 
        background: "#001529", 
        padding: "40px 24px", 
        color: "rgba(255,255,255,0.65)",
        marginTop: 40
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Row gutter={[48, 32]}>
            <Col xs={24} sm={12} md={8}>
              <Title level={4} style={{ color: "white" }}>
                 Knowledge Spark
              </Title>
              <Paragraph style={{ color: "rgba(255,255,255,0.65)" }}>
                Your gateway to professional skills development and lifelong learning.
              </Paragraph>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Title level={5} style={{ color: "white" }}>Quick Links</Title>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <a style={{ color: "rgba(255,255,255,0.65)", marginBottom: 12 }}>About Us</a>
                <a style={{ color: "rgba(255,255,255,0.65)", marginBottom: 12 }}>Contact</a>
                <a style={{ color: "rgba(255,255,255,0.65)", marginBottom: 12 }}>Become an Instructor</a>
                <a style={{ color: "rgba(255,255,255,0.65)" }}>FAQ</a>
              </div>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Title level={5} style={{ color: "white" }}>Subscribe</Title>
              <Paragraph style={{ color: "rgba(255,255,255,0.65)" }}>
                Stay updated with our latest courses and offers.
              </Paragraph>
              <Input.Group compact>
                <Input 
                  style={{ width: 'calc(100% - 100px)' }} 
                  placeholder="Your email"
                />
                <Button type="primary">Subscribe</Button>
              </Input.Group>
            </Col>
          </Row>
          <Divider style={{ background: "rgba(255,255,255,0.1)", margin: "32px 0 24px" }} />
          <div style={{ textAlign: "center" }}>
            <Text style={{ color: "rgba(255,255,255,0.45)" }}>
              © {new Date().getFullYear()} Knowledge Spark. All rights reserved.
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitorCourses;