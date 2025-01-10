import React, { useState } from "react";
import SocialButton from "./SocialButton";
import facebookIcon from "../assets/icons/facebook.svg";
import googleIcon from "../assets/icons/google.svg";
import githubIcon from "../assets/icons/github.svg";
import "../styles/signup.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";

const LoginForm = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage({ text: data.message || "Login successful!", type: "success" });
        setFormData({ email: "", password: "" });
      } else {
        setMessage({ text: data.error || "Invalid credentials. Please try again.", type: "danger" });
      }
    } catch (error) {
      setMessage({ text: "An error occurred. Please try again.", type: "danger" });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            GO Lang Projects
          </a>
        </div>
      </nav>

      {/* Login Form */}
      <div className="signup-container d-flex justify-content-center align-items-center">
        <div className="card">
          <h2>Login</h2>

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
                  onClick={togglePasswordVisibility}
                  style={{ cursor: "pointer" }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          <div className="social-signup">
            <p>Or Login Using</p>
            <div className="social-buttons">
              <SocialButton iconPath={facebookIcon} alt="Facebook" />
              <SocialButton iconPath={googleIcon} alt="Google" />
              <SocialButton iconPath={githubIcon} alt="GitHub" />
            </div>
          </div>
          <p className="login-link">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
