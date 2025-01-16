import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
        setEmail(payload.email || "User"); // Set email from token or default to 'User'
      } catch (error) {
        console.error("Invalid token:", error);
        handleLogout(); // Logout if the token is invalid
      }
    } else {
      navigate("/login"); // Redirect to login if no token
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear token
    navigate("/login"); // Redirect to login
  };

  return (
    <div>
      <Navbar username={email} /> {/* Pass email to Navbar */}
      <div className="container mt-5">
        <h1>Dashboard</h1>
        <p>Welcome to the dashboard!</p>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
