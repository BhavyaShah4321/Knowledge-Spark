import {
  DownOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  UploadOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import {
  Breadcrumb,
  Button,
  Col,
  Drawer,
  Dropdown,
  Form,
  Input,
  Menu,
  Row,
  Select,
  Space,
  Table,
  Tooltip,
  Upload,
  message,
  Modal,
  Spin,
} from "antd";
import { Option } from "antd/es/mentions";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ReactComponent as EditIcon } from "../../../Image/EditIcon.svg";
import { ReactComponent as FilterIcon } from "../../../Image/FilterIcon.svg";

export default function CourseList() {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [courseData, setCourseData] = useState([]);
  const [category, setCategory] = useState([]);

  // Drawer states
  const [courseDrawerOpen, setCourseDrawerOpen] = useState(false);
  const [courseVideoDrawerOpen, setCourseVideoDrawerOpen] = useState(false);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [courseVideoModalOpen, setCourseVideoModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingCourseVideo, setEditingCourseVideo] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Forms
  const [courseForm] = Form.useForm();
  const [courseVideoForm] = Form.useForm();
  const [teacherId, setTeacherId] = useState(null);

  const navigate = useNavigate();
  // Fetch Categories from API
  const fetchCategoryDetails = async () => {
    // Check if we have cached data
    const cachedData = localStorage.getItem('categoryData');
    if (cachedData) {
      const { categories, timestamp } = JSON.parse(cachedData);
      const isStillValid = Date.now() - timestamp < 3600000; // 1 hour cache

      if (isStillValid) {
        setCategory(categories);
        return; // Skip fetching if we have valid cached data
      }
    }

    try {
      setLoading(true);
      const accessToken = getAccessToken();

      const response = await fetch(
        "http://localhost:8000/api/course-category/?no_pagination=true",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const data = await response.json();
      let categoryArray;

      if (data && typeof data === "object") {
        if (data.data && Array.isArray(data.data)) {
          categoryArray = data.data;
        } else if (data.results?.data && Array.isArray(data.results.data)) {
          categoryArray = data.results.data;
        } else if (Array.isArray(data)) {
          categoryArray = data;
        } else {
          console.error("Unexpected category data structure:", data);
          categoryArray = [];
        }
      } else {
        console.error("Invalid category data:", data);
        categoryArray = [];
      }

      const apiCategories = categoryArray
        .filter((cat) => cat && cat.status === "active")
        .map((cat) => ({ id: cat.id, name: cat.name }));

      const categoriesWithAll = [{ id: "all", name: "All Courses" }, ...apiCategories];

      // Cache the result
      localStorage.setItem('categoryData', JSON.stringify({
        categories: categoriesWithAll,
        timestamp: Date.now()
      }));

      setCategory(categoriesWithAll);
    } catch (error) {
      console.error("Error fetching categories:", error);
      message.error("Failed to fetch categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryDetails();
  }, []);


  const filteredCategories = category.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    setFilteredCourses(courseData);
  }, [courseData]);

  const handleSearch = (value) => {
    setSearchText(value);
    const searchTerm = value.trim().toLowerCase();

    if (!searchTerm) {
      setFilteredCourses(courseData); // Reset search when empty
      return;
    }

    const filtered = courseData.filter((course) =>
      course.course_title?.toLowerCase().includes(searchTerm) ||
      course.course_teacher_username?.toLowerCase().includes(searchTerm)
    );

    setFilteredCourses(filtered);
  };

  const handleReset = () => {
    setSearchText(""); // Clear input field
    setFilteredCourses(courseData); // Reset data to original
  };

  const openCourseModal = (course = null) => {
    setEditingCourse(course);
    if (course) {
      const formData = {
        ...course,
        course_thumbnail: course.course_thumbnail
          ? [
            {
              uid: "-1",
              name: "current-thumbnail.jpg",
              status: "done",
              url: course.course_thumbnail,
            },
          ]
          : undefined,
      };
      courseForm.setFieldsValue(formData);
    } else {
      courseForm.resetFields();
    }
    setCourseModalOpen(true);
  };

  const openCourseVideoModal = (course, video = null) => {
    setEditingCourseVideo({
      courseId: course.id,
      courseTitle: course.course_title,
      videoId: video ? video.id : null,
    });
    if (video) {
      courseVideoForm.setFieldsValue({
        course_video_title: video.course_video_title,
        course_video_description: video.course_video_description,
        course_video_thumbnail: video.course_video_thumbnail
          ? [
            {
              uid: "-1",
              name: "current-thumbnail.jpg",
              status: "done",
              url: video.course_video_thumbnail,
            },
          ]
          : undefined,
        course_video: video.course_video
          ? [
            {
              uid: "-1",
              name: "current-video.mp4",
              status: "done",
              url: video.course_video,
            },
          ]
          : undefined,
      });
    } else {
      courseVideoForm.resetFields();
    }
    setCourseVideoModalOpen(true);
  };

  useEffect(() => {
    const authData = JSON.parse(localStorage.getItem("auth_token")); // Changed to "auth_token"
    if (authData?.user?.id) {
      setTeacherId(authData.user.id);
    }
    fetchCourseDetails(currentPage);
    fetchCategoryDetails(currentPage);
  }, [currentPage]);

  const handleCourseSubmit = async (values) => {
    try {
      if (!teacherId) {
        message.error("Teacher ID not available");
        return;
      }

      const accessToken = getAccessToken();
      const endpoint = editingCourse
        ? `http://localhost:8000/api/course/${editingCourse.id}/`
        : "http://localhost:8000/api/course/";

      const method = editingCourse ? "patch" : "post";
      const formData = new FormData();

      const form_data = {
        course_title: values.course_title,
        course_description: values.course_description,
        course_category: values.course_category,
        course_price: values.course_price,
        course_teacher: teacherId,
      };

      // Handle thumbnail
      if (values.course_thumbnail?.[0]?.originFileObj) {
        formData.append(
          "course_thumbnail",
          values.course_thumbnail[0].originFileObj
        );
      } else if (editingCourse && editingCourse.course_thumbnail) {
        // Preserve existing thumbnail during edit if no new one is uploaded
        form_data.course_thumbnail = editingCourse.course_thumbnail;
      }

      formData.append("form_data", JSON.stringify(form_data));

      const response = await axios({
        method,
        url: endpoint,
        data: formData,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // Don't set Content-Type - let browser handle it for FormData
        },
      });

      if (response.status === 200 || response.status === 201) {
        message.success(
          `Course ${editingCourse ? "updated" : "added"} successfully`
        );
        setCourseModalOpen(false);
        courseForm.resetFields();
        fetchCourseDetails(currentPage);
      }
    } catch (error) {
      console.error("Error submitting course:", error);
      if (error.response?.data) {
        // Show specific error message from backend if available
        message.error(
          error.response.data.message || "Failed to save course details"
        );
      } else {
        message.error("Failed to save course details");
      }
    }
  };
  const handleCourseVideoSubmit = async (values) => {
    try {
      if (!teacherId) {
        message.error("Teacher ID not available");
        return;
      }

      const accessToken = getAccessToken();
      const endpoint = editingCourseVideo?.videoId
        ? `http://localhost:8000/api/course-video/${editingCourseVideo.videoId}/`
        : "http://localhost:8000/api/course-video/";

      const formData = new FormData();

      // Add files to FormData
      if (values.course_video?.[0]?.originFileObj) {
        formData.append("course_video", values.course_video[0].originFileObj);
      }
      if (values.course_video_thumbnail?.[0]?.originFileObj) {
        formData.append(
          "course_video_thumbnail",
          values.course_video_thumbnail[0].originFileObj
        );
      }

      const form_data = {
        course: editingCourseVideo.courseId, // Changed to 'course' to match API
        course_video_title: values.course_video_title,
        course_video_description: values.course_video_description,
        course_teacher: teacherId, // Using the correct field name 'teacher'
      };

      formData.append("form_data", JSON.stringify(form_data));

      const response = await axios({
        method: editingCourseVideo?.videoId ? "patch" : "post",
        url: endpoint,
        data: formData,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200 || response.status === 201) {
        message.success(
          `Course video ${editingCourseVideo?.videoId ? "updated" : "added"
          } successfully`
        );
        setCourseVideoModalOpen(false);
        courseVideoForm.resetFields();
        fetchCourseDetails(currentPage); // Refresh the course list
      }
    } catch (error) {
      console.error("Error submitting course video:", error);
      message.error("Failed to save course video details");
    }
  };

  const getCurrentUserId = () => {
    const authData = JSON.parse(localStorage.getItem("auth_token"));
    return authData?.user?.id;
  };

  const fetchCourseDetails = async (page = 1) => {
    try {
      setLoading(true);
      const accessToken = getAccessToken();
      const userId = getCurrentUserId();

      console.log("access", accessToken);

      if (!userId) {
        message.error("User ID not found. Please login again.");
        return;
      }

      const response = await axios.post(
        `http://localhost:8000/api/course/get-course-according-teacher/`,
        { user_id: userId },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const courseDetails = response.data.data;
      console.log("details", courseDetails);

      setCourseData(courseDetails || []);
      setTotalItems(courseDetails.count || 0);
    } catch (error) {
      console.error("Error fetching course details:", error);
      message.error("Failed to fetch course details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userId = getCurrentUserId();
    if (userId) {
      setTeacherId(userId);
      fetchCourseDetails(currentPage);
    } else {
      message.error("Please login to view courses");
      // Optionally redirect to login page
      // navigate('/login');
    }
  }, [currentPage]);

  const menu = (record) => (
    <Menu
      onClick={({ key }) => {
        updateCourseStatus(record.id, key);
      }}
    >
      <Menu.Item key="active" disabled={record.course_status === "active"}>
        Set to Active
      </Menu.Item>
      <Menu.Item key="inactive" disabled={record.course_status === "inactive"}>
        Set to Inactive
      </Menu.Item>
    </Menu>
  );
  const updateCourseStatus = async (id, status) => {
    try {
      setLoading(true);
      const accessToken = getAccessToken();

      const response = await axios.patch(
        `http://localhost:8000/api/course/${id}/`,
        {
          form_data: JSON.stringify({
            course_status: status,
          }),
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        message.success(`Course status updated to ${status} successfully`);
        fetchCourseDetails(currentPage);
      }
    } catch (error) {
      console.error("Error updating course status:", error);
      message.error("Failed to update course status");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Sr. No.",
      key: "index",
      render: (text, record, index) => (currentPage - 1) * 10 + index + 1,
    },
    {
      title: "Course Title",
      dataIndex: "course_title",
      key: "course_title",
      render: (text, record) =>
        record.course_status === "inactive" ? (
          <Tooltip title="This course has been deactivated by the admin.">
            <span style={{ color: "gray", cursor: "not-allowed" }}>{text}</span>
          </Tooltip>
        ) : (
          <Tooltip title="View Course Video">
            <a
              onClick={() => navigate(`/view-course/${record.id}`)}
              style={{ color: "#1890ff", cursor: "pointer" }}
            >
              {text}
            </a>
          </Tooltip>
        ),
    },
    {
      title: "Course Description",
      dataIndex: "course_description",
      key: "course_description",
      render: (text, record) =>
        record.course_status === "inactive" ? (
          <span style={{ color: "gray" }}>This course has been deactivated by the admin.</span>
        ) : (
          text
        ),
    },
    {
      title: "Course Price",
      dataIndex: "course_price",
      key: "course_price",
      render: (price, record) =>
        record.course_status === "inactive" ? (
          <span style={{ color: "gray" }}>N/A</span>
        ) : (
          `₹${price}`
        ),
    },
    {
      title: "Course Category Name",
      dataIndex: "course_category_name",
      key: "course_category_name",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) =>
        record.course_status === "inactive" ? (
          <Tooltip title="This course has been deactivated by the admin.">
            <span style={{ color: "gray", cursor: "not-allowed" }}>Actions Disabled</span>
          </Tooltip>
        ) : (
          <Space>
            <Tooltip title="Edit Course">
              <Button
                icon={<EditOutlined />}
                onClick={() => openCourseModal(record)}
              />
            </Tooltip>
            <Tooltip title="Manage Course Videos">
              <Button
                icon={<VideoCameraOutlined />}
                onClick={() => openCourseVideoModal(record)}
              />
            </Tooltip>
          </Space>
        ),
    },
  ];

  const rowClassName = (record) =>
    record.course_status === "inactive" ? "inactive-row" : "";


  return (
    <div>
      <Row className="pagenamerow mb-0" justify="space-between" align="middle">
        <Col>
          <h2>Courses</h2>
          <div className="bredcrumbwrp">
            <Link to="/dashboard" className="back">
              BACK
            </Link>
            <Breadcrumb
              items={[
                { title: <Link to="/dashboard">Home</Link> },
                { title: "Courses" },
              ]}
            />
          </div>
        </Col>
        <Col>
          <Space size="small">
            <Input
              placeholder="Search courses..."
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              prefix={<SearchOutlined />}
            />
            <Tooltip placement="top" title="Reset Filter">
              <Button
                type="primary"
                className="iconlink"
                onClick={handleReset}
                disabled={!searchText.trim()} >
                <FilterIcon />
              </Button>
            </Tooltip>
            <Tooltip title="Add Course">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => openCourseModal()}
              >
                Add Course
              </Button>
            </Tooltip>
          </Space>
        </Col>
      </Row>

      <Modal
        title={editingCourse ? "Edit Course" : "Add Course"}
        open={courseModalOpen}
        onCancel={() => setCourseModalOpen(false)}
        footer={null}
        width={600}
        centered
      >
        <Form layout="vertical" form={courseForm} onFinish={handleCourseSubmit}>
          {/* ... keep existing form items unchanged */}
          <Form.Item
            name="course_title"
            label="Course Title"
            rules={[
              { required: true, message: "Please enter course title!" },
              {
                pattern: /^[a-zA-Z\s]+$/,
                message: "Course title can only include letters and spaces!",
              },
            ]}
          >
            <Input placeholder="Enter Course Title" />
          </Form.Item>

          <Form.Item
            name="course_description"
            label="Course Description"
            rules={[
              {
                required: true,
                message: "Please enter course description!",
              },
            ]}
          >
            <Input.TextArea placeholder="Enter Course Description" />
          </Form.Item>

          <Form.Item
            name="course_category"
            label="Course Category"
            rules={[
              {
                required: true,
                message: "Please select a course category!",
              },
            ]}
          >
            {loading ? (
              <Spin />
            ) : (
              <Select
                showSearch
                placeholder="Select Course Category"
                value={selectedCategory}
                onChange={setSelectedCategory}
                optionFilterProp="children" // This helps with search performance
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                listHeight={160} // Set a fixed height for the dropdown list
                dropdownRender={(menu) => (
                  <div>
                    {/* Fixed Search Bar */}
                    <div style={{ padding: "8px", background: "#fff", position: "sticky", top: 0, zIndex: 10 }}>
                      <Input
                        placeholder="Search Category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    {menu} {/* Render the menu directly instead of wrapping it */}
                  </div>
                )}
              >
                {filteredCategories.map((cat) => (
                  <Option key={cat.id} value={cat.id} disabled={cat.status === "inactive"}>
                    {cat.name}
                  </Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item
            name="course_thumbnail"
            label="Course Thumbnail"
            rules={[
              { required: true, message: "Please upload course thumbnail" },
            ]}
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) return e;
              return e?.fileList;
            }}
          >
            <Upload
              name="course_thumbnail"
              listType="picture"
              beforeUpload={() => false}
              accept="image/*"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Course Thumbnail</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="course_price"
            label="Course Price"
            rules={[
              {
                required: true,
                message: "Please enter course price!",
              },
            ]}
          >
            <Input placeholder="Enter Course Price" />
          </Form.Item>

          <Form.Item className="text-right">
            <Space>
              <Button onClick={() => setCourseModalOpen(false)}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={editingCourse ? <EditIcon /> : <PlusOutlined />}
              >
                {editingCourse ? "Update Course" : "Add Course"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Course Video Modal */}
      <Modal
        title={`${editingCourseVideo?.videoId ? "Edit" : "Add"} Course Video`}
        open={courseVideoModalOpen}
        onCancel={() => setCourseVideoModalOpen(false)}
        footer={null}
        width={600}
        centered
      >
        <Form
          layout="vertical"
          form={courseVideoForm}
          onFinish={handleCourseVideoSubmit}
        >
          {/* ... keep existing form items unchanged */}
          <Form.Item
            name="course_video_title"
            label="Course Video Title"
            rules={[
              { required: true, message: "Please enter course video title!" },
              {
                pattern: /^[a-zA-Z\s]+$/,
                message:
                  "Course video title can only include letters and spaces!",
              },
            ]}
          >
            <Input placeholder="Enter Course Video Title" />
          </Form.Item>

          <Form.Item
            name="course_video_description"
            label="Course Video Description"
            rules={[
              {
                required: true,
                message: "Please enter course video description!",
              },
            ]}
          >
            <Input.TextArea placeholder="Enter Course Video Description" />
          </Form.Item>

          <Form.Item
            name="course_video_thumbnail"
            label="Course Video Thumbnail"
            rules={[
              {
                required: true,
                message: "Please upload course video thumbnail",
              },
            ]}
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) return e;
              return e?.fileList;
            }}
          >
            <Upload
              name="course_video_thumbnail"
              listType="picture"
              beforeUpload={() => false}
              accept="image/*"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Upload Thumbnail</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="course_video"
            label="Course Video"
            rules={[{ required: true, message: "Please upload course video" }]}
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) return e;
              return e?.fileList;
            }}
          >
            <Upload
              name="course_video"
              listType="text"
              beforeUpload={() => false}
              accept="video/*"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Upload Video</Button>
            </Upload>
          </Form.Item>

          <Form.Item className="text-right">
            <Space>
              <Button onClick={() => setCourseVideoModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={
                  editingCourseVideo?.videoId ? <EditIcon /> : <PlusOutlined />
                }
              >
                {editingCourseVideo?.videoId ? "Update" : "Add"} Course Video
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Table
        dataSource={searchText ? filteredCourses : courseData} // Use filteredCourses when searching
        columns={columns}
        rowKey="id"
        rowClassName={rowClassName}
        pagination={{
          current: currentPage,
          total: totalItems,
          pageSize: 10, // Adjust page size based on API response
          showTotal: (total) => `Total ${total} items`,
        }}
        onChange={(pagination) => {
          setCurrentPage(pagination.current);
        }}
        loading={loading}
      />

    </div>
  );
}
