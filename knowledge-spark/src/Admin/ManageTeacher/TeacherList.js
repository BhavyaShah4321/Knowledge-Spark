import {
  DownOutlined,
  EditOutlined,
  SearchOutlined
} from "@ant-design/icons";
import {
  Avatar,
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
} from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { ReactComponent as FilterIcon } from "../../Image/FilterIcon.svg";

function TeacherList() {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

  const getAccessToken = () => {
    const authData = JSON.parse(localStorage.getItem("auth_token") || "{}");
    if (!authData?.access_token) {
      throw new Error("Authentication tokens are missing. Please log in again.");
    }
    return authData.access_token;
  };

  const fetchTeacherDetails = async (page = 1, query = "") => {
    try {
      setLoading(true);
      const accessToken = getAccessToken();
      const response = await axios.get(
        `http://localhost:8000/api/user/?page=${page}&search=Teacher ${query}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const teacherDetails = response.data;
      setData(teacherDetails.results?.data || []);
      setTotalItems(teacherDetails.count || 0);
    } catch (error) {
      console.error("Error fetching teacher details:", error);
      message.error("Failed to fetch teacher details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherDetails(currentPage, searchText);
  }, [currentPage, searchText]);

  const updateTeacherStatus = async (id, isActive) => {
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
        fetchTeacherDetails(currentPage); // Refresh the student list after updating
      }
    } catch (error) {
      console.error("Error updating student status:", error);
    }
  };

  const menu = (record) => (
    <Menu onClick={({ key }) => updateTeacherStatus(record.id, key === "active")}>
      <Menu.Item key="active" disabled={record.is_active}>
        Set to Active
      </Menu.Item>
      <Menu.Item key="inactive" disabled={!record.is_active}>
        Set to Inactive
      </Menu.Item>
    </Menu>
  );

  const getProfilePictureUrl = (profilePicture) => {
    if (!profilePicture) return null;
    return profilePicture.startsWith("http") ? profilePicture : `http://localhost:8000${profilePicture}`;
  };

  const getCertificateUrl = (certificate) => {
    if (!certificate) return "No Certificate";
    return (
      <a href={`http://localhost:8000${certificate}`} target="_blank" rel="noopener noreferrer">
        View Certificate
      </a>
    );
  };

  const resetFilter = () => {
    setSearchText("");
    setCurrentPage(1);
    fetchTeacherDetails(1);
  };

  const columns = [
    {
      title: "Sr. No.",
      key: "index",
      render: (_, __, index) => (currentPage - 1) * 10 + index + 1,
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
      render: (profilePicture, record) => (
        <Avatar size={64} src={getProfilePictureUrl(profilePicture)}>
          {!profilePicture && record.username.charAt(0).toUpperCase()}
        </Avatar>
      ),
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
      render: (gender) => <span style={{ textTransform: "capitalize" }}>{gender || "N/A"}</span>,
    },
    {
      title: "Bio",
      dataIndex: "bio",
      key: "bio",
      render: (bio) => bio || "N/A",
    },
    {
      title: "Certificate",
      key: "certificate",
      render: (record) => {
        return record.user_degree_certificate ? (
          <a
            href={`http://localhost:8000${record.user_degree_certificate}`}
            target="_blank"
          // rel="noopener noreferrer"
          >
            View Certificate
          </a>
        ) : (
          "No Certificate"
        );
      },
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => (
        <Space>
          <Tooltip title="Change Status">
            <Dropdown overlay={menu(record)} trigger={["click"]}>
              <Button>{record.is_active ? "Active" : "Inactive"} <DownOutlined /></Button>
            </Dropdown>
          </Tooltip>
        </Space>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (record) => (
        // <Space>
        //   <Tooltip title="Edit Teacher">
        //     <Link to={`/edit-teacher/${record.id}`}>
        //       <Button type="link">
        //         <EditIcon />
        //       </Button>
        //     </Link>
        //   </Tooltip>

        // </Space>
        <Space>
          <Tooltip title="Edit">
            <Link to={`/edit-teacher/${record.id}`}>
              <Button icon={<EditOutlined />} style={{ cursor: "pointer" }} />
            </Link>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row className="pagenamerow mb-0" justify="space-between" align="middle">
        <Col>
          <h2>Teachers</h2>
          <Breadcrumb
            items={[
              { title: <Link to="/dashboard">Home</Link> },
              { title: "Teachers" },
            ]}
          />
        </Col>
        <Row>
          <Col>
            <Space size="small">
            <Input
              placeholder="Search"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
        
          
            <Tooltip placement="top" title="Reset Filter">
              <Button type="primary" className="iconlink" onClick={resetFilter}>
                <FilterIcon />
              </Button>
            </Tooltip>
            </Space>
          </Col>
          {/* <Col>
            <Tooltip title="Add Teacher">
              <Link to="/create-teacher">
                <Button type="primary" icon={<PlusOutlined />}>
                  Add Teacher
                </Button>
              </Link>
            </Tooltip>
          </Col> */}
        </Row>
      </Row>
      <Table
        // rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{ current: currentPage, total: totalItems }}
        onChange={(pagination) => setCurrentPage(pagination.current)}
      />
    </div>
  );
}

export default TeacherList;
