import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { Form, Input, message } from "antd";
import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import loginimg from "../../Image/login-img.png";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (values) => {
    const { email, password } = values;
    const normalUserApi = "http://localhost:8000/api/login/";
    const adminApi = "http://localhost:8000/api/login/admin-login/";

    try {
      // First attempt normal user login
      const normalResponse = await axios.post(normalUserApi, { email, password });

      if (normalResponse.status === 200 && normalResponse.data.success) {
        const { token, data } = normalResponse.data;

        // Check user status if they are a teacher or student
        if ((data.type === 'teacher' || data.type === 'student') && data.status === 'inactive') {
          message.error("Your account is currently inactive. Please contact the administrator.");
          return;
        }

        // Store the token and additional data in localStorage
        localStorage.setItem(
          "auth_token",
          JSON.stringify({
            access_token: token.access_token,
            refresh_token: token.refresh_token,
            user: {
              id: data.id,
              username: data.username,
              email: data.email,
              type: data.type,
              status: data.status,
              profile_picture: data.profile_picture,
              created_at: data.created_at,
            },
            user_type: "Member",
          })
        );

        message.success("Login successful!");
        navigate("/dashboard");
        return;
      }
    } catch (error) {
      // If normal login fails, proceed to admin login
      try {
        const adminResponse = await axios.post(adminApi, { email, password });

        if (adminResponse.status === 200 && adminResponse.data.success) {
          const { token, data } = adminResponse.data;

          // Store the token and additional data in localStorage
          localStorage.setItem(
            "auth_token",
            JSON.stringify({
              access_token: token.access_token,
              refresh_token: token.refresh_token,
              user: {
                id: data.id,
                username: data.username,
                email: data.email,
                type: data.type,
                status: data.status,
                profile_picture: data.profile_picture,
                created_at: data.created_at,
              },
              user_type: "Admin",
            })
          );

          message.success("Admin login successful!");
          navigate("/dashboard");
          return;
        }
      } catch (adminError) {
        // Check if the error response contains status information
        if (adminError.response?.data?.status === 'inactive') {
          message.error("Your account is currently inactive. Please contact the administrator.");
        } else {
          message.error("Invalid email or password. Please try again.");
        }
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img
          src={loginimg}
          alt="Welcome Illustration"
          className="login-illustration"
        />
        <h2>Welcome to Knowledge Spark.</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam.
        </p>
      </div>

      <div className="login-right">
        <div className="login-form">
          <h1>Login into Your Account</h1>
          <Form
            name="login-form"
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  message: "Please enter your email address!",
                },
                {
                  type: "email",
                  message: "Please enter a valid email address!",
                },
              ]}
            >
              <Input
                placeholder="Enter your email address"
                className="login-field"
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                {
                  required: true,
                  message: "Please enter your password!",
                },
              ]}
            >
              <Input.Password
                className="login-field"
                placeholder="Enter your password"
                iconRender={(visible) =>
                  visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                }
                type={showPassword ? "text" : "password"}
                suffix={
                  <span onClick={togglePasswordVisibility}>
                    {showPassword ? (
                      <EyeInvisibleOutlined />
                    ) : (
                      <EyeOutlined />
                    )}
                  </span>
                }
              />
            </Form.Item>

            <div className="login-options">
              <a href="/forget-password" className="forgot-password">
                Forgot Password?
              </a>
              <label>
                <input type="checkbox" /> Remember me
              </label>
            </div>

            <Form.Item>
              <button type="submit" className="btn btn-login">
                Sign In
              </button>
            </Form.Item>

            <p className="new-user">
              New User? <Link to="/register">Create an Account</Link>
            </p>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default Login;