import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from "react";
import { Row, Col, Button, Upload, Input, Breadcrumb, Form, message } from "antd";
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [btnLoading, setBtnLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [fileList, setFileList] = useState([]);

  // Parse auth data from localStorage
  const authData = JSON.parse(localStorage.getItem("auth_token") || "{}");
  const userData = authData.user || {};

  // Initialize form data state
  const [formData, setFormData] = useState({
    username: userData.username || "",
    email: userData.email || "",
    type: userData.type || ""
  });

  useEffect(() => {
    // Set initial form values
    form.setFieldsValue({
      username: userData.username || "",
      email: userData.email || ""
    });
  }, [form, userData]);

  // Handle file upload validation
  const validateFileList = () => {
    const fileType = fileList[0]?.type;
    if (fileList.length > 0 && !["image/jpeg", "image/jpg", "image/png"].includes(fileType)) {
      return Promise.reject(new Error("Only JPG, JPEG, or PNG files are allowed!"));
    }
    return Promise.resolve();
  };

  // Handle file change for profile picture
  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  // Toggle edit mode
  const toggleEdit = () => {
    setIsEditing((prev) => !prev);
  };

  // Handle form submission
  const handleFinish = async (values) => {
    setBtnLoading(true);

    // Construct form data for API payload
    const formPayload = new FormData();
    formPayload.append('username', values.username);
    formPayload.append('email', values.email);
    // formPayload.append('type', formData.type); // Assuming 'type' is not editable

    if (fileList.length > 0 && fileList[0].originFileObj) {
      formPayload.append('profile_picture', fileList[0].originFileObj);
    }

    try {
      // API call to update user profile
      const response = await axios.patch(
        `/user/${userData.id}/`, // API endpoint
        formPayload,
        {
          headers: {
            Authorization: `Bearer ${authData.token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Update localStorage with the new profile data
      const updatedAuthData = {
        ...authData,
        user: { ...authData.user, ...response.data },
      };
      localStorage.setItem('auth_token', JSON.stringify(updatedAuthData));

      // Update local state
      setFormData({
        ...formData,
        ...response.data,
      });

      message.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
      message.error('Failed to update profile. Please try again.');
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <>
      {/* Top Bar with Breadcrumb */}
      <div className="ListingTopBar">
        <div className="pagenamewrap">
          <div className="pagename">
            <h3>My Profile</h3>
            <Breadcrumb
              items={[
                { title: <Link to="/dashboard">Home</Link> },
                { title: 'My Profile' }
              ]}
            />
          </div>
        </div>
      </div>

      <section className="grid-sec FormSection myprofile marginbottom">
        <div className="FormBody">
          <Form
            layout="vertical"
            form={form}
            onFinish={handleFinish}
            autoComplete="off"
          >
            <Row gutter={16} className="prflrow">
              <Col xs={24} flex="auto" className="profileimg">
                <Form.Item
                  label="Profile Image"
                  name="profile_image"
                  rules={[{ validator: validateFileList }]}
                  style={{ margin: "0" }}
                >
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
                </Form.Item>
              </Col>

              <Col flex="auto" className="prflcont">
                <Row gutter={[15]}>
                  {isEditing ? (
                    <>
                      <Col xs={24} sm={24} md={12} lg={12}>
                        <Form.Item
                          label="Username"
                          name="username"
                          rules={[
                            { required: true, message: 'Please enter username' },
                          ]}
                        >
                          <Input placeholder="Enter Username" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={24} md={12} lg={12}>
                        <Form.Item
                          label="Email Address"
                          name="email"
                          rules={[
                            { required: true, message: 'Please enter email' },
                            { type: 'email', message: 'Please enter a valid email' }
                          ]}
                        >
                          <Input placeholder="Enter Email Address" disabled />
                        </Form.Item>
                      </Col>
                    </>
                  ) : (
                    <>
                      <Col xs={24} sm={24} md={12} lg={12}>
                        <Form.Item>
                          <label>Username</label>
                          <p>{formData.username}</p>
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={24} md={12} lg={12}>
                        <Form.Item>
                          <label>Email</label>
                          <p>{formData.email}</p>
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={24} md={12} lg={12}>
                        <Form.Item>
                          <label>User Type</label>
                          <p>{formData.type}</p>
                        </Form.Item>
                      </Col>
                    </>
                  )}
                </Row>
              </Col>
            </Row>

            <Row justify="end" gutter={16}>
              <Col>
                {isEditing ? (
                  <>
                    <Button type="default" onClick={toggleEdit}>Cancel</Button>
                    <Button type="primary" htmlType="submit" loading={btnLoading}>Save</Button>
                  </>
                ) : (
                  <Button type="primary" icon={<EditOutlined />} onClick={toggleEdit}>
                    Edit
                  </Button>
                )}
              </Col>
            </Row>
          </Form>
        </div>
      </section>
    </>
  );
};

export default Profile;
