import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, Form, Input, message, Progress } from "antd";
import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import loginimg from "../../Image/login-img.png";

function ResetPassword() {
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [passwordHint, setPasswordHint] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { token } = useParams();
    console.log("Token:", token);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

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

    if (!token) {
        console.log("Invalid or missing reset token.");

        return <div>Invalid or missing reset token.</div>;
    }

    const handleSubmit = async (values) => {
        const { password, confirmPassword } = values;

        if (password !== confirmPassword) {
            message.error("Passwords do not match!");
            return;
        }

        try {
            const response = await axios.post('http://localhost:8000/api/reset-password/', {
                token, // Send token from URL
                password: values.password,
                password2: values.confirmPassword,
            });

            if (response.status === 200) {
                message.success("Password reset successfully!");
                navigate("/");
            }
        } catch (error) {
            message.error(
                error.response?.data?.message || "Password reset failed. Please try again!"
            );
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
                <div className="back-to-home">
                    <Link to="/">
                        <i className="fa-solid fa-arrow-left"></i> Back to Login
                    </Link>
                </div>
                <div className="login-form">
                    <h1>Setup New Password</h1>
                    <Form
                        layout="vertical"
                        onFinish={handleSubmit}
                        onValuesChange={(changedValues) => {
                            if (changedValues.password) {
                                evaluatePasswordStrength(changedValues.password);
                            }
                        }}
                        className="reset-password-form"
                    >
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
                                className="reset-password-field"
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
                            dependencies={['password']}
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
                                            }, 3000);
                                        })
                                    },
                                }),
                            ]}
                        >
                            <Input.Password
                                className="reset-password-field"
                                placeholder="Confirm your password"
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                className="btn-reset-password"
                                block
                            >
                                Reset Password
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;
