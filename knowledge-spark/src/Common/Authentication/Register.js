import { Select, message } from "antd";
import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
    const [errormessage, seterrormessage] = useState("");
    const [successMessage, setsuccessMessage] = useState("");
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        seterrormessage("");
        setsuccessMessage("");

        const { username, password, confirmPassword, email, type } = state;

        if (!username || !password || !confirmPassword || !email) {
            message.error("All the fields are required");
            return;
        }

        if (password !== confirmPassword) {
            message.error("Passwords don't match");
            return;
        }

        try {
            const response = await axios.post("http://localhost:8000/api/register/", {
                username,
                password,
                password2: confirmPassword,
                email,
                type,
            });

            if (response.status === 200) {
                message.success("Registration successful!");
                const { email, token } = response.data;

                
                navigate("/otp-verification", {
                    state: { email, token }, // Pass data using state
                });

            }
        } catch (error) {
            message.error("Registration failed. Please try again.");
        }
    };


    return (
        <div className="register-container">
            <div className="back-to-home-register">
                <i className="fa-solid fa-arrow-left"></i> Back to Home
            </div>
            <div className="register-left">
                <img
                    src={loginimg}
                    alt="Welcome Illustration"
                    className="register-illustration"
                />
                <h2>Welcome to DreamsLMS Courses.</h2>
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                    eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
                    ad minim veniam.
                </p>
            </div>

            <div className="register-right">
                <div className="register-form">
                    <h1>Sign Up into Your Account</h1>
                    <form onSubmit={handleSubmit}>
                        <label>Name:</label>
                        <input
                            name="username"
                            value={state.username}
                            onChange={handleChange}
                            placeholder="Enter your Name"
                            className="register-username-field"
                        />
                        <label>Email</label>
                        <input
                            name="email"
                            value={state.email}
                            onChange={handleChange}
                            type="email"
                            placeholder="Enter your email address"
                            className="register-email-field"
                        />
                        <label>Type: </label>
                        <Select
                            value={state.type}
                            onChange={handleTypeChange}
                            defaultValue="student"
                            allowClear
                            options={[
                                { value: "Student", label: "Student" },
                                { value: "Teacher", label: "Teacher" },
                            ]}
                            placeholder="Select Type"
                            className="type-select"
                        />
                        <br />
                        <label>Password</label>
                        <div className="register-password-field">
                            <input
                                name="password"
                                value={state.password}
                                onChange={handleChange}
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                className="register-password-input-field"
                            />
                            <span
                                className="register-password-toggle"
                                onClick={togglePasswordVisibility}
                            >
                                <i
                                    className={
                                        showPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"
                                    }
                                ></i>
                            </span>
                        </div>
                        <label>Confirm Password</label>
                        <div className="register-password-field">
                            <input
                                name="confirmPassword"
                                value={state.confirmPassword}
                                onChange={handleChange}
                                type={showPassword ? "text" : "password"}
                                placeholder="Confirm Password"
                                className="register-password-input-field"
                            />
                            <span
                                className="register-password-toggle"
                                onClick={togglePasswordVisibility}
                            >
                                <i
                                    className={
                                        showPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"
                                    }
                                ></i>
                            </span>
                        </div>
                        {errormessage && <p className="error-message">{errormessage}</p>}
                        {successMessage && <p className="success-message">{successMessage}</p>}
                        <button type="submit" className="btn btn-signin">
                            Sign Up
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Register;
