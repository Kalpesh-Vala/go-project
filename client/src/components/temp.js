// import React from "react";
import React, { useState } from "react";
// import SocialButton from "./SocialButton";
// import facebookIcon from "../assets/icons/facebook.svg";
// import googleIcon from "../assets/icons/google.svg";
// import githubIcon from "../assets/icons/github.svg";
import "../styles/signup.css";


const SignupForm = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      setMessage(data.message || data.error);
      setLoading(false);
    } catch (error) {
      setMessage("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="header">
        <h1>GO Lang Projects</h1>
      </div>
      <div className="card">
        <h2>Sign Up</h2>
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
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        {message && <p className="message">{message}</p>}
        <div className="social-icons">
          <h3>Or Sign Up With</h3>
          <div>
            <img
              src="/assets/icons/google.svg"
              alt="Google"
              style={{ width: "30px", height: "30px", marginRight: "10px" }}
            />
            <img
              src="/assets/icons/github.svg"
              alt="GitHub"
              style={{ width: "30px", height: "30px", marginRight: "10px" }}
            />
            <img
              src="/assets/icons/facebook.svg"
              alt="Facebook"
              style={{ width: "30px", height: "30px" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
