import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AdminLayout from './AdminLayout/AdminLayout';

const PrivateRoute = () => {
  // Check if the user is logged in using localStorage
 const authData = localStorage.getItem('auth_token');
const isLoggedIn = authData && authData.length > 0; 

  return isLoggedIn ? (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  ) : (
    <Navigate to="/login" />
  );
};

export default PrivateRoute;
