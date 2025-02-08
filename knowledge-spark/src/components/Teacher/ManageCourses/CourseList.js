import {
  DownOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Breadcrumb,
  Button,
  Col,
  Dropdown,
  Input,
  Menu,
  Row,
  Space,
  Table,
  Tooltip,
  message,
  Drawer,
  Form,
  Select,
} from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ReactComponent as EditIcon } from "../../../Image/EditIcon.svg";
import { ReactComponent as FilterIcon } from "../../../Image/FilterIcon.svg";
import { Option } from "antd/es/mentions";

export default function CourseList() {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [courseData, setCourseData] = useState([]);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState([]);

  const fetchCategoryDetails = async (page = 1) => {
    try {
      setLoading(true);
      const accessToken = getAccessToken();

      const response = await axios.get(
        `http://localhost:8000/api/course-category/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const CategoryDetails = response.data;
      setCategory(CategoryDetails.results.data || []);
      setTotalItems(CategoryDetails.count || 0);
    } catch (error) {
      console.error("Error fetching category details:", error);
      message.error("Failed to fetch category details");
    } finally {
      setLoading(false);
    }
  };

  const getAccessToken = () => {
    const authData = JSON.parse(localStorage.getItem("auth_token"));
    if (!authData?.access_token) {
      throw new Error(
        "Authentication tokens are missing. Please log in again."
      );
    }
    return authData.access_token;
  };

  const fetchCourseDetails = async (page = 1) => {
    try {
      setLoading(true);
      const accessToken = getAccessToken();

      const response = await axios.get(`http://localhost:8000/api/course/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const CourseDetails = response.data;
      setCourseData(CourseDetails.results.data || []);
      setTotalItems(CourseDetails.count || 0);
    } catch (error) {
      console.error("Error fetching course details:", error);
      message.error("Failed to fetch course details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseDetails(currentPage);
    fetchCategoryDetails(currentPage);
  }, [currentPage]);

  const openEditDrawer = (course) => {
    setEditingCourse(course);
    form.setFieldsValue(course);
    setEditDrawerOpen(true);
  };

  const handleEditSubmit = async (values) => {
    try {
      if (!editingCourse?.id) {
        message.error("No course selected for editing");
        return;
      }

      const formData = new FormData();

      const form_data = {
        course_description: values.course_description,
        course_title: values.course_title,
        course_price: values.course_price,
      };

      formData.append("form_data", JSON.stringify(form_data));
      setLoading(true);
      const accessToken = getAccessToken();

      const response = await axios.patch(
        `http://localhost:8000/api/course/${editingCourse.id}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        message.success("Course updated successfully");
        setEditDrawerOpen(false);
        fetchCourseDetails(currentPage); // Refresh course list
      }
    } catch (error) {
      console.error("Error updating course:", error);
      message.error("Failed to update course");
    } finally {
      setLoading(false);
    }
  };

  const showDrawer = () => {
    // seteditingCourse(null);
    form.resetFields();
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
    form.resetFields();
    // seteditingCourse(null);
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
      render: (text, record) => (
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
    },
    {
      title: "Course Price",
      dataIndex: "course_price",
      key: "course_price",
      render: (price) => `₹${price}`,
    },
    {
      title: "Course Category Name",
      dataIndex: "category_name",
      key: "category_name",
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (text, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              style={{ cursor: "pointer" }}
              onClick={() => openEditDrawer(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleSubmit = async (values) => {
    try {
      // Get auth token
      const authData = JSON.parse(localStorage.getItem("auth_token"));
      if (!authData?.access_token) {
        throw new Error(
          "Authentication tokens are missing. Please log in again."
        );
      }
      const accessToken = authData.access_token;

      const endpoint = editingCourse
        ? `http://localhost:8000/api/course/${editingCourse.id}/`
        : "http://localhost:8000/api/course/";

      const method = editingCourse ? "patch" : "post";

      // Create FormData instance
      const formData = new FormData();

      // Create the form_data object
      const form_data = {
        // username: values.username,
        // email: values.email,
        // type: "Student",
        // gender: values.gender,
        // bio: values.bio,
        // dob: values.dob ? values.dob.format("DD-MM-YYYY") : undefined,
        course_title:values.course_title,
        course_description:values.course_description,
        course_category:values.course_category,
        course_price:values.course_price,
        
      };

      // Add form_data as a stringified JSON
      formData.append("form_data", JSON.stringify(form_data));

      // Send the request
      const response = await axios({
        method,
        url: endpoint,
        data: formData,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200 || response.status === 201) {
        message.success(
          `Category ${editingCourse ? "updated" : "added"} successfully`
        );
        setOpen(false);
        form.resetFields();
        // seteditingCourse(null);
        // fetchStudentDetails(currentPage);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error("Failed to save category details");
    }
  };

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
              placeholder="Search"
              prefix={<SearchOutlined />}
              value={searchText}
              // onChange={onSearchChange}
              style={{ width: "100%" }}
            />
            <Tooltip placement="top" title="Reset Filter">
              <Button
                type="primary"
                className="iconlink"
                //  onClick={resetFilter}
              >
                <FilterIcon />
              </Button>
            </Tooltip>
            <Tooltip title="Add Course">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={showDrawer}
              >
                Add Course
              </Button>
            </Tooltip>
          </Space>
        </Col>
      </Row>

      <Drawer
        title={editingCourse ? "Edit Course" : "Add Course"}
        onClose={onClose}
        open={open}
        width={400}
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            name="course_title"
            label="Course Title"
            rules={[
              { required: true, message: "Please enter course title!" },
              {
                pattern: /^[a-zA-Z\s]+$/,
                message: "course title can only include letters and spaces!",
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
            <Input placeholder="Enter Course Description" />
          </Form.Item>
          <Form.Item
            name="course_category"
            label="Course Category"
            rules={[
              {
                required: true,
                message: "Please select course category!",
              },
            ]}
          >
            <Select placeholder="Select Course Category">
              {/* {category.map((el) => (
                <Option key={el.id} value={el.id}>
                  {el.name}
                </Option>
              ))} */}

              {
                 category.map((el)=>(
                  <Option key={el.id} value={el.id}>
                    {el.name}
                  </Option>
                 ))
              }
            </Select>
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

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={editingCourse ? <EditIcon /> : <PlusOutlined />}
            >
              {editingCourse ? "Update Course" : "Add Course"}
            </Button>
          </Form.Item>
        </Form>
      </Drawer>

      <Table
        dataSource={Array.isArray(courseData) ? courseData : []}
        columns={columns}
        rowKey="id"
        pagination={{
          current: currentPage,
          total: totalItems,
          pageSize: 10,
          showSizeChanger: false,
        }}
        loading={loading}
      />

      {/* Edit Drawer */}
      <Drawer
        title="Edit Course"
        placement="right"
        width={400}
        onClose={() => setEditDrawerOpen(false)}
        open={editDrawerOpen}
      >
        <Form form={form} layout="vertical" onFinish={handleEditSubmit}>
          <Form.Item
            label="Course Title"
            name="course_title"
            rules={[{ required: true, message: "Please enter course title" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Course Description"
            name="course_description"
            rules={[
              { required: true, message: "Please enter course description" },
            ]}
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item
            label="Course Price"
            name="course_price"
            rules={[{ required: true, message: "Please enter course price" }]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Update Course
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
