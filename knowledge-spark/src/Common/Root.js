import React from 'react';
import { Route, Routes } from "react-router-dom";
import CourceDetails from '../Admin/CreateVideoCourse/CourceDetails';
import Courses from '../Admin/CreateVideoCourse/Courses';
import ViewCourseVideo from '../Admin/CreateVideoCourse/ViewCourseVideo';
import Dashboard from '../Admin/Dashboard';
import ChatList from '../Admin/Manage Chat/ChatList';
import StudentList from '../Admin/Manage Student/StudentList';
import CreateTeacher from '../Admin/ManageTeacher/CreateTeacher';
import EditTeacher from '../Admin/ManageTeacher/EditTeacherList';
import TeacherList from '../Admin/ManageTeacher/TeacherList';
import Registration from '../Common/Authentication/Register';
import Category from '../components/Category/Category';
import FeedBack from '../components/FeedBack/FeedBack';
import PrivateRoute from '../components/PrivateRoute';
import StudentCourses from '../components/studentCOurses/StudentCourses';
import Profile from '../components/UserProfile/Profile';
import ForgetPassword from './Authentication/ForgetPassword';
import Login from './Authentication/Login';
import OTPVerification from './Authentication/OTPVerification';
import ResetPassword from './Authentication/ResetPassword';


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
        <Route path="/create-teacher" element={<CreateTeacher />} />
        <Route path="/edit-teacher/:id" element={<EditTeacher />} />
        <Route path="/student-list" element={<StudentList />} />
        <Route path="/course-list" element={<Courses />} />
        <Route path="/cource-details/:id" element={<CourceDetails />} />
        <Route path="/view-course/:id" element={<ViewCourseVideo />} />
        <Route path="/chat-list" element={<ChatList />} />
        <Route path="/feedback" element={<FeedBack />} />
        <Route path="/category-list" element={<Category />} />


      </Route>

      {/* Teacher-Specific Routes */}
      <Route element={<PrivateRoute allowedRoles={["Teacher"]} />}>
      </Route>


      {/* Student-Specific Routes */}
      <Route element={<PrivateRoute allowedRoles={["Student"]} />}>
        <Route path="/student-coures" element={<StudentCourses />} />
      </Route>
    </Routes>
  );
};

export default Root;
