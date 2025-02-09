import React, { useEffect, useState } from "react";
import axios from "axios";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import {
  Breadcrumb,
  Button,
  Col,
  Input,
  Row,
  Space,
  Table,
  Tooltip,
  message,
  Select,
  Modal,
  Form,
  Typography
} from "antd";
import { Link } from "react-router-dom";

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const ComplaintList = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [isResponseModalVisible, setIsResponseModalVisible] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [form] = Form.useForm();

  const getAccessToken = () => {
    const authData = JSON.parse(localStorage.getItem("auth_token"));
    if (!authData?.access_token) {
      throw new Error("Authentication tokens are missing. Please log in again.");
    }
    return authData.access_token;
  };

  useEffect(() => {
    fetchComplaintDetails();
  }, [currentPage]);

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      const accessToken = getAccessToken();
      const response = await axios.get(
        `http://localhost:8000/api/complaint/?page=${currentPage}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      setComplaints(response.data.data || []);
      setTotalItems(response.data.count || 0);
    } catch (error) {
      console.error("Error fetching complaints:", error);
      message.error("Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  };

  const updateComplaintStatus = async (complaintId, newStatus) => {
    try {
      setUpdatingStatus(true);
      const accessToken = getAccessToken();
      await axios.patch(
        `http://localhost:8000/api/complaint/${complaintId}/`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      message.success("Complaint status updated successfully");
      fetchComplaintDetails();
    } catch (error) {
      console.error("Error updating complaint status:", error);
      message.error("Failed to update complaint status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddResponse = async (values) => {
    try {
      const accessToken = getAccessToken();
      await axios.patch(
        `http://localhost:8000/api/complaint/${selectedComplaint.id}/`,
        { admin_response: values.response },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      message.success("Response added successfully");
      setIsResponseModalVisible(false);
      form.resetFields();
      fetchComplaintDetails();
    } catch (error) {
      console.error("Error adding response:", error);
      message.error("Failed to add response");
    }
  };

  const showResponseModal = (complaint) => {
    setSelectedComplaint(complaint);
    setIsResponseModalVisible(true);
    form.setFieldsValue({ response: complaint.admin_response || '' });
  };

  const filteredComplaints = complaints.filter((complaint) =>
    ["user_username", "message", "type_of_issue", "status"]
      .some((key) => complaint[key]?.toLowerCase().includes(searchText.toLowerCase()))
  );

  const columns = [
    {
      title: "Sr.No.",
      key: "index",
      render: (text, record, index) => (currentPage - 1) * 10 + index + 1,
    },
    { 
      title: "User", 
      dataIndex: "user_username", 
      key: "user_username" 
    },
    { 
      title: "Issue Type", 
      dataIndex: "type_of_issue", 
      key: "type_of_issue" 
    },
    { 
      title: "Message", 
      dataIndex: "message", 
      key: "message" 
    },
   
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <Select
          value={status}
          style={{ width: 130 }}
          onChange={(value) => updateComplaintStatus(record.id, value)}
          disabled={updatingStatus}
        >
          <Option value="Pending">Pending</Option>
          <Option value="In Progress">In Progress</Option>
          <Option value="Resolved">Resolved</Option>
        </Select>
      ),
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: "Admin Response",
      dataIndex: "admin_response",
      key: "admin_response",
      render: (response, record) => (
        <Space direction="vertical">
          {/* {response && <Text>{response}</Text>} */}
          <Button 
            type="primary" 
            onClick={() => showResponseModal(record)}
          >
            {response ? "Edit Response" : "Add Response"}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row className="pagenamerow mb-0" justify="space-between" align="middle">
        <Col>
          <h2>Complaints</h2>
          <div className="bredcrumbwrp">
            <Link to="/dashboard" className="back">
              BACK
            </Link>
            <Breadcrumb
              items={[
                { title: <Link to="/dashboard">Home</Link> },
                { title: "Complaints" },
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
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: "200px" }}
            />
            <Tooltip placement="top" title="Reset Filter">
              <Button 
                type="primary" 
                className="iconlink" 
                onClick={() => setSearchText("")}
              >
                <FilterOutlined />
              </Button>
            </Tooltip>
          </Space>
        </Col>
      </Row>

      <Table
        dataSource={filteredComplaints}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: 5,
          total: totalItems,
          onChange: (page) => setCurrentPage(page),
        }}
      />

      <Modal
        title="Admin Response"
        open={isResponseModalVisible}
        onCancel={() => {
          setIsResponseModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleAddResponse}
          layout="vertical"
        >
          <Form.Item
            name="response"
            label="Response"
            rules={[{ required: true, message: 'Please enter your response' }]}
          >
            <TextArea rows={4} placeholder="Enter your response to the complaint" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit Response
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ComplaintList;