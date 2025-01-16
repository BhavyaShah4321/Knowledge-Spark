import React from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Dashboard from '../Admin/Dashboard';
import Graph1 from '../Admin/Graph1';
import Registration from '../Common/Authentication/Register';
import Sidebar from '../Sidebar/Sidebar';
import ForgetPassword from './Authentication/ForgetPassword';
import Login from './Authentication/Login';
import OTPVerification from './Authentication/OTPVerification';
import ResetPassword from './Authentication/ResetPassword';

function Root() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/otp-verification" element={<OTPVerification />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/forget-password' element={<ForgetPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path='/Graph1' element={<Graph1 />} />
        <Route path='/Sidebar' element={<Sidebar />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Root;
