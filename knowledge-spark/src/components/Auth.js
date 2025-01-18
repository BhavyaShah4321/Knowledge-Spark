import React, { useState } from "react";
import AuthService from "../services/auth.service"; // Assuming this handles API calls
import { useNavigate } from "react-router-dom";

function Auth() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [isLoggedIn, setIsLoggedIn] = useState(!!user);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    try {
      const response = await AuthService.login(email, password);
      const userData = response.data.userData;
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      setIsLoggedIn(true);
    } catch (error) {
      const message =
        (error.response && error.response.data?.detail) ||
        error.response?.data?.message ||
        "An error occurred during login.";
      setError(message);
      setIsLoggedIn(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setIsLoggedIn(false);
  };

  const register = async (username, email, password) => {
    try {
      const response = await AuthService.register(username, email, password);
      return response.data.message;
    } catch (error) {
      const message =
        (error.response && error.response.data?.message) ||
        "An error occurred during registration.";
      setError(message);
    }
  };

  return { user, isLoggedIn, error, login, logout, register };
}

export default Auth;
