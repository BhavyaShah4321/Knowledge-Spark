// import { Input, message } from "antd";
// import axios from "axios";
// import React, { useState } from "react";

// const OTPVerification = ({ email, token }) => {
//     const [otp, setOtp] = useState(["", "", "", ""]);

//     const handleOtpChange = (value, index) => {
//         if (!isNaN(value)) {
//             const newOtp = [...otp];
//             newOtp[index] = value;
//             setOtp(newOtp);

//             if (value && index < otp.length - 1) {
//                 document.getElementById(`otp-input-${index + 1}`).focus();
//             }

//             if (newOtp.join("").length === 4) {
//                 verifyOtp(newOtp.join(""));
//             }
//         }
//     };

//     const verifyOtp = async (otpCode) => {
//         message.loading({ content: "Verifying OTP...", key: "otpVerification" });
//         try {
//             await axios.post("http://localhost:8000/api/verify-otp/", {
//                 token,
//                 otp: otpCode,
//             });
//             message.success({ content: "OTP Verified!", key: "otpVerification" });
//         } catch (error) {
//             message.error({
//                 content: "OTP verification failed. Try again.",
//                 key: "otpVerification",
//             });
//         }
//     };

//     return (
//         <div className="otp-container">
//             <h1>Verify OTP</h1>
//             <p>We sent an OTP to your email: {email}</p>
//             <div className="otp-fields">
//                 {otp.map((value, index) => (
//                     <Input
//                         key={index}
//                         id={`otp-input-${index}`}
//                         value={value}
//                         maxLength={1}
//                         onChange={(e) => handleOtpChange(e.target.value, index)}
//                         style={{
//                             width: "50px",
//                             marginRight: "10px",
//                             textAlign: "center",
//                         }}
//                     />
//                 ))}
//             </div>
//         </div>
//     );
// };

// export default OTPVerification;



import { message } from "antd";
import axios from "axios";
import React, { useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import loginimg from "../../Image/login-img.png";

function OTPVerification() {
    const { state } = useLocation();
    const { email, token } = state;
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [timer, setTimer] = useState(60);
    const inputs = useRef([]);
    const timerInterval = useRef(null);
    const navigate = useNavigate();

    // if (!email || !token) {
    //     return message.error(" Missing email or token. Please try again.")
    // }

    // useEffect(() => {
    //     timerInterval.current = setInterval(() => {
    //         setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    //     }, 1000);
    //     return () => {
    //         clearInterval(timerInterval.current);
    //     };
    // }, []);

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
                token,
                otp: otp.join(""),
            });

            if (response.status === 200) {
                message.success("OTP Verified Successfully!");
                // navigate("/")
            }
        } catch (error) {
            message.error("OTP Verification Failed!");
        }
    };


    const handleresendotp = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post("http://localhost:8000/api/resend-otp/", {
                token,
                otp: otp.join(""),
            })

            if (response.status === 200) {
                message.success("OTP Verified Succesfully! ");
            }

        } catch (error) {
            message.error("OTP Verification Failed")
        }

    }

    return (
        <div className="OTP-container">
            <div className="OTP-left">
                <img
                    src={loginimg}
                    alt="Welcome Illustration"
                    className="OTP-illustration"
                />
                <h2>Welcome to DreamsLMS Courses.</h2>
                <p>
                    Please enter the OTP sent to your registered email address ({email}) to verify your account.
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
