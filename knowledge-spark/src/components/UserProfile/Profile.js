// import { PlusOutlined } from '@ant-design/icons';
// import { Avatar, Button, Card, Col, Divider, Form, Input, Row, Upload, message } from 'antd';
// import axios from 'axios';
// import React, { useEffect, useState } from 'react';

// const API_BASE_URL = 'http://localhost:8000';

// function Profile() {
//   const [form] = Form.useForm();
//   const [isEditing, setIsEditing] = useState(false);
//   const [isChangingPassword, setIsChangingPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [fileList, setFileList] = useState([]);
//   const [profile, setProfile] = useState({
//     username: '',
//     email: '',
//     profile_picture: '',
//     type: '',
//   });

//   const getAuthData = () => {
//     try {
//       const storedAuth = localStorage.getItem('auth_token');
//       return storedAuth ? JSON.parse(storedAuth) : null;
//     } catch (error) {
//       console.error('Error parsing auth data:', error);
//       return null;
//     }
//   };

//   const updateLocalStorage = (newData) => {
//     try {
//       const authData = getAuthData();
//       if (!authData) return;

//       const updatedAuthData = {
//         ...authData,
//         user: {
//           ...authData.user,  // Keep all existing user properties
//           ...newData,        // Override only updated fields
//         },
//       };

//       localStorage.setItem('auth_token', JSON.stringify(updatedAuthData));
//     } catch (error) {
//       console.error('Error updating localStorage:', error);
//     }
//   };

//   const handleFileChange = ({ fileList: newFileList }) => {
//     setFileList(newFileList);
//     if (newFileList.length > 0 && newFileList[0].originFileObj) {
//       const file = newFileList[0].originFileObj;
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         setProfile(prev => ({ ...prev, profile_picture: e.target.result }));
//       };
//       reader.readAsDataURL(file);
//     } else {
//       setProfile(prev => ({ ...prev, profile_picture: '' }));
//     }
//   };

//   const fetchUserProfile = async () => {
//     const authData = getAuthData();
//     if (!authData?.access_token || !authData?.user?.id) {
//       message.error('Authentication data not found');
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const response = await axios.get(`${API_BASE_URL}/api/user/${authData.user.id}/`, {
//         headers: { Authorization: `Bearer ${authData.access_token}` },
//       });

//       const data = response.data;

//       // Set initial profile data
//       setProfile({
//         username: data.username,
//         email: data.email,
//         profile_picture: data.profile_picture || '',
//         type: data.type,
//       });

//       // Set initial file list for upload component
//       if (data.profile_picture) {
//         setFileList([{
//           uid: '-1',
//           name: 'profile_image.png',
//           status: 'done',
//           url: data.profile_picture
//         }]);
//       } else {
//         setFileList([]);
//       }

//       // Update localStorage
//       updateLocalStorage(data);
//     } catch (error) {
//       message.error('Failed to fetch profile data');
//       console.error('Error fetching user data:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchUserProfile();
//   }, []); // Run once on component mount

//   const handleSave = async () => {
//     const authData = getAuthData();
//     if (!authData?.access_token || !authData?.user?.id) {
//       message.error('Authentication data not found');
//       return;
//     }

//     setIsLoading(true);
//     const formData = new FormData();

//     // Add user data
//       const userData = {
//         username: profile.username,
//         email: profile.email,
//         type: profile.type,  // Ensure the type is "Admin" if null
//       };
//     formData.append('form_data', JSON.stringify(userData));

//     // Add profile picture if changed
//     if (fileList.length > 0 && fileList[0].originFileObj) {
//       formData.append('profile_picture', fileList[0].originFileObj);
//     }

//     try {
//       const response = await axios.patch(
//         `${API_BASE_URL}/api/user/${authData.user.id}/`,
//         formData,
//         {
//           headers: {
//             Authorization: `Bearer ${authData.access_token}`,
//             'Content-Type': 'multipart/form-data',
//           },
//         }
//       );

//       if (response.status === 200) {
//         const updatedData = response.data;
//         const updatedProfile = {
//           ...profile,
//           username: updatedData.username,
//           email: updatedData.email,
//           profile_picture: updatedData.profile_picture,
//           type: updatedData.type,
//         };

//         message.success('Profile updated successfully!');
//         updateLocalStorage(updatedData);

//         setIsEditing(false);
//         await fetchUserProfile();

//         // Reload sidebar by refreshing the page (or trigger state change in sidebar)
//         window.dispatchEvent(new Event("storage"));
//       }
//     } catch (error) {
//       message.error(error.response?.data?.message || 'Failed to update profile!');
//       console.error('Error updating profile:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handlePasswordChange = async (values) => {
//     const { password, password2 } = values;
//     const authData = getAuthData();

//     if (!authData?.access_token) {
//       message.error('Authentication data not found');
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const response = await axios.post(
//         `${API_BASE_URL}/api/change-password/`,
//         { password, password2 },
//         {
//           headers: { Authorization: `Bearer ${authData.access_token}` },
//         }
//       );

//       if (response.status === 200) {
//         message.success('Password changed successfully!');
//         setIsChangingPassword(false);
//         form.resetFields(['password', 'password2']);
//       }
//     } catch (error) {
//       message.error(error.response?.data?.message || 'Failed to change password!');
//       console.error('Error changing password:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const renderProfileImage = () => (
//     <Form.Item label="Profile Image">
//       {isEditing ? (
//         <Upload
//           beforeUpload={() => false}
//           listType="picture-card"
//           accept=".jpeg,.jpg,.png"
//           maxCount={1}
//           onChange={handleFileChange}
//           fileList={fileList}
//           className="flex justify-center"
//         >
//           {fileList.length < 1 && (
//             <div>
//               <PlusOutlined />
//               <div className="mt-2">Upload</div>
//             </div>
//           )}
//         </Upload>
//       ) : (
//         <Avatar
//           size={160}
//           src={profile.profile_picture || 'https://via.placeholder.com/160'}
//           className="shadow-sm"
//         />
//       )}
//     </Form.Item>
//   );

//   const renderProfileFields = () => (
//     <Row gutter={[16, 24]}>
//       <Col xs={24}>
//         <Form.Item
//           label="Username"
//           rules={[{ required: true, message: 'Username is required!' }]}
//         >
//           {isEditing ? (
//             <Input
//               value={profile.username}
//               onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
//               className="h-10"
//             />
//           ) : (
//             <div className="p-3 bg-gray-50 rounded-md">{profile.username || '-'}</div>
//           )}
//         </Form.Item>
//       </Col>
//       <Col xs={24}>
//         <Form.Item
//           label="Email"
//           rules={[
//             { required: true, message: 'Email is required!' },
//             { type: 'email', message: 'Please enter a valid email!' }
//           ]}
//         >
//           {isEditing ? (
//             <Input
//               value={profile.email}
//               onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
//               className="h-10"
//             />
//           ) : (
//             <div className="p-3 bg-gray-50 rounded-md">{profile.email || '-'}</div>
//           )}
//         </Form.Item>
//       </Col>
//     </Row>
//   );

//   return (
//     <div className="p-6">
//       <Card className="max-w-4xl mx-auto shadow-md">
//         <Row justify="space-between" align="middle" className="mb-6">
//           <Col>
//             <h2 className="text-2xl font-semibold m-0">My Profile</h2>
//           </Col>
//           <Col>
//             <Button
//               type="primary"
//               onClick={isEditing ? handleSave : () => setIsEditing(true)}
//               loading={isLoading}
//             >
//               {isEditing ? 'Save Changes' : 'Edit Profile'}
//             </Button>
//           </Col>
//         </Row>

//         <Form
//           layout="vertical"
//           form={form}
//           autoComplete="off"
//           onFinish={handlePasswordChange}
//         >
//           <Row gutter={32}>
//             <Col xs={24} md={8}>
//               <div className="text-center">
//                 {renderProfileImage()}
//               </div>
//             </Col>
//             <Col xs={24} md={16}>
//               {renderProfileFields()}
//             </Col>
//           </Row>

//           <Divider />

//           {isChangingPassword ? (
//             <Row justify="center">
//               <Col xs={24} md={16}>
//                 <Card className="shadow-sm">
//                   <h3 className="text-lg font-medium mb-4">Change Password</h3>
//                   <Form.Item
//                     label="New Password"
//                     name="password"
//                     rules={[
//                       { required: true, message: 'Please enter your new password!' },
//                       { min: 8, message: 'Password must be at least 8 characters!' }
//                     ]}
//                   >
//                     <Input.Password className="h-10" />
//                   </Form.Item>
//                   <Form.Item
//                     label="Confirm Password"
//                     name="password2"
//                     rules={[
//                       { required: true, message: 'Please confirm your new password!' },
//                       ({ getFieldValue }) => ({
//                         validator(_, value) {
//                           if (!value || getFieldValue('password') === value) {
//                             return Promise.resolve();
//                           }
//                           return Promise.reject(new Error('Passwords do not match!'));
//                         },
//                       }),
//                     ]}
//                   >
//                     <Input.Password className="h-10" />
//                   </Form.Item>
//                   <Row gutter={16}>
//                     <Col span={12}>
//                       <Button type="primary" htmlType="submit" loading={isLoading} block>
//                         Update Password
//                       </Button>
//                     </Col>
//                     <Col span={12}>
//                       <Button
//                         block
//                         onClick={() => {
//                           setIsChangingPassword(false);
//                           form.resetFields(['password', 'password2']);
//                         }}
//                       >
//                         Cancel
//                       </Button>
//                     </Col>
//                   </Row>
//                 </Card>
//               </Col>
//             </Row>
//           ) : (
//             <Row justify="center">
//               <Button type="default" onClick={() => setIsChangingPassword(true)}>
//                 Change Password
//               </Button>
//             </Row>
//           )}
//         </Form>
//       </Card>
//     </div>
//   );
// }

// export default Profile;

import { PlusOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Col, Divider, Form, Input, Row, Upload, message } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

const API_BASE_URL = 'http://localhost:8000';

function Profile() {
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [profile, setProfile] = useState(null);

  const authData = JSON.parse(localStorage.getItem("auth_token"));
  const accessToken = authData?.access_token;
  const userId = authData?.user?.id;

  useEffect(() => {
    if (!accessToken || !userId) {
      message.error("Unauthorized. Please log in again.");
      return;
    }
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/user/${userId}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const userData = response.data;
      if (userData.dob) {
        userData.dob = dayjs(userData.dob);
      }

      setProfile(userData);
      form.setFieldsValue(userData);

      if (userData.profile_picture) {
        setFileList([{
          uid: '-1',
          name: 'profile_image.png',
          status: 'done',
          url: userData.profile_picture
        }]);
      }
    } catch (error) {
      message.error('Failed to fetch profile data');
    }
  };

  const handleSaveChanges = async () => {
    if (!profile) return;

    try {
      const formData = new FormData();

      // Prepare JSON object
      const form_data = {
        username: profile.username || "",
        email: profile.email || "",
        dob: profile.dob ? dayjs(profile.dob).format("YYYY-MM-DD") : null, // Ensure correct format
      };

      // Convert to JSON string and append
      formData.append("form_data", new Blob([JSON.stringify(form_data)], { type: "application/json" }));

      // Append profile picture if updated
      if (fileList.length > 0 && fileList[0]?.originFileObj) {
        formData.append("profile_picture", fileList[0].originFileObj);
      }

      // Get authentication token
      const authData = JSON.parse(localStorage.getItem("auth_token"));
      const accessToken = authData?.access_token;

      if (!accessToken) {
        message.error("Unauthorized. Please log in again.");
        return;
      }

      // Send PATCH request with FormData
      const response = await axios.patch(`${API_BASE_URL}/api/user/${userId}/`, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 200) {
        message.success("Profile updated successfully");
        setIsEditing(false);
        fetchUserProfile();
      }
    } catch (error) {
      console.error("Profile update error:", error);
      message.error("Failed to update profile");
    }
  };




  return (
    <div className="p-6">
      <Card className="max-w-4xl mx-auto shadow-md">
        <Row justify="space-between" align="middle" className="mb-6">
          <Col><h2 className="text-2xl font-semibold">My Profile</h2></Col>
          <Col>
            {isEditing ? (
              <Button type="primary" onClick={handleSaveChanges}>Save Changes</Button>
            ) : (
              <Button type="primary" onClick={() => setIsEditing(true)}>Edit Profile</Button>
            )}
          </Col>
        </Row>

        {profile && (
          <Form
            layout="vertical"
            form={form}
            autoComplete="off"
            initialValues={profile}
          >
            <Row gutter={32}>
              <Col xs={24} md={8} className="text-center">
                <Form.Item name="profile_picture" label="Profile Picture">
                  {!isEditing ? (
                    <Avatar size={160} src={profile.profile_picture || 'https://via.placeholder.com/160'} className="shadow-sm" />
                  ) : (
                    <Upload
                      beforeUpload={() => false}
                      listType="picture-card"
                      accept=".jpeg,.jpg,.png"
                      maxCount={1}
                      onChange={({ fileList }) => setFileList(fileList)}
                      fileList={fileList}
                      showUploadList={{
                        showPreviewIcon: false,
                        showRemoveIcon: true,
                      }}
                    >
                      {fileList.length < 1 && (
                        <div>
                          <PlusOutlined />
                          <div style={{ marginTop: 8 }}>Upload</div>
                        </div>
                      )}
                    </Upload>
                  )}
                </Form.Item>
              </Col>
              <Col xs={24} md={16}>
                <Form.Item name="username" label="Username">
                  <Input disabled={!isEditing} />
                </Form.Item>
                <Form.Item name="email" label="Email">
                  <Input disabled={!isEditing} />
                </Form.Item>
              </Col>
            </Row>
            <Divider />
            <Row justify="center">
              <Button type="default" onClick={() => message.info('Change Password Clicked')} disabled={!isEditing}>
                Change Password
              </Button>
            </Row>
          </Form>
        )}
      </Card>
    </div>
  );
}

export default Profile;