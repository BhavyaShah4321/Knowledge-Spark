import React, { useEffect,useState } from 'react';
import {
    Button,
    Form,
    Input,
    DatePicker,
    Radio,
    Space,
    Upload,
    message,
    Modal,
    Row,
    Col
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const EditTeacherModal = ({ visible, teacherId, onClose, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible && teacherId) {
            fetchTeacher();
        }
    }, [visible, teacherId]);

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
                console.log("ssss",teacherData);
                
                form.setFieldsValue({
                    username: teacherData.username,
                    email: teacherData.email,
                    dob: teacherData.dob ? dayjs(teacherData.dob, "DD-MM-YYYY") : null,
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

    const handleSubmit = async (values) => {
        try {
            setLoading(true);
            const formData = new FormData();

            const form_data = {
                username: values.username,
                email: values.email,
                dob: values.dob ? dayjs(values.dob).format("DD-MM-YYYY") : null,
                bio: values.bio,
                gender: values.gender,
            };

            formData.append("form_data", JSON.stringify(form_data));

            if (values.profile_picture?.[0]?.originFileObj) {
                formData.append("profile_picture", values.profile_picture[0].originFileObj);
            }

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
                onSuccess?.();
                onClose();
            }
        } catch (error) {
            console.error("Error updating teacher:", error);
            message.error("Failed to update teacher.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Edit Teacher"
            open={visible}
            onCancel={onClose}
            footer={null}
            width={800}
            centered
        >
            <Form 
                layout="vertical" 
                form={form} 
                onFinish={handleSubmit}
                className="pt-4"
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item 
                            name="username" 
                            label="Teacher Name" 
                            rules={[{ required: true, message: "Please enter name!" }]}
                        >
                            <Input placeholder="Enter Name" />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item 
                            name="email" 
                            label="Email" 
                            rules={[{ required: true, type: "email", message: "Invalid email!" }]}
                        >
                            <Input placeholder="Enter Email Address" disabled />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item name="dob" label="Date of Birth">
                            <DatePicker format="DD-MM-YYYY" style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
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

                    <Col span={24}>
                        <Form.Item name="bio" label="Bio">
                            <Input.TextArea placeholder="Enter a short bio" rows={3} />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            name="profile_picture"
                            label="Profile Picture"
                            valuePropName="fileList"
                            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                        >
                            <Upload
                                name="profile_picture"
                                listType="picture"
                                beforeUpload={() => false}
                                accept="image/*"
                                maxCount={1}
                                disabled
                            >
                                <Button icon={<UploadOutlined />} disabled>Upload Profile Picture</Button>
                            </Upload>
                        </Form.Item>
                    </Col>

                    <Col span={12}>
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
                                <Button icon={<UploadOutlined />} disabled>Upload Certificate</Button>
                            </Upload>
                        </Form.Item>
                    </Col>
                </Row>

                <div className="flex justify-end gap-2 mt-4">
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Update Teacher
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default EditTeacherModal;