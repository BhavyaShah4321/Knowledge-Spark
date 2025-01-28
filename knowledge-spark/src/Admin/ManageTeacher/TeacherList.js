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
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { ReactComponent as FilterIcon } from "../../Image/FilterIcon.svg";
import { ReactComponent as EditIcon } from "../../Image/EditIcon.svg";

function TeacherList() {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);

  const getAccessToken = () => {
    const authData = JSON.parse(localStorage.getItem("auth_token"));
    if (!authData?.access_token) {
      throw new Error(
        "Authentication tokens are missing. Please log in again."
      );
    }
    return authData.access_token;
  };

  const fetchTeacherDetails = async (page = 1) => {
    try {
      setLoading(true);
      const accessToken = getAccessToken();

      const response = await axios.get(
        `http://localhost:8000/api/user/?page=${page}&search=Teacher`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const teacherDetails = response.data;
      setData(teacherDetails.results.data || []);
      setTotalItems(teacherDetails.count || 0);
    } catch (error) {
      console.error("Error fetching teacher details:", error);
      message.error("Failed to fetch teacher details");
    } finally {
      setLoading(false);
    }
  };

  const onSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);

    // Filter data locally
    if (value) {
      const filteredData = data.filter(
        (item) =>
          item.username.toLowerCase().includes(value.toLowerCase()) ||
          item.email.toLowerCase().includes(value.toLowerCase())
      );
      setData(filteredData);
    } else {
      fetchTeacherDetails(currentPage);
    }
  };

  const resetFilter = () => {
    setSearchText("");
    setCurrentPage(1);
    fetchTeacherDetails(1);
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    const formattedDob = teacher.dob ? dayjs(teacher.dob, "DD-MM-YYYY") : null;
    
    // Create a fileList for the profile picture if it exists
    let fileList = [];
    if (teacher.profile_picture) {
      fileList = [{
        uid: '-1',
        name: 'Current Profile Picture',
        status: 'done',
        url: getProfilePictureUrl(teacher.profile_picture),
      }];
    }
    
    form.setFieldsValue({
      username: teacher.username,
      email: teacher.email,
      dob: formattedDob,
      bio: teacher.bio,
      gender: teacher.gender,
      profile_picture: fileList,
    });
    setOpen(true);
  };

  const handleSubmit = async (values) => {
    
    
    try {
      const accessToken = getAccessToken();

      const endpoint = editingTeacher
        ? `http://localhost:8000/api/user/${editingTeacher.id}/`
        : "http://localhost:8000/api/user/";

      const method = editingTeacher ? "patch" : "post";

      // Create FormData instance
      const formData = new FormData();
     
      // Create the form_data object
      const form_data = {
        username: values.username,
        type:"Teacher",
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
          `Teacher ${editingTeacher ? "updated" : "added"} successfully`
        );
        setOpen(false);
        form.resetFields();
        setEditingTeacher(null);
        fetchTeacherDetails(currentPage);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error("Failed to save teacher details");
    }
  };
  const updateTeacherStatus = async (id, isActive) => {
    try {
      const accessToken = getAccessToken();
  
      // Create a FormData instance
      const formData = new FormData();
      const form_data = {
         is_active:isActive,
      };

      // Add form_data as a stringified JSON
      formData.append("form_data", JSON.stringify(form_data));
  
      // Send the PATCH request with FormData
      const response = await axios.patch(
        `http://localhost:8000/api/user/${id}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data", // Required for FormData
          },
        }
      );
  
      // Handle success response
      if (response.status === 200) {
        message.success("Teacher status updated successfully");
        fetchTeacherDetails(currentPage); // Refresh the teacher list
      }
    } catch (error) {
      console.error("Error updating teacher status:", error);
      message.error("Failed to update teacher status");
    }
  };
  
  

  const menu = (record) => (
    <Menu
      onClick={({ key }) => {
        const newStatus = key === "active";
        updateTeacherStatus(record.id, newStatus);
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
    setEditingTeacher(null);
    form.resetFields();
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
    // form.resetFields();
    setEditingTeacher(null);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  };

  useEffect(() => {
    fetchTeacherDetails(currentPage);
  }, [currentPage]);

  const columns = [
    {
      title: "Sr. No.",
      key: "index",
      render: (text, record, index) => (currentPage - 1) * 10 + index + 1,
    },
    {
      title: "Teacher Name",
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
      render: (gender) => (
        <span style={{ textTransform: "capitalize" }}>{gender || "N/A"}</span>
      ),
    },
    {
      title: "DOB",
      dataIndex: "dob",
      key: "dob",
      render: (dob) => {
        if (!dob) return "N/A";
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
      title: "BIO",
      dataIndex: "bio",
      key: "bio",
      render: (bio) => <span>{bio || "N/A"}</span>,
    },
    {
      title: "Status",
      key: "status",
      render: (text, record) => (
        <Space>
          <Tooltip title="Change Status">
            <Dropdown overlay={menu(record)} trigger={["click"]}>
              <Button>
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
          <Tooltip title="Edit Teacher">
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
  const getProfilePictureUrl = (profilePicture) => {
    if (!profilePicture) return null;

    // If the URL is already absolute (starts with http or https), return as is
    if (profilePicture.startsWith("http")) {
      return profilePicture;
    }

    // Otherwise, prepend the base URL
    return `http://localhost:8000${profilePicture}`;
  };

  return (
    <div>
      <Row className="pagenamerow mb-0" justify="space-between" align="middle">
        <Col>
          <h2>Teachers</h2>
          <div className="bredcrumbwrp">
            <Link to="/dashboard" className="back">
              BACK
            </Link>
            <Breadcrumb
              items={[
                { title: <Link to="/dashboard">Home</Link> },
                { title: "Teachers" },
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
              style={{ width: "200px" }}
            />
            <Tooltip placement="top" title="Reset Filter">
              <Button type="primary" className="iconlink" onClick={resetFilter}>
                <FilterIcon />
              </Button>
            </Tooltip>
            <Tooltip title="Add Teacher">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={showDrawer}
              >
                Add Teacher
              </Button>
            </Tooltip>
          </Space>
        </Col>
      </Row>

      <Drawer
        title={editingTeacher ? "Edit Teacher" : "Add Teacher"}
        onClose={onClose}
        open={open}
        width={400}
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            name="username"
            label="Enter Name"
            rules={[
              { required: true, message: "Please enter teacher name!" },
              {
                pattern: /^[a-zA-Z\s]+$/,
                message: "Teacher Name can only include letters and spaces!",
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
                message: "Please enter a valid email address!",
              },
              {
                type: "email",
                message: "Invalid email format!",
              },
            ]}
          >
            <Input placeholder="Enter Email Address" />
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
                <Radio value="other">Other</Radio>
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
              defaultFileList={
                editingTeacher?.profile_picture
                  ? [
                      {
                        uid: "-1",
                        name: "Current Profile Picture",
                        status: "done",
                        url: getProfilePictureUrl(
                          editingTeacher.profile_picture
                        ),
                      },
                    ]
                  : []
              }
            >
              <Button icon={<UploadOutlined />}>Upload Profile Picture</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="bio"
            label="Bio"
            rules={[
              {
                max: 500,
                message: "Bio cannot exceed 500 characters!",
              },
            ]}
          >
            <Input.TextArea placeholder="Enter a short bio" rows={4} />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={editingTeacher ? <EditIcon /> : <PlusOutlined />}
            >
              {editingTeacher ? "Update Teacher" : "Add Teacher"}
            </Button>
          </Form.Item>
        </Form>
      </Drawer>

      <Table
        rowSelection={rowSelection}
        dataSource={data}
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

export default TeacherList;
