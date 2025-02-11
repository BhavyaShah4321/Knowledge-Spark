import { UploadOutlined } from "@ant-design/icons";
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
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ReactComponent as Back } from '../../Image/Back.svg';

function EditTeacher() {
    const [form] = Form.useForm();
    const { id: teacherId } = useParams();
    const Navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchTeacher = async () => {
            try {
                const authData = JSON.parse(localStorage.getItem("auth_token"));
                const accessToken = authData?.access_token;
                if (!accessToken) {
                    message.error("Unauthorized. Please log in again.");
                    return;
                }
    
                const response = await axios.get(`http://localhost:8000/api/user/${teacherId}`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
    
                if (response.status === 200) {
                    const teacherData = response.data;
    
                    form.setFieldsValue({
                        username: teacherData.username,
                        email: teacherData.email,
                        dob: teacherData.dob ? dayjs(teacherData.dob, "DD-MM-YYYY") : null, // Fix applied here
                        bio: teacherData.bio,
                        gender: teacherData.gender || "male",
                        profile_picture: teacherData.profile_picture
                            ? [{ uid: "-1", name: "profile.jpg", url: teacherData.profile_picture }]
                            : [],
                        certificate: teacherData.user_degree_certificate
                            ? [{ uid: "-2", name: "certificate.pdf", url: teacherData.user_degree_certificate }]
                            : [],
                    });
                }
            } catch (error) {
                console.error("Error fetching teacher data:", error);
                message.error("Failed to load teacher details.");
            }
        };
    
        fetchTeacher();
    }, [teacherId]);
    


    const handleSubmit = async (values) => {
        try {
            const formData = new FormData();
    
            // Prepare the JSON object with correct date format
            const form_data = {
                username: values.username,
                email: values.email,
                dob: values.dob ? dayjs(values.dob).format("DD-MM-YYYY") : null,  // Fix applied here
                bio: values.bio,
                gender: values.gender,
            };
    
            formData.append("form_data", JSON.stringify(form_data));
    
            // Append profile picture if updated
            if (values.profile_picture?.[0]?.originFileObj) {
                formData.append("profile_picture", values.profile_picture[0].originFileObj);
            }
    
            // Append certificate if updated
            if (values.certificate?.[0]?.originFileObj) {
                formData.append("user_degree_certificate", values.certificate[0].originFileObj);
            }
    
            const authData = JSON.parse(localStorage.getItem("auth_token"));
            const accessToken = authData?.access_token;
    
            const response = await axios.put(`http://localhost:8000/api/user/${teacherId}/`, formData, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "multipart/form-data",
                },
            });
    
            if (response.status === 200) {
                message.success("Teacher updated successfully!");
                Navigate("/teacher-list");
            }
        } catch (error) {
            console.error("Error updating teacher:", error);
            message.error("Failed to update teacher.");
        }
    };
    


    return (
        <div style={{ padding: "20px" }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: "20px" }}>
                <Col>
                    <h2 style={{ margin: 0 }}>Edit Teacher</h2>
                    <div className="bredcrumbwrp">
                        <Link to="/teacher-list" className="back">
                            <Back /> BACK
                        </Link>
                        <Breadcrumb
                            items={[
                                { title: <Link to="/teacher-list">Teacher</Link> },
                                { title: 'Edit Teacher' }
                            ]}
                        />
                    </div>
                </Col>
            </Row>

            <Card title="Edit Teacher Details" bordered={false}>
                <Form layout="vertical" form={form} onFinish={handleSubmit}>
                    <Row gutter={16}>
                        <Col xs={24} sm={6}>
                            <Form.Item name="username" label="Teacher Name" rules={[{ required: true, message: "Please enter name!" }]}>
                                <Input placeholder="Enter Name" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={6}>
                            <Form.Item name="email" label="Email" rules={[{ required: true, type: "email", message: "Invalid email!" }]}>
                                <Input placeholder="Enter Email Address"  disabled />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={6}>
                            <Form.Item name="dob" label="Date of Birth">
                                <DatePicker format="DD-MM-YYYY" style={{ width: "100%" }} />
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
                                    disabled
                                    
                                >
                                    <Button icon={<UploadOutlined />} disabled>Upload Profile Picture</Button>
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
                                    disabled
                                   
                                >
                                    <Button icon={<UploadOutlined />}  disabled>Upload Certificate</Button>
                                </Upload>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>Update Teacher</Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}

export default EditTeacher;
