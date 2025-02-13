import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  message,
  Radio,
  Row,
  Space,
  Typography,
  Upload
} from 'antd';
import { CameraOutlined, UploadOutlined, EditOutlined, SaveOutlined, LockOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import axios from 'axios';

const { Title, Text } = Typography;
const { TextArea } = Input;

function Profile() {
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [certificateList, setCertificateList] = useState([]);
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    profile_picture: '',
    dob: null,
    gender: '',
    bio: '',
    user_degree_certificate: ''
  });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = () => {
    const storedAuth = localStorage.getItem('auth_token');
    if (storedAuth) {
      const { user } = JSON.parse(storedAuth);
      if (user) {
        // Handle profile picture URL
        const profile_picture = user.profile_picture || '';

        // Handle certificate URL
        const user_degree_certificate = user.user_degree_certificate
          ? `http://localhost:8000${user.user_degree_certificate}`
          : null;

        // Create the profile object
        const profileData = {
          username: user.username || '',
          email: user.email || '',
          profile_picture,
          dob: user.dob ? dayjs(user.dob) : null,
          gender: user.gender || '',
          bio: user.bio || '',
          user_degree_certificate
        };

        // Set profile state
        setProfile(profileData);

        // Set form values
        form.setFieldsValue({
          username: user.username,
          email: user.email,
          dob: user.dob ? dayjs(user.dob) : null,
          gender: user.gender,
          bio: user.bio
        });

        // Handle profile picture file list
        if (profile_picture) {
          setFileList([{
            uid: '-1',
            name: 'profile_image.png',
            status: 'done',
            url: profile_picture
          }]);
        }

        // Handle certificate file list
        if (user_degree_certificate) {
          setCertificateList([{
            uid: '-1',
            name: 'degree_certificate.pdf',
            status: 'done',
            url: user_degree_certificate
          }]);
        }
      }
    }
  };

  // Modify handleSave to include auth token
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      
      const formDataObj = {
        ...values,
        dob: values.dob ? dayjs(values.dob).format('YYYY-MM-DD') : null
      };
      formData.append('form_data', JSON.stringify(formDataObj));

      if (fileList[0]?.originFileObj) {
        formData.append('profile_picture', fileList[0].originFileObj);
      }

      if (certificateList[0]?.originFileObj) {
        formData.append('user_degree_certificate', certificateList[0].originFileObj);
      }

      const storedAuth = localStorage.getItem('auth_token');
      if (storedAuth) {
        const { access_token, user } = JSON.parse(storedAuth);
        
        const response = await axios.patch(
          `http://localhost:8000/api/user/${user.id}/`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        if (response.status === 200) {
          message.success('Profile updated successfully!');
          setIsEditing(false);
          
          // Reload profile data after successful update
          loadProfileData();
        }
      }
    } catch (error) {
      message.error('Failed to update profile');
    }
  }

  const handlePasswordChange = async (values) => {
    try {
      // Add your password change API call here
      message.success('Password changed successfully!');
      setIsChangingPassword(false);
      form.resetFields(['password', 'confirmPassword']);
    } catch (error) {
      message.error('Failed to change password');
      console.error('Error changing password:', error);
    }
  };

  return (
    <div style={{ background: '#f0f2f5', padding: '24px', minHeight: '100vh' }}>
      <Row justify="center">
        <Col xs={24} sm={24} md={20} lg={16} xl={14}>
          <Card bordered={false} className="profile-card">
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
              <Title level={2} style={{ margin: 0 }}>Profile Settings</Title>
              <Button
                type="primary"
                icon={isEditing ? <SaveOutlined /> : <EditOutlined />}
                onClick={isEditing ? handleSave : () => setIsEditing(true)}
              >
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </Button>
            </Row>

            <Form
              form={form}
              layout="vertical"
              initialValues={profile}
              onFinish={handlePasswordChange}
            >
              {/* Profile Picture Section */}
              <Card 
                style={{ marginBottom: 24 }}
                type="inner"
                title={<Title level={4}>Profile Picture</Title>}
              >
                <Row justify="center">
                  <Col>
                    {isEditing ? (
                      <Upload
                        listType="picture-circle"
                        fileList={fileList}
                        onChange={({ fileList }) => setFileList(fileList)}
                        beforeUpload={() => false}
                        maxCount={1}
                      >
                        {fileList.length === 0 && <CameraOutlined style={{ fontSize: 24 }} />}
                      </Upload>
                    ) : (
                      <Avatar
                        src={profile.profile_picture}
                        size={120}
                        icon={<CameraOutlined />}
                      />
                    )}
                  </Col>
                </Row>
              </Card>

              {/* Basic Information Section */}
              <Card 
                style={{ marginBottom: 24 }}
                type="inner"
                title={<Title level={4}>Basic Information</Title>}
              >
                <Row gutter={[24, 24]}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Username"
                      name="username"
                      rules={[{ required: true, message: 'Username is required' }]}
                    >
                      <Input disabled={!isEditing} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Email"
                      name="email"
                      rules={[
                        { required: true, message: 'Email is required' },
                        { type: 'email', message: 'Invalid email format' }
                      ]}
                    >
                      <Input disabled={!isEditing} />
                    </Form.Item>
                  </Col>
                  
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Date of Birth"
                      name="dob"
                    >
                      <DatePicker 
                        style={{ width: '100%' }}
                        disabled={!isEditing}
                        format="DD-MM-YYYY"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Gender"
                      name="gender"
                    >
                      <Radio.Group disabled={!isEditing}>
                        <Radio value="male">Male</Radio>
                        <Radio value="female">Female</Radio>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              {/* Additional Information Section */}
              <Card 
                style={{ marginBottom: 24 }}
                type="inner"
                title={<Title level={4}>Additional Information</Title>}
              >
                <Form.Item
                  label="Bio"
                  name="bio"
                >
                  <TextArea 
                    rows={4}
                    disabled={!isEditing}
                    placeholder="Tell us about yourself..."
                  />
                </Form.Item>

                <Form.Item
                  label="Degree Certificate"
                  name="certificate"
                >
                  {isEditing ? (
                    <Upload
                      fileList={certificateList}
                      onChange={({ fileList }) => setCertificateList(fileList)}
                      beforeUpload={() => false}
                      maxCount={1}
                    >
                      <Button icon={<UploadOutlined />}>Upload Certificate</Button>
                    </Upload>
                  ) : (
                    certificateList.length > 0 && (
                      <Button 
                        type="link" 
                        href={certificateList[0].url}
                        target="_blank"
                      >
                        View Certificate
                      </Button>
                    )
                  )}
                </Form.Item>
              </Card>

              {/* Password Section */}
              <Card
                type="inner"
                title={<Title level={4}>Security Settings</Title>}
              >
                {isChangingPassword ? (
                  <Space direction="vertical" style={{ width: '100%' }} size="large">
                    <Form.Item
                      label="New Password"
                      name="password"
                      rules={[{ required: true, message: 'Please enter new password' }]}
                    >
                      <Input.Password />
                    </Form.Item>
                    <Form.Item
                      label="Confirm Password"
                      name="confirmPassword"
                      dependencies={['password']}
                      rules={[
                        { required: true, message: 'Please confirm password' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('password') === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject('Passwords do not match');
                          },
                        }),
                      ]}
                    >
                      <Input.Password />
                    </Form.Item>
                    <Space>
                      <Button type="primary" htmlType="submit">
                        Update Password
                      </Button>
                      <Button onClick={() => setIsChangingPassword(false)}>
                        Cancel
                      </Button>
                    </Space>
                  </Space>
                ) : (
                  <Button 
                    icon={<LockOutlined />}
                    onClick={() => setIsChangingPassword(true)}
                  >
                    Change Password
                  </Button>
                )}
              </Card>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Profile;