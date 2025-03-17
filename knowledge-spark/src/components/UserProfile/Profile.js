// import React, { useEffect, useState } from 'react';
// import {
//   Avatar,
//   Button,
//   Card,
//   Col,
//   DatePicker,
//   Form,
//   Input,
//   message,
//   Radio,
//   Row,
//   Space,
//   Typography,
//   Upload,
// } from 'antd';
// import { CameraOutlined, UploadOutlined, EditOutlined, SaveOutlined, LockOutlined } from '@ant-design/icons';
// import dayjs from 'dayjs';
// import axios from 'axios';

// const { Title } = Typography;
// const { TextArea } = Input;

// function Profile() {
//   const [form] = Form.useForm();
//   const [isEditing, setIsEditing] = useState(false);
//   const [isChangingPassword, setIsChangingPassword] = useState(false);
//   const [fileList, setFileList] = useState([]);
//   const [certificateList, setCertificateList] = useState([]);
//   const [userId, setUserId] = useState(null);
//   const [profile, setProfile] = useState({
//     username: '',
//     email: '',
//     profile_picture: '',
//     dob: null,
//     gender: '',
//     bio: '',
//     user_degree_certificate: '',
//   });

//   const getAccessToken = () => {
//     const authData = JSON.parse(localStorage.getItem("auth_token"));
//     if (!authData?.access_token) {
//       throw new Error(
//         "Authentication tokens are missing. Please log in again."
//       );
//     }
//     return authData.access_token;
//   };

//   useEffect(() => {
//     const authData = JSON.parse(localStorage.getItem("auth_token"));
//     if (authData?.user?.id) {
//       setUserId(authData.user.id);
//     }
//   }, []);

//   useEffect(() => {
//     if (userId) {
//       loadProfileData();
//     }
//   }, [userId]);
//   // Fetch user profile data from the API
//   const loadProfileData = async () => {

//     try {
//       const accessToken = getAccessToken();

//       const response = await axios.get(
//         `http://localhost:8000/api/user/${userId}/`,
//         {
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//           },
//         }
//       );
//       console.log("newres", response);

//       const userData = response.data;

//       // Handle profile picture URL
//       const profile_picture = userData.profile_picture || '';

//       // Handle certificate URL
//       const user_degree_certificate = userData.user_degree_certificate
//         ? `http://localhost:8000${userData.user_degree_certificate}`
//         : null;

//       // Create the profile object
//       const profileData = {
//         username: userData.username || '',
//         email: userData.email || '',
//         profile_picture,
//         dob: dayjs(userData.dob).format('DD-MM-YYYY') || "N/A",
//         gender: userData.gender || '',
//         bio: userData.bio || '',
//         user_degree_certificate,
//       };

//       // Set profile state
//       setProfile(profileData);

//       // Set form values
//       form.setFieldsValue({
//         username: userData.username,
//         email: userData.email,
//         dob: userData.dob ? dayjs(userData.dob) : null,
//         gender: userData.gender,
//         bio: userData.bio,
//       });

//       // Handle profile picture file list
//       if (profile_picture) {
//         setFileList([{
//           uid: '-1',
//           name: 'profile_image.png',
//           status: 'done',
//           url: profile_picture,
//         }]);
//       }

//       // Handle certificate file list
//       if (user_degree_certificate) {
//         setCertificateList([{
//           uid: '-1',
//           name: 'degree_certificate.pdf',
//           status: 'done',
//           url: user_degree_certificate,
//         }]);
//       }
//     } catch (error) {
//       message.error('Failed to load profile data');
//       console.error('Error loading profile data:', error);
//     }
//   };

//   // Save updated profile data using the API
//   const handleSave = async () => {
//     try {
//       const values = await form.validateFields();
//       const formData = new FormData();

//       const formDataObj = {
//         ...values,
//         dob: values.dob ? dayjs(values.dob).format('YYYY-MM-DD') : null,
//       };
//       formData.append('form_data', JSON.stringify(formDataObj));

//       if (fileList[0]?.originFileObj) {
//         formData.append('profile_picture', fileList[0].originFileObj);
//       }

//       if (certificateList[0]?.originFileObj) {
//         formData.append('user_degree_certificate', certificateList[0].originFileObj);
//       }

//       const accessToken = getAccessToken();

//       const response = await axios.patch(
//         `http://localhost:8000/api/user/${userId}/`,
//         formData,
//         {
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//           },
//         }
//       );

//       if (response.status === 200) {
//         message.success('Profile updated successfully!');
//         setIsEditing(false);

//         // Reload profile data after successful update
//         loadProfileData();
//       }
//     } catch (error) {
//       message.error('Failed to update profile');
//       console.error('Error updating profile:', error);
//     }
//   };

//   const handlePasswordChange = async (values) => {
//     try {
//       // Add your password change API call here
//       message.success('Password changed successfully!');
//       setIsChangingPassword(false);
//       form.resetFields(['password', 'confirmPassword']);
//     } catch (error) {
//       message.error('Failed to change password');
//       console.error('Error changing password:', error);
//     }
//   };

//   return (
//     <div style={{ background: '#f0f2f5', padding: '24px', minHeight: '100vh' }}>
//       <Row justify="center">
//         <Col xs={24} sm={24} md={20} lg={16} xl={14}>
//           <Card bordered={false} className="profile-card">
//             <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
//               <Title level={2} style={{ margin: 0 }}>Profile Settings</Title>
//               <Button
//                 type="primary"
//                 icon={isEditing ? <SaveOutlined /> : <EditOutlined />}
//                 onClick={isEditing ? handleSave : () => setIsEditing(true)}
//               >
//                 {isEditing ? 'Save Changes' : 'Edit Profile'}
//               </Button>
//             </Row>

//             <Form
//               form={form}
//               layout="vertical"
//               initialValues={profile}
//               onFinish={handlePasswordChange}
//             >
//               {/* Profile Picture Section */}
//               <Card
//                 style={{ marginBottom: 24 }}
//                 type="inner"
//                 title={<Title level={4}>Profile Picture</Title>}
//               >
//                 <Row justify="center">
//                   <Col>
//                     {isEditing ? (
//                       <Upload
//                         listType="picture-circle"
//                         fileList={fileList}
//                         onChange={({ fileList }) => setFileList(fileList)}
//                         beforeUpload={() => false}
//                         maxCount={1}
//                       >
//                         {fileList.length === 0 && <CameraOutlined style={{ fontSize: 24 }} />}
//                       </Upload>
//                     ) : (
//                       <Avatar
//                         src={profile.profile_picture}
//                         size={120}
//                         icon={<CameraOutlined />}
//                       />
//                     )}
//                   </Col>
//                 </Row>
//               </Card>

//               {/* Basic Information Section */}
//               <Card
//                 style={{ marginBottom: 24 }}
//                 type="inner"
//                 title={<Title level={4}>Basic Information</Title>}
//               >
//                 <Row gutter={[24, 24]}>
//                   <Col xs={24} sm={12}>
//                     <Form.Item
//                       label="Username"
//                       name="username"
//                       rules={[{ required: true, message: 'Username is required' }]}
//                     >
//                       <Input disabled={!isEditing} />
//                     </Form.Item>
//                   </Col>
//                   <Col xs={24} sm={12}>
//                     <Form.Item
//                       label="Email"
//                       name="email"
//                       rules={[
//                         { required: true, message: 'Email is required' },
//                         { type: 'email', message: 'Invalid email format' },
//                       ]}
//                     >
//                       <Input disabled={!isEditing} />
//                     </Form.Item>
//                   </Col>

//                   <Col xs={24} sm={12}>
//                     <Form.Item
//                       label="Date of Birth"
//                       name="dob"
//                     >
//                       <DatePicker
//                         style={{ width: '100%' }}
//                         disabled={!isEditing}
//                         format="DD-MM-YYYY"
//                       />
//                     </Form.Item>
//                   </Col>
//                   <Col xs={24} sm={12}>
//                     <Form.Item
//                       label="Gender"
//                       name="gender"
//                     >
//                       <Radio.Group disabled={!isEditing}>
//                         <Radio value="male">Male</Radio>
//                         <Radio value="female">Female</Radio>
//                       </Radio.Group>
//                     </Form.Item>
//                   </Col>
//                 </Row>
//               </Card>

//               {/* Additional Information Section */}
//               <Card
//                 style={{ marginBottom: 24 }}
//                 type="inner"
//                 title={<Title level={4}>Additional Information</Title>}
//               >
//                 <Form.Item
//                   label="Bio"
//                   name="bio"
//                 >
//                   <TextArea
//                     rows={4}
//                     disabled={!isEditing}
//                     placeholder="Tell us about yourself..."
//                   />
//                 </Form.Item>

//                 {/* {Type === "Teacher" && ( */}
//                   <Form.Item label="Degree Certificate" name="certificate">
//                     {isEditing ? (
//                       <Upload
//                         fileList={certificateList}
//                         onChange={({ fileList }) => setCertificateList(fileList)}
//                         beforeUpload={() => false}
//                         maxCount={1}
//                       >
//                         <Button icon={<UploadOutlined />}>Upload Certificate</Button>
//                       </Upload>
//                     ) : (
//                       certificateList.length > 0 && (
//                         <Button type="link" href={certificateList[0].url} target="_blank">
//                           View Certificate
//                         </Button>
//                       )
//                     )}
//                   </Form.Item>
//                 {/* )} */}
//               </Card>

//               {/* Password Section */}
//               <Card
//                 type="inner"
//                 title={<Title level={4}>Security Settings</Title>}
//               >
//                 {isChangingPassword ? (
//                   <Space direction="vertical" style={{ width: '100%' }} size="large">
//                     <Form.Item
//                       label="New Password"
//                       name="password"
//                       rules={[{ required: true, message: 'Please enter new password' }]}
//                     >
//                       <Input.Password />
//                     </Form.Item>
//                     <Form.Item
//                       label="Confirm Password"
//                       name="confirmPassword"
//                       dependencies={['password']}
//                       rules={[
//                         { required: true, message: 'Please confirm password' },
//                         ({ getFieldValue }) => ({
//                           validator(_, value) {
//                             if (!value || getFieldValue('password') === value) {
//                               return Promise.resolve();
//                             }
//                             return Promise.reject('Passwords do not match');
//                           },
//                         }),
//                       ]}
//                     >
//                       <Input.Password />
//                     </Form.Item>
//                     <Space>
//                       <Button type="primary" htmlType="submit">
//                         Update Password
//                       </Button>
//                       <Button onClick={() => setIsChangingPassword(false)}>
//                         Cancel
//                       </Button>
//                     </Space>
//                   </Space>
//                 ) : (
//                   <Button
//                     icon={<LockOutlined />}
//                     onClick={() => setIsChangingPassword(true)}
//                   >
//                     Change Password
//                   </Button>
//                 )}
//               </Card>
//             </Form>
//           </Card>
//         </Col>
//       </Row>
//     </div>
//   );
// }

// export default Profile;
import React, { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  Radio,
  Row,
  Space,
  Typography,
  Upload,
} from "antd";
import {
  CameraOutlined,
  UploadOutlined,
  EditOutlined,
  SaveOutlined,
  LockOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "axios";

const { Title } = Typography;
const { TextArea } = Input;

function Profile() {
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [certificateList, setCertificateList] = useState([]);
  const [userId, setUserId] = useState(null);
  const [userType, setUserType] = useState(null);
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    profile_picture: "",
    dob: null,
    gender: "",
    bio: "",
    user_degree_certificate: "",
  });

  const getAccessToken = () => {
    const authData = JSON.parse(localStorage.getItem("auth_token"));
    if (!authData?.access_token) {
      throw new Error(
        "Authentication tokens are missing. Please log in again."
      );
    }
    return authData.access_token;
  };

  useEffect(() => {
    const authData = JSON.parse(localStorage.getItem("auth_token"));
    if (authData?.user?.id) {
      setUserId(authData.user.id);
      setUserType(authData.user.type); // Assuming 'type' determines if the user is a teacher
    }
  }, []);

  useEffect(() => {
    if (userId) {
      loadProfileData();
    }
  }, [userId]);

  const loadProfileData = async () => {
    try {
      const accessToken = getAccessToken();

      const response = await axios.get(
        `http://localhost:8000/api/user/${userId}/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const userData = response.data;
      const profile_picture = userData.profile_picture || "";
      const user_degree_certificate = userData.user_degree_certificate || "";

      const profileData = {
        username: userData.username || "",
        email: userData.email || "",
        profile_picture,
        dob: userData.dob ? dayjs(userData.dob).format("DD-MM-YYYY") : "N/A",
        gender: userData.gender || "",
        bio: userData.bio || "",
        razorpay_contact_id: userData.razorpay_contact_id || "",
        user_degree_certificate,
      };

      setProfile(profileData);
      form.setFieldsValue({
        username: userData.username,
        email: userData.email,
        dob: userData.dob ? dayjs(userData.dob) : null,
        gender: userData.gender,
        bio: userData.bio,
        razorpay_contact_id: userData.razorpay_contact_id
      });

      if (profile_picture) {
        setFileList([
          {
            uid: "-1",
            name: "profile_image.png",
            status: "done",
            url: profile_picture,
          },
        ]);
      }

      if (user_degree_certificate) {
        setCertificateList([
          {
            uid: "-1",
            name: "degree_certificate.jpg",
            status: "done",
            url: user_degree_certificate,
          },
        ]);
      }

    } catch (error) {
      message.error("Failed to load profile data");
      console.error("Error loading profile data:", error);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();

      formData.append(
        "form_data",
        JSON.stringify({
          ...values,
          dob: values.dob ? dayjs(values.dob).format("YYYY-MM-DD") : null,
        })
      );

      if (fileList[0]?.originFileObj) {
        formData.append("profile_picture", fileList[0].originFileObj);
      }

      if (certificateList[0]?.originFileObj) {
        formData.append("user_degree_certificate", certificateList[0].originFileObj);
      }

      const accessToken = getAccessToken();

      const response = await axios.patch(
        `http://localhost:8000/api/user/${userId}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 200) {
        message.success("Profile updated successfully!");
        setIsEditing(false);
        loadProfileData();
      }
    } catch (error) {
      message.error("Failed to update profile");
      console.error("Error updating profile:", error);
    }
  };

  // Helper function to open certificate in a new tab
  const previewCertificate = (file) => {
    // Use the URL from the file object if available (for newly uploaded files)
    if (file.url) {
      window.open(file.url, "_blank");
    } else if (profile.user_degree_certificate) {
      window.open(profile.user_degree_certificate, "_blank");
    } else {
      message.error("Certificate URL not available");
    }
  };

  return (
    <div style={{ background: "#f0f2f5", padding: "24px", minHeight: "100vh" }}>
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
                {isEditing ? "Save Changes" : "Edit Profile"}
              </Button>
            </Row>

            <Form form={form} layout="vertical">
              <Card title={<Title level={4}>Profile Picture</Title>}>
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
                      <Avatar src={profile.profile_picture} size={120} />
                    )}
                  </Col>
                </Row>
              </Card>

              <Card title={<Title level={4}>Basic Information</Title>}>
                <Form.Item label="Username" name="username" rules={[{ required: true }]}>
                  <Input disabled={!isEditing} />
                </Form.Item>
                <Form.Item label="Email" name="email" rules={[{ required: true, type: "email" }]}>
                  <Input disabled={!isEditing} />
                </Form.Item>
                <Form.Item label="Date of Birth" name="dob">
                  <DatePicker format="DD-MM-YYYY" disabled={!isEditing} style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item label="Gender" name="gender">
                  <Radio.Group disabled={!isEditing}>
                    <Radio value="male">Male</Radio>
                    <Radio value="female">Female</Radio>
                  </Radio.Group>
                </Form.Item>
              </Card>

              {userType === "Teacher" && (
                <>
                  {/* Degree Certificate Section */}
                  <Card title={<Title level={4}>Degree Certificate</Title>}>
                    <Upload
                      fileList={certificateList}
                      beforeUpload={() => false}
                      maxCount={1}
                      onChange={({ fileList }) => setCertificateList(fileList)}
                      onPreview={previewCertificate}
                      disabled={!isEditing}
                    >
                      {isEditing && (
                        <Button icon={<UploadOutlined />}>
                          Upload Certificate
                        </Button>
                      )}
                    </Upload>
                    {!isEditing && certificateList.length > 0 && (
                      <Button 
                        type="link" 
                        onClick={() => previewCertificate(certificateList[0])}
                        style={{ marginTop: 8 }}
                      >
                        View Certificate
                      </Button>
                    )}
                  </Card>

                  {/* Bank Details Section */}
                  <Card title={<Title level={4}>Bank Details</Title>}>
                    <Form.Item
                      label="Razorpay Contact Id"
                      name="razorpay_contact_id"
                      rules={[{ required: true, message: "Please enter your bank name!" }]}
                    >
                      <Input placeholder="Enter Bank Name" disabled={!isEditing} />
                    </Form.Item>
                  </Card>
                </>
              )}

            </Form>
          </Card>
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
        </Col>
      </Row>
    </div>
  );
}

export default Profile;