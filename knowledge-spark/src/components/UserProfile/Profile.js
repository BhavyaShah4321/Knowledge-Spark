import { PlusOutlined } from '@ant-design/icons';
import { Avatar, Button, Col, Form, Input, Row, Upload, message } from 'antd';
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
    profileImage: '',
  });

  useEffect(() => {
    const storedAuth = localStorage.getItem('auth_token');
    if (storedAuth) {
      const parsedAuth = JSON.parse(storedAuth);
      const { user, access_token } = parsedAuth;
      if (user) {
        const profileImage = user.profileImage
          ? user.profileImage.startsWith('http')
            ? user.profileImage
            : `http://localhost:8000${user.profileImage}`
          : '';
        setAuthData(parsedAuth);
        setProfile({
          username: user.username,
          email: user.email,
          profileImage: profileImage,
        });
        setFileList([
          {
            uid: '-1',
            name: 'profile_image.png',
            status: 'done',
            url: profileImage,
          },
        ]);
      }
    }
  }, []);

  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };

  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    if (newFileList.length > 0) {
      const file = newFileList[0].originFileObj;
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfile({ ...profile, profileImage: e.target.result });
      };
      reader.readAsDataURL(file);
    } else {
      setProfile({ ...profile, profileImage: '' });
    }
  };

  const handleSave = async () => {
    const headers = {
      Authorization: `Bearer ${authData?.access_token}`,
    };

    const formData = new FormData();
    formData.append('username', profile.username);
    formData.append('email', profile.email);

    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append('profile_image', fileList[0].originFileObj);
    }

    try {
      const response = await axios.put(
        `http://localhost:8000/api/user/${authData?.user.id}/`,
        formData,
        { headers }
      );

      const { success, data, message: apiMessage } = response.data;

      if (success) {
        message.success(apiMessage || 'Profile updated successfully!');
        const updatedProfileImage = data.profile_picture
          ? data.profile_picture.startsWith('http')
            ? data.profile_picture
            : `http://localhost:8000${data.profile_picture}`
          : profile.profileImage;

        setProfile({
          username: data.username || profile.username,
          email: data.email || profile.email,
          profileImage: updatedProfileImage,
        });

        const updatedAuthData = {
          ...authData,
          user: {
            ...authData.user,
            username: data.username,
            email: data.email,
            profileImage: updatedProfileImage,
          },
        };
        localStorage.setItem('auth_token', JSON.stringify(updatedAuthData));
        setAuthData(updatedAuthData);
        setIsEditing(false);
      } else {
        message.error('Failed to update profile!');
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

    const headers = {
      Authorization: `Bearer ${authData?.access_token}`,
    };

    try {
      const response = await axios.post(
        `http://localhost:8000/api/change-password/`,
        { password, password2 },
        { headers }
      );

      const { success, message: apiMessage } = response.data;

      if (success) {
        message.success(apiMessage || 'Password changed successfully!');
        setIsChangingPassword(false);
        form.resetFields(['password', 'password2']);
      } else {
        message.error(apiMessage || 'Failed to change password!');
      }
    } catch (error) {
      message.error('Failed to change password!');
      console.error('Error changing password:', error);
    }
  };

  return (
    <div>
      <Row justify="space-between" align="middle">
        <Col>
          <h2>My Profile</h2>
        </Col>
      </Row>
      <div>
        <Form
          layout="vertical"
          form={form}
          autoComplete="off"
          onFinish={handlePasswordChange}
        >
          <Row gutter={16}>
            <Col xs={24} md={6}>
              <Form.Item label="Profile Image" name="profile_image">
                {isEditing ? (
                  <Upload
                    beforeUpload={() => false}
                    listType="picture-card"
                    accept=".jpeg,.jpg,.png"
                    maxCount={1}
                    onChange={handleFileChange}
                    fileList={fileList}
                  >
                    {fileList.length < 1 && (
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Upload</div>
                      </div>
                    )}
                  </Upload>
                ) : (
                  <Avatar
                    size={128}
                    src={profile.profileImage || 'https://via.placeholder.com/128'}
                  />
                )}
              </Form.Item>
            </Col>
            <Col xs={24} md={18}>
              <Row gutter={[16, 16]}>
                <Col xs={24}>
                  <Form.Item label="Username">
                    {isEditing ? (
                      <Input
                        value={profile.username}
                        onChange={(e) =>
                          setProfile({ ...profile, username: e.target.value })
                        }
                      />
                    ) : (
                      <span>{profile.username || '-'}</span>
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
                      />
                    ) : (
                      <span>{profile.email || '-'}</span>
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row justify="end" style={{ marginTop: 16 }}>
            <Button type="primary" onClick={isEditing ? handleSave : toggleEditing}>
              {isEditing ? 'Save' : 'Edit Profile'}
            </Button>
          </Row>
          {isChangingPassword ? (
            <Row justify="center" style={{ marginTop: 24 }}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="New Password"
                  name="password"
                  rules={[{ required: true, message: 'Please enter your new password!' }]}
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item
                  label="Confirm Password"
                  name="password2"
                  rules={[{ required: true, message: 'Please confirm your new password!' }]}
                >
                  <Input.Password />
                </Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Submit
                </Button>
                <Button
                  type="default"
                  block
                  style={{ marginTop: 8 }}
                  onClick={() => {
                    setIsChangingPassword(false);
                    form.resetFields(['password', 'password2']);
                  }}
                >
                  Cancel
                </Button>
              </Col>
            </Row>
          ) : (
            <Row justify="end" style={{ marginTop: 16 }}>
              <Button
                type="default"
                onClick={() => setIsChangingPassword(true)}
              >
                Change Password
              </Button>
            </Row>
          )}
        </Form>
      </div>
    </div>
  );
}

export default Profile;
