import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AdminLayout from './AdminLayout/AdminLayout';

const PrivateRoute = () => {
  // Check if the user is logged in using localStorage
  const authData = JSON.parse(localStorage.getItem('auth_token'));
  const isLoggedIn = authData && authData.access_token;

  // Conditionally render AdminLayout with child routes or redirect to /login
  return isLoggedIn ? (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  ) : (
    <Navigate to="/login" />
  );
};

export default PrivateRoute;
