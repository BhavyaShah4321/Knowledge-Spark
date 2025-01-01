import React, { useState } from "react";
import { Link } from "react-router-dom";
import loginimg from "../../Image/login-img.png";

function Login() {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  }

  return (
    <div className="login-container">
      <div className="login-left">
        <img
          src={loginimg}// Replace with the path to your illustration image
          alt="Welcome Illustration"
          className="login-illustration"
        />
        <h2>Welcome to DreamsLMS Courses.</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
        </p>
      </div>

      <div className="login-right">
        <div className="back-to-home">
          <Link to="/register">
            <i className="fa-solid fa-arrow-left"></i> Back to Register
          </Link>
        </div>
        <div className="login-form">
          <h1>Login into Your Account</h1>
          <form>
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email address"
              className="input-field"
            />

            <label>Password</label>
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="input-field"
              />
              <span className="password-toggle" onClick={togglePasswordVisibility}>
                <i className={showPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}></i>
              </span>
            </div>

            <div className="login-options">
              <a href="/forgot-password" className="forgot-password">Forgot Password?</a>
              <label>
                <input type="checkbox" /> Remember me
              </label>
            </div>

            <button type="submit" className="btn btn-login">
              Log In
            </button>

            <div className="login-alternate">
              <p>Or Log in with</p>
              <button className="btn btn-google">Login In using Google</button>
              <button className="btn btn-facebook">Login In using Facebook</button>
            </div>

            <p className="new-user">
              New User? <Link to="/register">Create an Account</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;