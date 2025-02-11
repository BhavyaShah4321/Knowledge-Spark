import {
  DownOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Breadcrumb,
  Button,
  Col,
  DatePicker,
  Drawer,
  Dropdown,
  Form,
  Input,
  Menu,
  message,
  Radio,
  Row,
  Space,
  Table,
  Tooltip,
  Upload
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ReactComponent as EditIcon } from "../../Image/EditIcon.svg";
import { ReactComponent as FilterIcon } from "../../Image/FilterIcon.svg";

function StudentList() {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingStudent, setEditingStudent] = useState(null);

  // Fetch students details from the API
  const fetchStudentDetails = async (page = 1, searchQuery = "") => {
    try {
      setLoading(true);
      const authData = JSON.parse(localStorage.getItem("auth_token"));
      if (!authData || !authData.access_token) {
        console.error(
          "Authentication tokens are missing. Please log in again."
        );
        return;
      }
      const accessToken = authData.access_token;
      const response = await axios.get(
        `http://localhost:8000/api/user/?page=${page}&search=Student&search_text=${searchQuery}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const studentDetails = response.data;
      setData(studentDetails.results.data || []);
      setTotalItems(studentDetails.count || 0);
    } catch (error) {
      console.error("Error fetching student details:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search text change
  const onSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);

    // Filter data locally
    const filteredData = data.filter(
      (item) =>
        item.username.toLowerCase().includes(value.toLowerCase()) ||
        item.email.toLowerCase().includes(value.toLowerCase())
    );

    setData(filteredData);
  };

  // Reset filter to the default
  const resetFilter = () => {
    setSearchText("");
    setCurrentPage(1);
    fetchStudentDetails(1);
  };

  // Handle row selection
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  };

  useEffect(() => {
    fetchStudentDetails(currentPage);
  }, [currentPage]);

  // Update student status (Active/Inactive)
  const updateStudentStatus = async (id, isActive) => {
    try {
      const authData = JSON.parse(localStorage.getItem("auth_token"));
      if (!authData || !authData.access_token) {
        console.error(
          "Authentication tokens are missing. Please log in again."
        );
        return;
      }


      const accessToken = authData.access_token;

      const formData = new FormData();
      const form_data = {
        is_active: isActive,
      };

      formData.append("form_data", JSON.stringify(form_data));
      const response = await axios.patch(
        `http://localhost:8000/api/user/${id}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        fetchStudentDetails(currentPage); // Refresh the student list after updating
      }
    } catch (error) {
      console.error("Error updating student status:", error);
    }
  };

  // Menu for Active/Inactive toggle
  const menu = (record) => (
    <Menu
      onClick={({ key }) => {
        const newStatus = key === "active";
        updateStudentStatus(record.id, newStatus);
      }}
    >
      <Menu.Item key="active" disabled={record.is_active}>
        Set to Active
      </Menu.Item>
      <Menu.Item key="inactive" disabled={!record.is_active}>
        Set to Inactive
      </Menu.Item>
    </Menu>
  );
  const showDrawer = () => {
    setEditingStudent(null);
    form.resetFields();
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
    form.resetFields();
    setEditingStudent(null);
  };
  const getProfilePictureUrl = (profilePicture) => {
    if (!profilePicture) return null;

    // If the URL is already absolute (starts with http or https), return as is
    if (profilePicture.startsWith("http")) {
      return profilePicture;
    }

    // Otherwise, prepend the base URL
    return `http://localhost:8000${profilePicture}`;
  };
  const handleEdit = (student) => {
    setEditingStudent(student);
    const formattedDob = student.dob ? dayjs(student.dob, "DD-MM-YYYY") : null;
    let fileList = [];
    if (student.profile_picture) {
      fileList = [{
        uid: '-1',
        name: 'Current Profile Picture',
        status: 'done',
        url: getProfilePictureUrl(student.profile_picture),
      }];
    }
    form.setFieldsValue({
      username: student.username,
      email: student.email,
      dob: formattedDob,
      bio: student.bio,
      gender: student.gender,
      profile_picture: fileList,
    });
    setOpen(true);
  };

  // Table columns configuration
  const columns = [
    {
      title: "Sr. No.",
      key: "index",
      render: (text, record, index) => (currentPage - 1) * 10 + index + 1,
    },
    {
      title: "Student Name",
      dataIndex: "username",
      key: "username",
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    {
      title: "Profile Image",
      dataIndex: "profile_picture",
      key: "profile_image",
      render: (profilePicture, record) => {
        const getInitials = (name) => {
          if (!name) return "N/A";
          return name.charAt(0).toUpperCase();
        };

        return (
          <Avatar
            size={64}
            src={profilePicture ? getProfilePictureUrl(profilePicture) : null}
            style={{
              backgroundColor: !profilePicture
                ? `#${Math.floor(Math.random() * 16777215).toString(16)}`
                : undefined,
            }}
          >
            {!profilePicture && getInitials(record.username)}
          </Avatar>
        );
      },
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
    },
    {
      title: "DOB",
      dataIndex: "dob",
      key: "dob",
      render: (dob) => {
        if (!dob) return "-";
        // Handle the date format coming from API (DD-MM-YYYY)
        const isValidDate = dayjs(dob, "DD-MM-YYYY", true).isValid();
        if (isValidDate) {
          return dayjs(dob, "DD-MM-YYYY").format("DD-MM-YYYY");
        }
        // Fallback for different date format
        return dayjs(dob).isValid() ? dayjs(dob).format("DD-MM-YYYY") : "-";
      },
    },

    {
      title: "Status",
      key: "status",
      render: (text, record) => (
        <Space>
          <Tooltip title="Change Status">
            <Dropdown overlay={menu(record)} trigger={["click"]}>
              <Button
              >
                {record.is_active ? "Active" : "Inactive"} <DownOutlined />
              </Button>
            </Dropdown>
          </Tooltip>
        </Space>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button icon={<EditOutlined />} style={{ cursor: "pointer" }} onClick={() => handleEdit(record)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    fetchStudentDetails(pagination.current);
  };
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

      const endpoint = editingStudent
        ? `http://localhost:8000/api/user/${editingStudent.id}/`
        : "http://localhost:8000/api/user/";

      const method = editingStudent ? "patch" : "post";

      // Create FormData instance
      const formData = new FormData();

      // Create the form_data object
      const form_data = {
        username: values.username,
        email: values.email,
        type: 'Student',
        gender: values.gender,
        bio: values.bio,
        dob: values.dob ? values.dob.format("DD-MM-YYYY") : undefined,
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
          `Student ${editingStudent ? "updated" : "added"} successfully`
        );
        setOpen(false);
        form.resetFields();
        setEditingStudent(null);
        fetchStudentDetails(currentPage);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error("Failed to save student details");
    }
  };

  return (
    <div>
      <Row className="pagenamerow mb-0" justify="space-between" align="middle">
        <Col>
          <h2>Students</h2>
          <div className="bredcrumbwrp">
            <Link to="/dashboard" className="back">
              BACK
            </Link>
            <Breadcrumb
              items={[
                { title: <Link to="/dashboard">Home</Link> },
                { title: "Students" },
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
              style={{ width: "100%" }}
            />
            <Tooltip placement="top" title="Reset Filter">
              <Button type="primary" className="iconlink" onClick={resetFilter}>
                <FilterIcon />
              </Button>
            </Tooltip>
            {/* <Tooltip title="Add Student">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={showDrawer}
              >
                Add Student
              </Button>
            </Tooltip> */}
          </Space>
        </Col>
      </Row>
      <Drawer
        title={editingStudent ? "Edit Student" : "Add Student"}
        onClose={onClose}
        open={open}
        width={400}
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            name="username"
            label="Enter Name"
            rules={[
              { required: true, message: "Please enter student name!" },
              {
                pattern: /^[a-zA-Z\s]+$/,
                message: "student name can only include letters and spaces!",
              },
            ]}
          >
            <Input placeholder="Enter Name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              {
                required: true,
                message: "Please enter email!",
              },
              {
                type: "email",
                message: "Please enter valid email!",
              },
            ]}
          >
            <Input placeholder="Enter Email " disabled />
          </Form.Item>
          <Form.Item
            name="gender"
            label="Gender"
            rules={[
              {
                required: true,
                message: "Please select gender!",
              },
            ]}
            initialValue="male"
          >
            <Radio.Group>
              <Space direction="horizontal">
                <Radio value="male">Male</Radio>
                <Radio value="female">Female</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          <Form.Item name="dob" label="Date of Birth">
            <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="profile_picture"
            label="Profile Picture"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e?.fileList;
            }}
          >
            <Upload
              name="profile_picture"
              listType="picture"
              beforeUpload={() => false}
              accept="image/*"
              maxCount={1}
              disabled
              defaultFileList={
                editingStudent?.profile_picture
                  ? [
                    {
                      uid: "-1",
                      name: "Current Profile Picture",
                      status: "done",
                      url: getProfilePictureUrl(
                        editingStudent.profile_picture
                      ),
                    },
                  ]
                  : []
              }
            >
              <Button icon={<UploadOutlined />} disabled>Upload Profile Picture</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={editingStudent ? <EditIcon /> : <PlusOutlined />}
            >
              {editingStudent ? "Update Student" : "Add Student"}
            </Button>
          </Form.Item>
        </Form>
      </Drawer>

      <Table
        // rowSelection={rowSelection}
        dataSource={Array.isArray(data) ? data : []}
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

export default StudentList;
