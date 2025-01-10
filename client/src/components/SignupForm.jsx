import React from "react";
import SocialButton from "./SocialButton";
import facebookIcon from "../assets/icons/facebook.svg";
import googleIcon from "../assets/icons/google.svg";
import githubIcon from "../assets/icons/github.svg";
import "../styles/signup.css";

const SignupForm = () => {
  return (
    <div className="signup-container">
      <header className="header">
        <h1>GO Lang Projects</h1>
      </header>
      <div className="card">
        <h2>Sign Up</h2>
        <form>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              placeholder="Type your username"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Type your password"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirm-password">Confirm Password</label>
            <input
              type="password"
              id="confirm-password"
              placeholder="Type your password again"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Register
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
