import {
    DownOutlined,
    PlusOutlined,
    SearchOutlined,
    UploadOutlined,
  } from "@ant-design/icons";
  import {
    Avatar,
    Breadcrumb,
    Button,
    Col,
    Drawer,
    Dropdown,
    Input,
    Menu,
    Row,
    Space,
    Table,
    Tooltip,
    Form,
    Select,
    Upload,
    Switch,
    DatePicker,
    message,
    Radio,
  } from "antd";
  import axios from "axios";
  import React, { useEffect, useState } from "react";
  import { Link, useNavigate } from "react-router-dom";
  import dayjs from "dayjs";
  import { ReactComponent as FilterIcon } from "../../Image/FilterIcon.svg";
  import { ReactComponent as EditIcon } from "../../Image/EditIcon.svg";
import { Option } from "antd/es/mentions";
  

export default function Courses() {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(false);
    const [courseData, setCourseData] = useState([]);
    const [form] = Form.useForm();
    const [open, setOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const navigate = useNavigate()

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
        const fetchCourseDetails = async (page = 1) => {
            try {
                setLoading(true);
                const authData = JSON.parse(localStorage.getItem('auth_token'));
                if (!authData || !authData.access_token) {
                    console.error('Authentication tokens are missing. Please log in again.');
                    return;
                }
                const accessToken = authData.access_token;
                const response = await axios.get(`http://localhost:8000/api/course/`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                const CourseDetails = response.data;
                setCourseData(CourseDetails.results.data || []);
                setTotalItems(CourseDetails.count || 0);
            } catch (error) {
                console.error('Error fetching course details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourseDetails();
    }, []);

    const onSearchChange = (e) => {
        const value = e.target.value;
        setSearchText(value);
    };

    const resetFilter = () => {
        setSearchText('');
        setCurrentPage(1);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: (keys) => setSelectedRowKeys(keys),
    };

    const handleCourseClick = (course) => {
        // Navigate to the course detail page, passing the course ID as a parameter
        navigate(`/cource-details/${course.id}`);
    };

    const columns = [
        {
            title: 'Sr. No.',
            key: 'index',
            render: (text, record, index) => (currentPage - 1) * 10 + index + 1,
        },
        {
            title: 'Course Title',
            dataIndex: 'course_title',
            key: 'course_title',
            render: (text, record) => (
                <a onClick={() => handleCourseClick(record)} style={{ color: '#1890ff', cursor: 'pointer' }}>
                    {text}
                </a>
            ),
        },
        {
            title: 'Course Description',
            dataIndex: 'course_description',
            key: 'course_description',
        },
        {
            title: 'Teacher Name',
            dataIndex: 'course_teacher',
            key: 'course_teacher',
        },
        {
            title: 'Status',
            dataIndex: 'course_status',
            key: 'course_status',
        },
         {
              title: "Action",
              key: "action",
              render: (text, record) => (
                <Space>
                  <Tooltip title="Edit Course">
                    <Button type="link" onClick={() => handleEdit(record)}>
                      <EditIcon />
                    </Button>
                  </Tooltip>
                </Space>
              ),
            },
    ];

    const handleTableChange = (pagination) => {
        setCurrentPage(pagination.current);
    };
    const handleEdit = (course) => {
        setEditingCourse(course);
        form.setFieldsValue({
          course_title: course.course_title,
          course_description: course.course_description,
                 });
        setOpen(true);
      };
    const showDrawer = () => {
        setEditingCourse(null);
        form.resetFields();
        setOpen(true);
      };
    
      const onClose = () => {
        setOpen(false);
        form.resetFields();
        setEditingCourse(null);
      };
      const handleSubmit = async (values) => {
    
        values.username= values.username;
        values.email= values.email;
        try {
          const accessToken = getAccessToken();
    
          const endpoint = editingCourse
            ? `http://localhost:8000/api/user/${editingCourse.id}/`
            : "http://localhost:8000/api/user/";
    
          const method = editingCourse ? "patch" : "post";
    
          // Create FormData instance
          const formData = new FormData();
         
          // Create the form_data object
          const form_data = {
            username: values.username,
            email: values.email,
            bio: values.bio,
            dob: dayjs(values.dob).format("DD-MM-YYYY"),
            gender: values.gender,
          };
    
          // Add form_data as a stringified JSON
          formData.append("form_data", JSON.stringify(form_data));
    
          // Add profile picture if it exists
          if (values.profile_picture?.[0]?.originFileObj) {
            formData.append(
              "profile_picture",
              values.profile_picture[0].originFileObj
            );
          }
    
         
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
              `Teacher ${editingCourse ? "updated" : "added"} successfully`
            );
            setOpen(false);
            form.resetFields();
            setEditingCourse(null);
            // fetchTeacherDetails(currentPage);
          }
        } catch (error) {
          console.error("Error submitting form:", error);
          message.error("Failed to save teacher details");
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
                                { title: 'Courses' },
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
                            onChange={onSearchChange}
                            style={{ width: '100%' }}
                        />
                        <Tooltip placement="top" title="Reset Filter">
                            <Button type="primary" className="iconlink" onClick={resetFilter}>
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
                message: "course name can only include letters and spaces!",
              },
            ]}
          >
            <Input placeholder="Enter Course Title" />
          </Form.Item>

          <Form.Item
            name="course_description"
            label="Course Description"
            rules={[
                { required: true, message: "Please enter course description!" },
                {
                  pattern: /^[a-zA-Z\s]+$/,
                  message: "course description  can only include letters and spaces!",
                },
              ]}
           
          >
            <Input placeholder="Enter Course Description " />
          </Form.Item>
          <Form.Item
            name="username"
            label="Select Teacher"
            rules={[
                { required: true, message: "Please select teacher!" },
                
              ]}
           
          >
            <Select placeholder="Select Teacher">
                <Option value="a">Option a</Option>
                <Option value="b">Option b</Option>
                <Option value="c">Option c</Option>
            </Select>
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
                rowSelection={rowSelection}
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
                onChange={handleTableChange}
                scroll={{
                    x: 1500,
                }}
            />
        </div>
    );
}
