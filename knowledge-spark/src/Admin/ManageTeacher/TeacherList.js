import {
  DownOutlined,
  EditOutlined,
  FilePdfOutlined,
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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import moment from 'moment';

import { ReactComponent as FilterIcon } from "../../Image/FilterIcon.svg";
import EditTeacherModal from "./EditTeacherModal";

function TeacherList() {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);
  const handleEdit = (record) => {
    setSelectedTeacherId(record.id);
    setIsModalVisible(true);
  };

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

      const response = await axios.get(`http://localhost:8000/api/user/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          search: `Teacher ${query}`.trim(), // Remove extra spaces
          page: page,
          page_size: pageSize,
        }
      });

      const teacherDetails = response.data;
      console.log("Filtered teacherDetails:", teacherDetails);

      setData(teacherDetails.results?.data || []);
      setPageSize(teacherDetails.results.page_size || 10);
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

        <Space>
          <Tooltip title="Edit">
            {/* <Link to={`/edit-teacher/${record.id}`}> */}
            <Button icon={<EditOutlined />} style={{ cursor: "pointer" }} onClick={() => handleEdit(record)} />
            {/* </Link> */}
          </Tooltip>
        </Space>
      ),
    },
  ];


  const getBase64ImageFromUrl = async (url) => {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  };

  const handlePdfDownload = async (teacherList = [], columns = []) => {
    if (!Array.isArray(columns)) {
      console.error("Error: columns is not an array", columns);
      return;
    }
    const pdf = new jsPDF();
    pdf.setFontSize(18);
    pdf.text("Teacher List", 14, 20);

    const pdfColumns = [
      { title: "ID", dataKey: "id" },
      { title: "Name", dataKey: "name" },
      { title: "Email", dataKey: "email" },
      { title: "Mobile Number", dataKey: "mobile_number" },
      { title: "Profile Picture", dataKey: "profile_picture" },
      { title: "Certificates", dataKey: "certificates" },
    ];

    const filteredColumns = pdfColumns.filter((col) => columns?.includes(col.title)); // Safe check

    const data = await Promise.all(
      teacherList.map(async (item, index) => {
        const row = {
          id: index + 1,
          name: item.name,
          email: item.email,
          mobile_number: item.mobile_number,
          profile_picture: item.profile_picture ? "Available" : "N/A",
          certificates: item.certificates?.length ? "Available" : "N/A",
        };

        if (columns.includes("Profile Picture") && item.profile_picture) {
          const base64Image = await getBase64ImageFromUrl(`http://localhost:8000${item.profile_picture}`);
          pdf.addImage(base64Image, "JPEG", 160, 20 + index * 10, 20, 20);
        }
        return row;
      })
    );

    pdf.autoTable({
      columns: filteredColumns,
      body: data,
      startY: 30,
      theme: "grid",
      didDrawPage: (data) => {
        const pageCount = pdf.internal.getNumberOfPages();
        pdf.setFontSize(10);
        pdf.text(`Page ${pageCount}`, pdf.internal.pageSize.width - 50, pdf.internal.pageSize.height - 10);
      },
    });

    const date = moment().format("YYYY-MM-DD");
    pdf.save(`Teacher_List_${date}.pdf`);
  };



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
                onPressEnter={() => fetchTeacherDetails(1, searchText)} // Fetch results when pressing Enter
              />
              <Tooltip placement="top" title="Reset Filter">
                <Button type="primary" className="iconlink" onClick={resetFilter}>
                  <FilterIcon />
                </Button>
              </Tooltip>
              <Tooltip placement="top" title={'Export PDF'}>
                <Button
                  type="primary"
                  className='iconlink'
                  onClick={() => handlePdfDownload(data, columns.map(col => col.title))} // Pass the correct parameters
                >
                  <FilePdfOutlined />
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
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          current: currentPage,
          total: totalItems,
          showTotal: (total) => `Total ${total} items`,
        }}
        onChange={(pagination) => setCurrentPage(pagination.current)}
      />

      <EditTeacherModal
        visible={isModalVisible}
        teacherId={selectedTeacherId}
        onClose={() => setIsModalVisible(false)}
        onSuccess={() => {
          // Refresh your teacher list or perform other updates
        }}
      />
    </div>
  );
}

export default TeacherList;
