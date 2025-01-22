import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="home-container">
      <h1>Welcome to Our Application</h1>
      <p>
        Explore our platform by signing up or logging in.
      </p>
      <div className="home-links">
        <Link to="/signup" className="btn btn-primary m-2">
          Sign Up
        </Link>
        <Link to="/login" className="btn btn-secondary m-2">
          Login
        </Link>
      </div>
    </div>
  );
};

export default HomePage;