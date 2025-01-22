import { message } from 'antd';
import axios from 'axios';
import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import loginimg from "../../Image/login-img.png";

function ForgetPassword() {
    const navigate = useNavigate();
    const initialstate = {
        email: "",
    };

    const [state, setState] = useState(initialstate);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setState({ ...state, [name]: value }); // Update the specific field in the state
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent the default form submission behavior

        const { email } = state;

        if (!email) {
            message.error("Email is required");
            return;
        }

        try {
            const response = await axios.post('http://localhost:8000/api/forgot-password/', {
                email,
            });

            if (response.status === 200) {
                message.success("Reset link sent to your email!");
                
                // // Use token from the response
                // const token = response.data.token;
                
                // // Navigate correctly
                // navigate(`/reset-password/${token}`);
            }
        } catch (error) {
            message.error("Failed to send reset link. Please try again.");
        }
    };

    return (
        <div className="forget-password-container">
            <div className="forget-password-left hidden-on-laptop">
                <img
                    src={loginimg}
                    alt="Welcome Illustration"
                    className="login-illustration"
                />
                <h2>Welcome to Knowledge Spark</h2>
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                    tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
                </p>
            </div>
            <div className="forget-password-right">
                <div className="forget-password-back-to-home">
                    <Link to="/">
                        <i className="fa-solid fa-arrow-left"></i> Back to Login
                    </Link>
                </div>
                <div className="forget-password-form">
                    <h1 className="forget-password-heading">Forgot Password?</h1>
                    <div>
                        <p>Enter your email to reset your password.</p>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <label>Email</label>
                        <input
                            name="email"
                            type="email"
                            value={state.email}
                            onChange={handleChange} // Handle input changes
                            placeholder="Enter your email "
                            className="forget-password-input-field"
                        />
                        <button type="submit" className="btn btn-signin">
                            Submit
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ForgetPassword;
