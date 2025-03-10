import React from 'react';
import { Route, Routes } from "react-router-dom";
import CourceDetails from '../Admin/CreateVideoCourse/CourceDetails';
import Courses from '../Admin/CreateVideoCourse/Courses';
import ViewCourseVideo from '../Admin/CreateVideoCourse/ViewCourseVideo';
import Dashboard from '../Admin/Dashboard';
import ChatList from '../Admin/Manage Chat/ChatList';
import ChatMessage from '../Admin/Manage Chat/ChatMessage';
import StudentList from '../Admin/Manage Student/StudentList';
import CreateVideoCall from '../Admin/Manage Video Call/CreateVideoCall';
import EditVideoCall from '../Admin/Manage Video Call/EditVideoCall';
import ManageVideochat from '../Admin/Manage Video Call/ManageVideochat';
import CreateTeacher from '../Admin/ManageTeacher/CreateTeacher';
// import EditTeacher from '../Admin/ManageTeacher/EditTeacherList';
import TeacherList from '../Admin/ManageTeacher/TeacherList';
import Registration from '../Common/Authentication/Register';
import Category from '../components/Category/Category';
import ComplaintList from '../components/complaint/ComplaintList';
import ComplaintModal from '../components/complaint/CreateComplain';
import FeedBack from '../components/FeedBack/FeedBack';
import PrivateRoute from '../components/PrivateRoute';
import StudentChat from '../components/Student Chat/StudentChat';
import StudentCourses from '../components/studentCOurses/StudentCourses';
import TeacherChat from '../components/Teacher Chat/TeacherChat';
import CourseList from '../components/Teacher/ManageCourses/CourseList';
import Profile from '../components/UserProfile/Profile';
import ForgetPassword from './Authentication/ForgetPassword';
import Login from './Authentication/Login';
import OTPVerification from './Authentication/OTPVerification';
import ResetPassword from './Authentication/ResetPassword';
import TeacherProfile from '../components/Teacher/ManageCourses/TeacherProfile';
import TeacherFeedBackList from '../components/Teacher/TeacherFeedBackList';


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
        {/* <Route path="/edit-teacher/:id" element={<EditTeacher />} /> */}
        <Route path="/student-list" element={<StudentList />} />
        <Route path="/course-list" element={<Courses />} />
        <Route path="/chat-message" element={<ChatMessage />} />
        <Route path="/cource-details/:id" element={<CourceDetails />} />
        <Route path="/view-course/:id" element={<ViewCourseVideo />} />
        <Route path="/chat-list" element={<ChatList />} />
        <Route path="/feedback" element={<FeedBack />} />
        <Route path="/category-list" element={<Category />} />
        <Route path="/manage-courses" element={<CourseList />} />
        <Route path="/manage-video-chat" element={<ManageVideochat />} />
        <Route path="/create-video-call" element={<CreateVideoCall />} />
        <Route path="/edit-video-call" element={<EditVideoCall />} />
        <Route path="/complaint-list" element={<ComplaintList />} />
        <Route path="/create-complaint" element={<ComplaintModal />} />
        <Route path="/profile/:id" element={<TeacherProfile />} />
        <Route path="/teacher-feedback" element={<TeacherFeedBackList />} />

      </Route>

      {/* Teacher-Specific Routes */}
      <Route element={<PrivateRoute allowedRoles={["Teacher"]} />}>
        <Route path="/teacher-chat" element={<TeacherChat />} />
      </Route>


      {/* Student-Specific Routes */}
      <Route element={<PrivateRoute allowedRoles={["Student"]} />}>
        <Route path="/student-coures" element={<StudentCourses />} />
        <Route path="/student-chat" element={<TeacherChat />} />
        <Route path='/profile/:teacherId' element={<Profile/>} />
      </Route>
    </Routes>
  );
};

export default Root;
