import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { Form, Input, message, Progress, Select } from "antd";
import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import loginimg from "../../Image/login-img.png";

function Register() {
    const initialstate = {
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        type: "Student",
    };

    const [state, setState] = useState(initialstate);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfoirmPassword, setShowConfoirmPassword] = useState(false);
    const [errormessage, seterrormessage] = useState("");
    const [successMessage, setsuccessMessage] = useState("");
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [passwordHint, setPasswordHint] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setState({ ...state, [name]: value });
    };

    const handleTypeChange = (value) => {
        setState({ ...state, type: value });
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    const toggleConfoirmPasswordVisibility = () => {
        setShowConfoirmPassword(!showConfoirmPassword)
    }

    const evaluatePasswordStrength = (password) => {
        let strength = 0;
        let hint = "Weak";

        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[\W_]/.test(password)) strength++;

        if (strength === 1 || strength === 2) hint = "Weak";
        if (strength === 3) hint = "Medium";
        if (strength >= 4) hint = "Strong";

        setPasswordStrength(strength);
        setPasswordHint(hint);
    };


    const handleSubmit = async (e) => {
        seterrormessage("");
        setsuccessMessage("");

        const { username, password, confirmPassword, email, type } = state;

        if (!username || !password || !confirmPassword || !email || !type) {
            message.error("All the fields are required");
            return;
        }

        if (password !== confirmPassword) {
            message.error("Passwords don't match");
            return;
        }

        try {
            const response = await axios.post("http://localhost:8000/api/register/", {
                username: username,
                password: password,
                password2: confirmPassword,
                email: email,
                type: type,
            });

            if (response.data.success) {
                message.success(response.data.message);
                const { token } = response.data;
                const { email } = response.data.data;
                console.log("Navigating with:", { email, token }); // Debugging log
                navigate("/otp-verification", { state: { email, token } });
            }
        } catch (error) {
            if (error.response && error.response.data.message) {
                message.error(error.response.data.message);
            } else {
                message.error("Registration failed. Please try again.");
            }
        }
    };


    return (
        <div className="register-container">
            <div className="register-left">
                <img
                    src={loginimg}
                    alt="Welcome Illustration"
                    className="register-illustration"
                />
                <h2>Welcome to Knowledge Spark.</h2>
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                    eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
                    ad minim veniam.
                </p>
            </div>

            <div className="register-right">
                <div className="back-to-home-register">
                    <Link to="/">
                        <i className="fa-solid fa-arrow-left"></i> Back to Login
                    </Link>
                </div>
                <div className="register-form">
                    <h1>Sign Up into Your Account</h1>
                    <Form
                        layout="vertical"
                        onFinish={handleSubmit} // Attach the handleSubmit function here
                    >
                        <Form.Item
                            label="User Name"
                            name="username"
                            rules={[
                                {
                                    required: true,
                                    message: "Please input your username!",
                                },
                            ]}
                        >
                            <Input
                                name="username"
                                value={state.username}
                                onChange={handleChange}
                                placeholder="Enter your Name"
                                className="register-username-field"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                {
                                    required: true,
                                    message: "Please input your email!",
                                },
                                {
                                    type: "email",
                                    message: "Please enter a valid email address!",
                                },
                            ]}
                        >
                            <Input
                                name="email"
                                value={state.email}
                                onChange={handleChange}
                                placeholder="Enter your email address"
                                className="register-email-field"
                            />
                        </Form.Item>
                        <Form.Item
                            label="Type"
                            name="type"
                            rules={[
                                {
                                    required: true,
                                    message: "Please select your type!",
                                },
                            ]}
                        >
                            <Select
                                value={state.type||'null'}
                                onChange={handleTypeChange}
                                // defaultValue="Null"
                                allowClear
                                options={[
                                    { value: "Student", label: "Student" },
                                    { value: "Teacher", label: "Teacher" },
                                ]}
                                placeholder="Select Type"
                                className="custom-select"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Password"
                            name="password"
                            rules={[
                                {
                                    required: true,
                                    message: "Please input your password!",
                                },
                                {
                                    min: 8,
                                    message: "Password must be at least 8 characters!",
                                },
                            ]}
                        >
                            <Input.Password
                                name="password"
                                value={state.password}
                                className="register-password-field"
                                placeholder="Enter your password"
                                iconRender={(visible) =>
                                    visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                                }
                                suffix={
                                    <span onClick={togglePasswordVisibility}>
                                        {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                                    </span>
                                }
                                onChange={(e) => {
                                    handleChange(e);
                                    evaluatePasswordStrength(e.target.value);
                                }}
                            />
                        </Form.Item>

                        <div className="password-strength">
                            <Progress
                                percent={(passwordStrength / 5) * 100}
                                status={
                                    passwordHint === "Strong"
                                        ? "success"
                                        : passwordHint === "Medium"
                                            ? "active"
                                            : "exception"
                                }
                                showInfo={false}
                            />
                            <p>Password Strength: <strong>{passwordHint}</strong></p>
                        </div>

                        <Form.Item
                            label="Confirm Password"
                            name="confirmPassword"
                            dependencies={["password"]}
                            rules={[
                                {
                                    required: true,
                                    message: "Please confirm your password!",
                                },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        return new Promise((resolve, reject) => {
                                            setTimeout(() => {
                                                if (!value || getFieldValue('password') === value) {
                                                    resolve();
                                                }
                                                else {
                                                    reject(new Error("Passwords do not match!"));
                                                }
                                            }, 2000);
                                        })
                                    },
                                }),
                            ]}
                        >
                            <Input.Password
                                name="confirmPassword"
                                value={state.confirmPassword}
                                placeholder="Confirm Password"
                                className="register-password-field"
                                iconRender={(visible) =>
                                    visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                                }
                                suffix={
                                    <span onClick={toggleConfoirmPasswordVisibility}>
                                        {showConfoirmPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                                    </span>
                                }
                                onChange={handleChange}
                            />
                        </Form.Item>

                        <Form.Item>
                            <button type="submit" className="btn btn-signin">
                                Sign Up
                            </button>
                        </Form.Item>

                        <div className="Sign-alternate">
                            <p>Or Sign in with</p>
                            <button className="btn btn-google">Sign In using Google</button>
                            <button className="btn btn-facebook">Sign In using Facebook</button>
                        </div>
                    </Form>
                </div>
            </div>
        </div>

    );
}

export default Register;
