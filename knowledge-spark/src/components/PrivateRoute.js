import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import AdminLayout from './AdminLayout/AdminLayout';

const PrivateRoute = ({ allowedRoles }) => {
  const authToken = JSON.parse(localStorage.getItem("auth_token"));
  

  if (!authToken) {
    // Redirect to login if not authenticated
    return <Navigate to="/dashboard" />;
  }

  
  return  <AdminLayout>
  <Outlet />
</AdminLayout>;
};

export default PrivateRoute;