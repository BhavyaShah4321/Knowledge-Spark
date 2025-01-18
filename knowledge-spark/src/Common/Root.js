import React from 'react';
import { BrowserRouter, Route, Router, Routes } from "react-router-dom";
import Dashboard from '../Admin/Dashboard';
import Graph1 from '../Admin/Graph1';
import Registration from '../Common/Authentication/Register';
import Sidebar from '../Sidebar/Sidebar';
import ForgetPassword from './Authentication/ForgetPassword';
import Login from './Authentication/Login';
import OTPVerification from './Authentication/OTPVerification';
import ResetPassword from './Authentication/ResetPassword';
import PrivateRoute from '../components/PrivateRoute';
import TeacherList from '../components/ManageTeacher/TeacherList';

function Root() {
  return (
      <Routes>
        <Route path="/" element={<Login />} />
         <Route path="/register" element={<Registration />} />
         <Route path="/otp-verification" element={<OTPVerification />} />
       
       <Route path='/forget-password' element={<ForgetPassword />} /> 
        <Route path="/reset-password/:token" element={<ResetPassword />} /> 
        <Route element={<PrivateRoute />}>
        <Route path='/Graph1' element={<Graph1 />} /> 
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/teacher-list' element={<TeacherList/>}/>
       
      
      </Route>
    </Routes>
  );
}

export default Root;
