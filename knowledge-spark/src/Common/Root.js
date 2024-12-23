import React from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Registration from '../Common/Authentication/Register';
import Login from './Authentication/Login';

function Root() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Registration />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Root;
