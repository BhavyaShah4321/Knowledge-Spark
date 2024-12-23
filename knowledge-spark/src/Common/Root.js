import React from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Registration from '../Common/Authentication/Register';
import Login from './Authentication/Login';
import OTPVerification from './Authentication/OTPVerification';

function Root() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/otp-verification" element={<OTPVerification />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Root;
