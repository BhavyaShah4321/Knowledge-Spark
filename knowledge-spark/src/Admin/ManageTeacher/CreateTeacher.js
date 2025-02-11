import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import {
    Breadcrumb,
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
    Upload,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ReactComponent as Back } from '../../Image/Back.svg';

function CreateTeacher() {
    const [form] = Form.useForm();
    const Navigate = useNavigate();


    const handleSubmit = async (values) => {
        try {
            const formData = new FormData();
    
            // Creating the JSON object that backend expects
            const form_data = {
                username: values.username,
                email: values.email,
                dob: dayjs(values.dob).format("YYYY-MM-DD"), // Ensure correct date format
                bio: values.bio,
                type: "Teacher",
            };
    
            // Append the JSON object as a string
            formData.append("form_data", JSON.stringify(form_data));
    
            // Append profile picture if exists
            if (values.profile_picture?.[0]?.originFileObj) {
                formData.append("profile_picture", values.profile_picture[0].originFileObj);
            }
    
            // Append certificate if exists
            if (values.certificate?.length > 0 && values.certificate[0]?.originFileObj) {
                formData.append("user_degree_certificate", values.certificate[0].originFileObj);
            }
    
            // Get Access Token
            const authData = JSON.parse(localStorage.getItem("auth_token"));
            if (!authData?.access_token) {
                throw new Error("Authentication tokens are missing. Please log in again.");
            }
            const accessToken = authData.access_token;
    
            console.log("Payload Sent:", Object.fromEntries(formData.entries())); // Debugging
    
            // Send Request
            const response = await axios.post("http://localhost:8000/api/user/", formData, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "multipart/form-data",
                },
            });
    
            // Handle Response
            if (response.status === 201 || response.status === 200) {
                message.success("Teacher Created Successfully");
                form.resetFields();
                Navigate("/teacher-list"); // Ensure correct navigation
            }
        } catch (error) {
            console.error("Error submitting form:", error);
    
            if (error.response) {
                console.error("Backend Response:", error.response.data);
            }
    
            if (error.response && error.response.status === 400) {
                message.error("Invalid input data. Please check the fields.");
            } else if (error.response && error.response.status === 401) {
                message.error("Unauthorized. Please log in again.");
            } else {
                message.error("Failed to create Teacher.");
            }
        }
    };
    
    



    return (
        <div style={{ padding: "20px" }}>
            {/* Header Section */}
            <Row justify="space-between" align="middle" style={{ marginBottom: "20px" }}>
                <Col>
                    <h2 style={{ margin: 0 }}>Alloys</h2>
                    <div className="bredcrumbwrp">
                        <Link to="/teacher-list" className="back">
                            <Back /> BACK
                        </Link>
                        <Breadcrumb
                            items={[
                                { title: <Link to="/teacher-list">Teacher</Link> },
                                { title: 'Create Teacher' }
                            ]}
                        />
                    </div>
                </Col>
            </Row>

            {/* Form Card */}
            <Card title="Add New Teacher" bordered={false}>
                <Form layout="vertical" form={form} onFinish={handleSubmit} initialValues={{ gender: "male" }}>
                    {/* First Row - 4 Fields */}
                    <Row gutter={16}>
                        <Col xs={24} sm={6}>
                            <Form.Item name="username" label="Teacher Name" rules={[{ required: true, message: "Please enter name!" }]}>
                                <Input placeholder="Enter Name" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={6}>
                            <Form.Item name="email" label="Email" rules={[{ required: true, type: "email", message: "Invalid email!" }]}>
                                <Input placeholder="Enter Email Address" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={6}>
                            <Form.Item name="dob" label="Date of Birth">
                                <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={6}>
                            <Form.Item name="gender" label="Gender">
                                <Radio.Group>
                                    <Space>
                                        <Radio value="male">Male</Radio>
                                        <Radio value="female">Female</Radio>
                                        <Radio value="other">Other</Radio>
                                    </Space>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Second Row - Bio & Certificate Upload */}
                    <Row gutter={16}>
                        <Col xs={12} sm={6}>
                            <Form.Item name="bio" label="Bio">
                                <Input.TextArea placeholder="Enter a short bio" rows={3} />
                            </Form.Item>
                        </Col>

                        <Col xs={12} sm={6}>
                            <Form.Item
                                name="profile_picture"
                                label="Profile Picture"
                                valuePropName="fileList"
                                getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                            >
                                <Upload
                                    name="profile_picture"
                                    listType="picture"
                                    beforeUpload={() => false} // Prevent auto-upload
                                    accept="image/*"
                                    maxCount={1}
                                >
                                    <Button icon={<UploadOutlined />}>Upload Profile Picture</Button>
                                </Upload>
                            </Form.Item>
                        </Col>

                        <Col xs={12} sm={6}>
                            <Form.Item
                                name="certificate"
                                label="Upload Certificate"
                                valuePropName="fileList"
                                getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                            >
                                <Upload
                                    name="certificate"
                                    listType="text"
                                    beforeUpload={() => false}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    maxCount={1}
                                >
                                    <Button icon={<UploadOutlined />}>Upload Certificate</Button>
                                </Upload>
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Submit Button */}
                    <Form.Item>
                        <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
                            Add Teacher
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}

export default CreateTeacher;
