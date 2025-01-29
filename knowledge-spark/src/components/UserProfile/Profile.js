import { PlusOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Col, Form, Input, Row, Upload, message, Divider } from 'antd';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

function Profile() {
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [authData, setAuthData] = useState(null);
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    profile_picture: '',
  });

  useEffect(() => {
    const storedAuth = localStorage.getItem('auth_token');
    if (storedAuth) {
      const parsedAuth = JSON.parse(storedAuth);
      const { user, access_token } = parsedAuth;
      if (user) {
        const profile_picture = user.profile_picture
          ? user.profile_picture.startsWith('http')
            ? user.profile_picture
            : `http://localhost:8000${user.profile_picture}`
          : '';
        setAuthData(parsedAuth);
        setProfile({
          username: user.username,
          email: user.email,
          profile_picture: profile_picture,
        });
        if (profile_picture) {
          setFileList([
            {
              uid: '-1',
              name: 'profile_image.png',
              status: 'done',
              url: profile_picture,
            },
          ]);
        }
      }
    }
  }, []);

  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    if (newFileList.length > 0) {
      const file = newFileList[0].originFileObj;
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfile({ ...profile, profile_picture: e.target.result });
      };
      reader.readAsDataURL(file);
    } else {
      setProfile({ ...profile, profile_picture: '' });
    }
  };

  const handleSave = async () => {
    const headers = {
      Authorization: `Bearer ${authData?.access_token}`,
    };

    const formData = new FormData();
    
    // Create form_data object
    const form_data = {
      username: profile.username,
      email: profile.email,
      // type: authData?.user.type || "User",
    };

    // Add form_data as stringified JSON
    formData.append("form_data", JSON.stringify(form_data));

    // Add profile picture if it exists
    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append("profile_picture", fileList[0].originFileObj);
    }

    try {
      const response = await axios.patch(
        `http://localhost:8000/api/user/${authData?.user.id}/`,
        formData,
        { headers }
      );

      if (response.status === 200) {
        message.success('Profile updated successfully!');
        const updatedprofile_picture = response.data.profile_picture
          ? response.data.profile_picture.startsWith('http')
            ? response.data.profile_picture
            : `http://localhost:8000${response.data.profile_picture}`
          : profile.profile_picture;

        const updatedProfile = {
          username: response.data.username || profile.username,
          email: response.data.email || profile.email,
          profile_picture: updatedprofile_picture,
        };

        setProfile(updatedProfile);

        const updatedAuthData = {
          ...authData,
          user: {
            ...authData.user,
            ...updatedProfile,
          },
        };
        localStorage.setItem('auth_token', JSON.stringify(updatedAuthData));
        setAuthData(updatedAuthData);
        setIsEditing(false);
      }
    } catch (error) {
      message.error('Failed to update profile!');
      console.error('Error updating profile:', error);
    }
  };

  const handlePasswordChange = async (values) => {
    const { password, password2 } = values;

    if (password !== password2) {
      message.error('Passwords do not match!');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:8000/api/change-password/',
        { password, password2 },
        { 
          headers: {
            Authorization: `Bearer ${authData?.access_token}`,
          }
        }
      );

      if (response.status === 200) {
        message.success('Password changed successfully!');
        setIsChangingPassword(false);
        form.resetFields(['password', 'password2']);
      }
    } catch (error) {
      message.error('Failed to change password!');
      console.error('Error changing password:', error);
    }
  };

  return (
    <div className="p-6">
      <Card className="max-w-4xl mx-auto shadow-md">
        <Row justify="space-between" align="middle" className="mb-6">
          <Col>
            <h2 className="text-2xl font-semibold m-0">My Profile</h2>
          </Col>
          <Col>
            <Button type="primary" onClick={isEditing ? handleSave : () => setIsEditing(true)}>
              {isEditing ? 'Save Changes' : 'Edit Profile'}
            </Button>
          </Col>
        </Row>

        <Form
          layout="vertical"
          form={form}
          autoComplete="off"
          onFinish={handlePasswordChange}
        >
          <Row gutter={32}>
            <Col xs={24} md={8}>
              <div className="text-center">
                <Form.Item label="Profile Image">
                  {isEditing ? (
                    <Upload
                      beforeUpload={() => false}
                      listType="picture-card"
                      accept=".jpeg,.jpg,.png"
                      maxCount={1}
                      onChange={handleFileChange}
                      fileList={fileList}
                      className="flex justify-center"
                    >
                      {fileList.length < 1 && (
                        <div>
                          <PlusOutlined />
                          <div className="mt-2">Upload</div>
                        </div>
                      )}
                    </Upload>
                  ) : (
                    <Avatar
                      size={160}
                      src={profile.profile_picture || 'https://via.placeholder.com/160'}
                      className="shadow-sm"
                    />
                  )}
                </Form.Item>
              </div>
            </Col>
            
            <Col xs={24} md={16}>
              <Row gutter={[16, 24]}>
                <Col xs={24}>
                  <Form.Item label="Username">
                    {isEditing ? (
                      <Input
                        value={profile.username}
                        onChange={(e) =>
                          setProfile({ ...profile, username: e.target.value })
                        }
                        className="h-10"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-md">{profile.username || '-'}</div>
                    )}
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item label="Email">
                    {isEditing ? (
                      <Input
                        value={profile.email}
                        onChange={(e) =>
                          setProfile({ ...profile, email: e.target.value })
                        }
                        className="h-10"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-md">{profile.email || '-'}</div>
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>

          <Divider />

          {isChangingPassword ? (
            <Row justify="center">
              <Col xs={24} md={16}>
                <Card className="shadow-sm">
                  <h3 className="text-lg font-medium mb-4">Change Password</h3>
                  <Form.Item
                    label="New Password"
                    name="password"
                    rules={[{ required: true, message: 'Please enter your new password!' }]}
                  >
                    <Input.Password className="h-10" />
                  </Form.Item>
                  <Form.Item
                    label="Confirm Password"
                    name="password2"
                    rules={[{ required: true, message: 'Please confirm your new password!' }]}
                  >
                    <Input.Password className="h-10" />
                  </Form.Item>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Button type="primary" htmlType="submit" block>
                        Update Password
                      </Button>
                    </Col>
                    <Col span={12}>
                      <Button
                        block
                        onClick={() => {
                          setIsChangingPassword(false);
                          form.resetFields(['password', 'password2']);
                        }}
                      >
                        Cancel
                      </Button>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          ) : (
            <Row justify="center">
              <Button type="default" onClick={() => setIsChangingPassword(true)}>
                Change Password
              </Button>
            </Row>
          )}
        </Form>
      </Card>
    </div>
  );
}

export default Profile;