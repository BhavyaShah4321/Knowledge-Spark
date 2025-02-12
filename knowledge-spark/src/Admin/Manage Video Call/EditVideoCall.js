import { Button, DatePicker, Form, message, Select } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

function EditVideoCall({ editData, closeModal, refreshData }) {
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
        const teacherResponse = await axios.get("http://localhost:8000/api/user/?search=Teacher", {
          headers: { Authorization: `Bearer ${accesstoken}` }
        });
        setTeachers(teacherResponse.data.results.data || []);

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

  // Pre-fill form data
  useEffect(() => {
    if (editData) {
      form.setFieldsValue({
        teacher: editData.teacher,
        student: editData.student,
        start: dayjs(editData.start, 'DD/MM/YYYY HH:mm')
      });
    }
  }, [editData, form]);

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
      await axios.patch(`http://localhost:8000/api/video-call/${editData.id}/`, requestData, {
        headers: { Authorization: `Bearer ${accesstoken}` }
      });
      message.success("Video call updated successfully!");
      form.resetFields();
      closeModal();
      refreshData();  // Refresh the list after update
    } catch (error) {
      message.error("Failed to update video call.");
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
          Update Video Call
        </Button>
      </Form.Item>
    </Form>
  );
}

export default EditVideoCall;
