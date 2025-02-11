import { CheckCircleOutlined, ClockCircleOutlined, DeleteOutlined, FormOutlined, LoadingOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, message, Popconfirm, Row, Select, Space, Tag, Timeline, Typography } from 'antd';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

const CreateComplaint = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [fetchingComplaints, setFetchingComplaints] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const authData = JSON.parse(localStorage.getItem("auth_token"));
    if (authData?.user) {
      setCurrentUser(authData.user);
    }
    fetchUserComplaints();
  }, []);

  const getAccessToken = () => {
    const authData = JSON.parse(localStorage.getItem("auth_token"));
    if (!authData?.access_token) {
      throw new Error("Authentication tokens are missing. Please log in again.");
    }
    return authData.access_token;
  };

  const fetchUserComplaints = async () => {
    setFetchingComplaints(true);
    try {
      const accessToken = getAccessToken();
      const response = await axios.get('http://localhost:8000/api/complaint/', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setComplaints(Array.isArray(response.data.data) ? response.data.data : [response.data]);
    } catch (error) {
      message.error('Failed to fetch complaints');
    }
    setFetchingComplaints(false);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const accessToken = getAccessToken();
      const complaintData = {
        type_of_issue: "Other",
        message: values.message,
        user: currentUser.id,
        priority: values.priority
      };

      const response = await axios.post('http://localhost:8000/api/complaint/', complaintData, {
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
      });

      if (response.status === 201) {
        message.success('Complaint submitted successfully');
        form.resetFields();
        fetchUserComplaints();
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to submit complaint');
    }
    setLoading(false);
  };

  const handleDelete = async (complaintId) => {
    try {
      const accessToken = getAccessToken();
      await axios.delete(`http://localhost:8000/api/complaint/${complaintId}/`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      message.success('Complaint deleted successfully');
      fetchUserComplaints();
    } catch (error) {
      message.error('Failed to delete complaint');
    }
  };

  const renderComplaintContent = (complaint) => (
    <Card size="small" className="mb-3">
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <Space justify="space-between" style={{ width: '100%' }}>
          <Tag>{complaint.type_of_issue || 'N/A'}</Tag>
          {getStatusTag(complaint.status)}
        </Space>
        <Text><UserOutlined /> {currentUser?.name || "You"} (ID: {currentUser?.id})</Text>
        <Text type="secondary">Complaint ID: {complaint.id}</Text>
        {/* <Text type="secondary">Priority: {complaint.priority || 'N/A'}</Text> */}
        <Text type="secondary">{complaint.message || 'No message provided'}</Text>
        <Text type="secondary">Response: {complaint.admin_response || 'No response from admin'}</Text>
        <Text type="secondary">Submitted on: {complaint.created_at ? new Date(complaint.created_at).toLocaleDateString() : 'Unknown date'}</Text>
        <Popconfirm
          title="Are you sure you want to delete this complaint?"
          onConfirm={() => handleDelete(complaint.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button type="link" danger icon={<DeleteOutlined />}>Delete</Button>
        </Popconfirm>
      </Space>
    </Card>
  );

  const getStatusTag = (status) => {
    const statusConfig = {
      pending: { color: 'gold', icon: <ClockCircleOutlined /> },
      resolved: { color: 'green', icon: <CheckCircleOutlined /> },
      processing: { color: 'blue', icon: <LoadingOutlined /> }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Tag icon={config.icon} color={config.color}>{status?.toUpperCase() || 'PENDING'}</Tag>;
  };

  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} lg={12}>
        <Card title={<><FormOutlined /> Add New Complaint</>} bordered={false}>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            {/* <Form.Item name="priority" label="Priority" rules={[{ required: true, message: 'Please select priority' }]}> 
              <Select>
                <Option value="High">High</Option>
                <Option value="Medium">Medium</Option>
                <Option value="Low">Low</Option>
              </Select>
            </Form.Item> */}
            <Form.Item name="message" label="Message" rules={[{ required: true, message: 'Please enter your message' }]}> 
              <TextArea placeholder="Describe your issue in detail" rows={4} showCount maxLength={500} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>Submit Complaint</Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>

      <Col xs={24} lg={12}>
        <Card title={<><ClockCircleOutlined /> Your Complaints</>} bordered={false} loading={fetchingComplaints}>
          {complaints.length === 0 ? (
            <Text type="secondary">You haven't submitted any complaints yet.</Text>
          ) : (
            <Timeline items={complaints.map(complaint => ({
              color: complaint.status === 'resolved' ? 'green' : 'blue',
              children: renderComplaintContent(complaint)
            }))} />
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default CreateComplaint;
