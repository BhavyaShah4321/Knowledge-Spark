import { PlusOutlined } from '@ant-design/icons';
import { Avatar, Breadcrumb, Button, Col, Form, Input, Row, Upload, message } from 'antd';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Profile() {
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [authData, setAuthData] = useState(null);
  const [profile, setProfile] = useState({
    id: '',
    username: '',
    email: '',
    profileImage: '',
    createdAt: '',
    type: '',
    userType: '',
  });

  // Load auth data and populate the profile
  useEffect(() => {
    const storedAuth = localStorage.getItem('auth_token'); // Get data from localStorage
    if (storedAuth) {
      const parsedAuth = JSON.parse(storedAuth); // Parse JSON only once
      setAuthData(parsedAuth);

      const { user } = parsedAuth;
      if (user) {
        // Ensure the profile image URL is complete
        const profileImage = user.profile_picture
          ? user.profile_picture.startsWith('http')
            ? user.profile_picture
            : `http://localhost:8000${user.profile_picture}`
          : '';

        setProfile({
          id: user.id,
          username: user.username || '',
          email: user.email || '',
          profileImage,
          createdAt: user.created_at || '',
          type: user.type || '',
          userType: user.user_type || '',
        });
      }
    } else {
      console.warn('No auth data found in localStorage.');
    }
  }, []);

  // Toggle editing mode and initialize fileList with the current profile image
  const toggleEditing = () => {
    if (!isEditing && profile.profileImage) {
      setFileList([
        {
          uid: '-1',
          name: 'profile_image.png',
          status: 'done',
          url: profile.profileImage,
        },
      ]);
    }
    setIsEditing(!isEditing);
  };

  // Handle file upload and preview
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

  // Save profile changes (including text and image)
  const handleSave = async () => {
    const headers = {
      Authorization: `Bearer ${authData?.access_token}`,
    };

    // Create FormData to send profile data and image
    const formData = new FormData();
    formData.append('email', profile.email);
    formData.append('username', profile.username);

    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append('profile_image', fileList[0].originFileObj);
    }

    try {
      // Update the profile via API
      const response = await axios.put(`http://localhost:8000/api/user/${profile.id}/`, formData, { headers });
      message.success('Profile updated successfully!');

      // Fetch the updated user data to ensure consistency
      const updatedUser = response.data;

      // Update localStorage with the latest data
      const updatedAuthData = {
        ...authData,
        user: {
          ...authData.user,
          ...updatedUser, // Merge updated user details
        },
      };
      localStorage.setItem('auth_token', JSON.stringify(updatedAuthData));

      // Update profile state with the latest data
      setProfile((prevProfile) => ({
        ...prevProfile,
        username: updatedUser.username || prevProfile.username,
        email: updatedUser.email || prevProfile.email,
        profileImage: updatedUser.profile_picture
          ? updatedUser.profile_picture.startsWith('http')
            ? updatedUser.profile_picture
            : `http://localhost:8000${updatedUser.profile_picture}`
          : prevProfile.profileImage,
      }));

      setIsEditing(false); // Exit editing mode
    } catch (error) {
      message.error('Failed to update profile!');
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div>
      <Row className="pagenamerow mb-0" justify="space-between" align="middle">
        <Col>
          <h2>My Profile</h2>
          <div className="bredcrumbwrp">
            <Link to="/dashboard" className="back">
              BACK
            </Link>
            <Breadcrumb
              items={[
                { title: <Link to="/dashboard">Home</Link> },
                { title: 'My Profile' },
              ]}
            />
          </div>
        </Col>
      </Row>
      <div>
        <Form layout="vertical" form={form} autoComplete="off">
          <Row gutter={16} className="prflrow">
            {/* Profile Image */}
            <Col xs={24} md={6} className="profileimg">
              <Form.Item label="Profile Image" name="profile_image" style={{ margin: '0' }}>
                {isEditing ? (
                  <Upload
                    beforeUpload={() => false}
                    listType="picture-card"
                    accept=".jpeg,.jpg,.png"
                    maxCount={1}
                    onChange={handleFileChange}
                    fileList={fileList}
                    showUploadList={{ showRemoveIcon: isEditing }}
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

            {/* Profile Details */}
            <Col xs={24} md={18}>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={24}>
                  <Form.Item label="Username">
                    {isEditing ? (
                      <Input
                        value={profile.username}
                        onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                      />
                    ) : (
                      <span>{profile.username || '-'}</span>
                    )}
                  </Form.Item>
                </Col>
                <Col xs={24} md={24}>
                  <Form.Item label="Email">
                    {isEditing ? (
                      <Input
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
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
        </Form>
      </div>
    </div>
  );
}

export default Profile;
