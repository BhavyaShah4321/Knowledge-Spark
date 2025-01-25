import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import AdminLayout from './AdminLayout/AdminLayout';

const PrivateRoute = ({ allowedRoles }) => {
  const authToken = JSON.parse(localStorage.getItem("auth_token"));
  console.log("auth",authToken);
  

  if (!authToken) {
    // Redirect to login if not authenticated
    return <Navigate to="/" />;
  }

  const userType = authToken.user.type;
  console.log('type',userType);
  

  if (!allowedRoles.includes(userType)) {
    // Redirect to unauthorized or restricted page if access is denied
    return <Navigate to="/unauthorized" />;
  }

  // If the user type is allowed, render the protected routes
  return  <AdminLayout>
  <Outlet />
</AdminLayout>;
};

export default PrivateRoute;