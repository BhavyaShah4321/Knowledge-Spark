import { message } from "antd";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import loginimg from "../../Image/login-img.png";

function OTPVerification() {
    const { state } = useLocation();
    // const token = state?.token;
    const email = state?.email;
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [timer, setTimer] = useState(60);
    const inputs = useRef([]);
    const timerInterval = useRef(null);
    const navigate = useNavigate();
    const [token, setToken] = useState(state?.token);

    console.log("Token", token);
    console.log("Email", email);

    useEffect(() => {
        if (state?.token) {
            localStorage.setItem("token", state.token);
        }
    }, [state?.token]);


    useEffect(() => {

        if (timer === 0) {
            clearInterval(timerInterval.current);
            return;
        }

        timerInterval.current = setInterval(() => {
            setTimer((prev) => {
                if (prev > 0) {
                    return prev - 1;
                } else {
                    clearInterval(timerInterval.current);
                    return 0;
                }
            });
        }, 1000);

        return () => clearInterval(timerInterval.current);
    }, [timer, token]);


    const handleChange = (e, index) => {
        const value = e.target.value;
        if (!isNaN(value)) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            if (value && index < otp.length - 1) {
                inputs.current[index + 1].focus();
            }
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" || e.key === "Delete") {
            const newOtp = [...otp];
            newOtp[index] = "";
            setOtp(newOtp);

            if (index > 0) {
                inputs.current[index - 1].focus();
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post("http://localhost:8000/api/verify-otp/", {
                token: token,
                otp: otp.join(""),
            });

            if (response.status === 200) {
                const { token, data } = response.data;

                // Check if the account is inactive
                if ((data.type === 'teacher' || data.type === 'student') && data.status === 'inactive') {
                    message.error("Your account is currently inactive. Please contact the administrator.");
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
                    }))
                navigate("/dashboard");
                return;
            }
        } catch (error) {
            console.error("Error during OTP verification:", error);
            const errorMessage =
                error.response?.data?.message || "OTP Verification Failed!";

            if (error.response?.data?.message?.includes("expired")) {
                message.error("The OTP you entered has expired. Please request a new one.");
            } else {
                message.error(errorMessage);
            }
        }
    };



    const handleresendotp = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post("http://localhost:8000/api/resend-otp/", {
                email,
                token,
            });

            if (response.status === 200) {
                message.success(response.data.message);
                setTimer(60); // Reset the timer
                setOtp(["", "", "", ""]); // Clear OTP inputs


                const newToken = response.data.token;
                if (newToken) {
                    setToken(newToken); // Use state to update the token
                }

            }
        } catch (error) {
            console.error("Error during OTP resend:", error);
            const errorMessage =
                error.response?.data?.message || "Failed to resend OTP. Please try again.";
            message.error(errorMessage);
        }
    };


    return (
        <div className="OTP-container">
            <div className="OTP-left">
                <img
                    src={loginimg}
                    alt="Welcome Illustration"
                    className="OTP-illustration"
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

            <div className="OTP-right">
                <div className="OTP-form">
                    <h1>Enter OTP</h1>
                    <form onSubmit={handleSubmit}>
                        <div className="OTP-input-container">
                            {otp.map((value, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputs.current[index] = el)}
                                    type="text"
                                    maxLength="1"
                                    value={value}
                                    onChange={(e) => handleChange(e, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    className="OTP-input"
                                />
                            ))}
                        </div>
                        <button type="submit" className="OTP-submit-button">
                            Verify OTP
                        </button>

                        <div className="otpresend">
                            {timer > 0 ? (
                                <p>Resend OTP in {timer} seconds</p>
                            ) : (
                                <div>
                                    Click here to  &nbsp;
                                    <span
                                        onClick={(e) => {
                                            setTimer(60);
                                            handleresendotp(e);
                                        }}
                                        className="resend-otp"
                                    >
                                        <Link className="link-resend-otp">
                                            Resend OTP
                                        </Link>
                                    </span>
                                </div>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default OTPVerification;