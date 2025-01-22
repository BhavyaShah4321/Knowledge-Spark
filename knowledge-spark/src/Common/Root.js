import React from 'react';
import { Route, Routes } from "react-router-dom";
import Dashboard from '../Admin/Dashboard';
import Graph1 from '../Admin/Graph1';
import StudentList from '../Admin/Manage Student/StudentList';
import TeacherList from '../Admin/ManageTeacher/TeacherList';
import Registration from '../Common/Authentication/Register';
import PrivateRoute from '../components/PrivateRoute';
import ForgetPassword from './Authentication/ForgetPassword';
import Login from './Authentication/Login';
import OTPVerification from './Authentication/OTPVerification';
import ResetPassword from './Authentication/ResetPassword';
import Profile from '../components/UserProfile/Profile';
import Courses from '../components/CreateVideoCourse/Courses';

const Root = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Registration />} />
      <Route path="/otp-verification" element={<OTPVerification />} />
      <Route path="/forget-password" element={<ForgetPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Role-Based Private Routes */}
      <Route element={<PrivateRoute allowedRoles={["Admin", "Teacher", "Student"]} />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Admin-Specific Routes */}
      <Route element={<PrivateRoute allowedRoles={["Admin"]} />}>
        <Route path="/teacher-list" element={<TeacherList />} />
        <Route path="/student-list" element={<StudentList />} />
      <Route path="/course-list" element={<Courses />} />
      </Route>

      {/* Teacher-Specific Routes */}
      <Route element={<PrivateRoute allowedRoles={["Teacher"]} />}>
      </Route>

      {/* Student-Specific Routes */}
      <Route element={<PrivateRoute allowedRoles={["Student"]} />}>
      
      </Route>

      {/* Unauthorized Route */}
      <Route path="/unauthorized" element={<h1>Unauthorized Access</h1>} />
    </Routes>
  );
};

export default Root;
