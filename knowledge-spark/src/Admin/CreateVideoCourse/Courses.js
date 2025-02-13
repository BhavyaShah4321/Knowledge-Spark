import {
  DownOutlined,
  EditOutlined,
  SearchOutlined
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
  message,
  Modal
} from "antd";
import { Option } from "antd/es/mentions";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ReactComponent as FilterIcon } from "../../Image/FilterIcon.svg";

export default function Courses() {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [courseData, setCourseData] = useState([]);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [categories, setCategories] = useState([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);




  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const authData = JSON.parse(localStorage.getItem("auth_token"));
        if (!authData || !authData.access_token) {
          console.error("Authentication tokens are missing. Please log in again.");
          return;
        }
        const accessToken = authData.access_token;
        const response = await axios.get("http://localhost:8000/api/course-category/", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          }
        });
        const categories = response.data.results.data;
        console.log(categories);  // Check the output here
        setCategories(categories); // Update the state with the fetched categories
      } catch (error) {
        console.error("Error fetching categories:", error);  // Make sure to log errors as well
        message.error("Failed to fetch categories.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);




  const getAccessToken = () => {
    const authData = JSON.parse(localStorage.getItem("auth_token"));
    if (!authData?.access_token) {
      throw new Error("Authentication tokens are missing. Please log in again.");
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
  }, [currentPage]);

  const openEditModal = (course) => {
    setEditingCourse(course);
    form.setFieldsValue(course);
    setIsModalOpen(true);
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
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
        course_category: values.course_category,
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
        setIsModalOpen(false);
        form.resetFields();
        fetchCourseDetails(currentPage);
      }
    } catch (error) {
      console.error("Error updating course:", error);
      message.error("Failed to update course");
    } finally {
      setLoading(false);
    }
  };
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
  
  // Update the status update function
  const updateCourseStatus = async (id, status) => {
    try {
      setLoading(true);
      const accessToken = getAccessToken();
  
      const response = await axios.patch(
        `http://localhost:8000/api/course/${id}/`,
        {
          form_data: JSON.stringify({
            course_status: status
          })
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
      title: "Teacher Name",
      dataIndex: "course_teacher_username",
      key: "course_teacher_username",
    },
    {
      title: "Course Category",
      dataIndex: "course_category",
      key: "course_category",
      render: (categoryId) => {
        // Find the category name based on the ID
        const category = categories.find(cat => cat.id === categoryId);
        return category ? category.name : "N/A"; // Return category name if found, else "N/A"
      },
    },
    {
      title: "Status",
      key: "course_status",
      render: (text, record) => (
        <Space>
          <Tooltip title="Change Status">
            <Dropdown overlay={menu(record)} trigger={["click"]}>
              <Button>
                {record.course_status?.charAt(0).toUpperCase() + record.course_status?.slice(1)} <DownOutlined />
              </Button>
            </Dropdown>
          </Tooltip>
        </Space>
      ),
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
              onClick={() => openEditModal(record)} 
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

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
              <Button type="primary" className="iconlink"
              //  onClick={resetFilter}
              >
                <FilterIcon />
              </Button>
            </Tooltip>
            {/* <Tooltip title="Add Student">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                // onClick={showDrawer}
              >
                Add Student
              </Button>
            </Tooltip> */}
          </Space>
        </Col>
      </Row>

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
      <Modal
        title="Edit Course"
        open={isModalOpen}
        onCancel={handleModalCancel}
        footer={null}
        centered
        width={600}
      >
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleEditSubmit}
          className="pt-4"
        >
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
            rules={[{ required: true, message: "Please enter course description" }]}
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

          <Form.Item
            label="Course Category"
            name="course_category"
            rules={[{ required: true, message: "Please select a course category" }]}
          >
            <Select
              loading={loading}
              placeholder="Select a category"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
              value={editingCourse?.course_category || undefined}
            >
              {categories.map((category) => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item className="mb-0">
            <Space>
              <Button onClick={handleModalCancel}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Update Course
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
