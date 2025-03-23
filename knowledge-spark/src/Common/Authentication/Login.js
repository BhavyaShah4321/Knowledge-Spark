import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { Form, Input, message } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import loginimg from "../../Image/login-img.png";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Skip the redirect check if we're already on the login page
    // This prevents redirect loops and allows users to access the login page
    if (location.pathname === "/login") {
      const storedAuth = localStorage.getItem("auth_token");
      
      if (storedAuth) {
        try {
          const parsedAuth = JSON.parse(storedAuth);
          
          // Check if the token has the expected structure
          if (
            !parsedAuth.access_token ||
            !parsedAuth.user ||
            !parsedAuth.user.email
          ) {
            // Invalid token structure, clear it but don't redirect
            localStorage.removeItem("auth_token");
            return;
          }
          
          console.log("Login Token", storedAuth);
          
          // Valid token exists, redirect based on user type
          if (parsedAuth.user.type === "Student") {
            navigate("/student-coures");
          } else {
            navigate("/dashboard");
          }
        } catch (error) {
          console.error("Invalid token format:", error);
          localStorage.removeItem("auth_token");
          // Don't redirect, allow user to stay on login page
        }
      }
      // If no token exists, do nothing - user can stay on login page
    } else {
      // For other pages, check if token exists
      const storedAuth = localStorage.getItem("auth_token");
      
      if (!storedAuth) {
        // No token, redirect to visitor courses
        navigate("/");
      }
    }
  }, [navigate, location.pathname]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (values) => {
    const { email, password } = values;
    const normalUserApi = "http://localhost:8000/api/login/";
    const adminApi = "http://localhost:8000/api/login/admin-login/";

    try {
      // Attempt normal user login first
      const normalResponse = await axios.post(normalUserApi, {
        email,
        password,
      });

      if (normalResponse.status === 200 && normalResponse.data.success) {
        const { token, data } = normalResponse.data;

        // Check if the account is inactive
        if (
          (data.type === "Teacher" || data.type === "Student") &&
          data.status === "inactive"
        ) {
          message.error(
            "Your account is currently inactive. Please contact the administrator."
          );
          return;
        }

        document.cookie = `token=${token.access_token}; path=/;SameSite=Lax`;
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
        
        // Redirect based on user type after successful login
        if (data.type === "Student") {
          navigate("/student-coures");
        } else {
          navigate("/dashboard");
        }
        return;
      }
    } catch (error) {
      console.warn("Normal user login failed, trying admin login...");

      // If normal user login fails, attempt admin login
      try {
        const adminResponse = await axios.post(adminApi, { email, password });

        if (adminResponse.status === 200 && adminResponse.data.success) {
          const { token, data } = adminResponse.data;

          // Check if the admin account is inactive
          if (data.status === "inactive") {
            message.error(
              "Your account is currently inactive. Please contact the administrator."
            );
            return;
          }

          document.cookie = `token=${token.access_token}; path=/;SameSite=Lax`;
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
        console.error("Admin login failed:", adminError);
        message.error(
          "Login failed. Please check your credentials and try again."
        );
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
          <b>
            🌟 Empowering Learning, Anytime, Anywhere! 🔹 For Teachers: Create and
            manage courses effortlessly. Share your knowledge with students
            worldwide. 🔹 For Students: Explore a wide range of courses, learn
            from expert educators, and enhance your skills at your own pace. 🚀
            Log in now and ignite your learning journey!
          </b>
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
                    {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
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