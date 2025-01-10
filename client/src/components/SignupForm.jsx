import React, { useState } from "react";
import SocialButton from "./SocialButton";
import facebookIcon from "../assets/icons/facebook.svg";
import googleIcon from "../assets/icons/google.svg";
import githubIcon from "../assets/icons/github.svg";
import "../styles/signup.css";
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const SignupForm = () => {
  const [formData, setFormData] = useState({ email: "", password: "", confirmPassword: "" });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Password confirmation check
    if (formData.password !== formData.confirmPassword) {
      setMessage({ text: "Passwords do not match!", type: "danger" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage({ text: data.message || "User registered successfully!", type: "success" });
        setFormData({ email: "", password: "", confirmPassword: "" });
      } else {
        setMessage({ text: data.error || "An error occurred. Please try again.", type: "danger" });
      }
    } catch (error) {
      setMessage({ text: "An error occurred. Please try again.", type: "danger" });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    if (field === "password") {
      setShowPassword(!showPassword);
    } else if (field === "confirmPassword") {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  return (
    <div className="signup-container">
      <header className="header">
        <h1>GO Lang Projects</h1>
      </header>
      <div className="card">
        <h2>Sign Up</h2>

        {/* Bootstrap Alert */}
        {message.text && (
          <div className={`alert alert-${message.type}`} role="alert">
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="form-control"
            />
          </div>
          {/* import { FaEye, FaEyeSlash } from 'react-icons/fa'; */}

        <div className="form-group">
            <label htmlFor="password">Password:</label>
            <div className="input-group">
                <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="form-control"
                />
                <span
                className="input-group-text"
                onClick={() => togglePasswordVisibility("password")}
                style={{ cursor: "pointer" }}
                >
                {showPassword ? (
                    <FaEyeSlash />
                ) : (
                    <FaEye />
                )}
                </span>
            </div>
        </div>

        <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <div className="input-group">
                <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className="form-control"
                />
                <span
                className="input-group-text"
                onClick={() => togglePasswordVisibility("confirmPassword")}
                style={{ cursor: "pointer" }}
                >
                {showConfirmPassword ? (
                    <FaEyeSlash />
                ) : (
                    <FaEye />
                )}
                </span>
            </div>
        </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <div className="social-signup">
          <p>Or Sign Up Using</p>
          <div className="social-buttons">
            <SocialButton iconPath={facebookIcon} alt="Facebook" />
            <SocialButton iconPath={googleIcon} alt="Google" />
            <SocialButton iconPath={githubIcon} alt="GitHub" />
          </div>
        </div>
        <p className="login-link">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};

export default SignupForm;
