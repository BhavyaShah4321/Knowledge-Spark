import { Button, DatePicker, Form, message, Select } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

function CreateVideoCall({ closeModal, refreshData }) {
  const [form] = Form.useForm();
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch Teachers and Students
  useEffect(() => {
    const auth_token = JSON.parse(localStorage.getItem('auth_token') || "{}");
    if (!auth_token?.access_token) {
      throw new Error("Authentication tokens are missing. Please log in again.");
    }
    const accesstoken = auth_token.access_token;

    const fetchUsers = async () => {
      try {
        // Fetch Teachers
        const teacherResponse = await axios.get("http://localhost:8000/api/user/?search=Teacher", {
          headers: { Authorization: `Bearer ${accesstoken}` }
        });
        setTeachers(teacherResponse.data.results.data || []);

        // Fetch Students
        const studentResponse = await axios.get("http://localhost:8000/api/user/?search=Student", {
          headers: { Authorization: `Bearer ${accesstoken}` }
        });
        setStudents(studentResponse.data.results.data || []);
      } catch (error) {
        message.error("Failed to fetch teachers or students.");
      }
    };

    fetchUsers();
  }, []);

  // Handle Form Submission
  const onFinish = async (values) => {
    setLoading(true);
    const auth_token = JSON.parse(localStorage.getItem('auth_token') || "{}");
    if (!auth_token?.access_token) {
      throw new Error("Authentication tokens are missing. Please log in again.");
    }
    const accesstoken = auth_token.access_token;

    const requestData = {
      teacher: values.teacher,
      student: values.student,
      start: dayjs(values.start).format('DD/MM/YYYY HH:mm'),
    };

    try {
      await axios.post("http://localhost:8000/api/video-call/", requestData, {
        headers: { Authorization: `Bearer ${accesstoken}` }
      });
      message.success("Video call created successfully!");
      form.resetFields();
      closeModal();
      refreshData();  // <-- Trigger list refresh after creation
    } catch (error) {
      message.error("Failed to create video call.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
    >
      <Form.Item
        name="teacher"
        label="Teacher"
        rules={[{ required: true, message: 'Please select a teacher' }]}
      >
        <Select placeholder="Select Teacher">
          {teachers.map((teacher) => (
            <Select.Option key={teacher.id} value={teacher.id}>
              {teacher.username}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="student"
        label="Student"
        rules={[{ required: true, message: 'Please select a student' }]}
      >
        <Select placeholder="Select Student">
          {students.map((student) => (
            <Select.Option key={student.id} value={student.id}>
              {student.username}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="start"
        label="Start Time"
        rules={[{ required: true, message: 'Please select start time' }]}
      >
        <DatePicker showTime format="DD/MM/YYYY HH:mm" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Create Video Call
        </Button>
      </Form.Item>
    </Form>
  );
}

export default CreateVideoCall
