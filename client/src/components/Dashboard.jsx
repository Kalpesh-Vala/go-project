import React, { useContext, useEffect, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // Import AuthContext
import todoImage from "../assets/todo.jpg"; // To-Do List image
import "../styles/Dashboard.css";

const Dashboard = () => {
  const { isAuthenticated, userEmail, userId, checkAuthStatus } = useContext(AuthContext); // Access auth status and email from context
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthStatus(); // Check authentication status when the component mounts
  }, [checkAuthStatus]);

  const handleGoToTodoList = () => {
    console.log(userId);
    navigate("/todo", { state: { userId } }); // Passing userId to TodoTemplate
  };

  if (!isAuthenticated) {
    navigate("/login"); // Redirect to login if the user is not authenticated
    return null; // Prevent rendering while redirecting
  }

  return (
    <div>
      <Navbar username={userEmail} /> {/* Using userEmail in Navbar */}
      <div className="container mt-5">
        <h1>Dashboard</h1>
        <p>Welcome to the dashboard, {userEmail}!</p> {/* Using userEmail in welcome message */}
        <div className="row">
          {/* To-Do List Card */}
          <div className="col-md-6">
            <div className="card todo-card shadow-lg">
              <img
                src={todoImage}
                className="card-img-top todo-image"
                alt="To-Do List"
              />
              <div className="card-body">
                <h5 className="card-title">To-Do List Service</h5>
                <p className="card-text">
                  Organize your tasks efficiently with our to-do list feature.
                </p>
                <button
                  className="btn btn-primary"
                  onClick={handleGoToTodoList}
                >
                  Go to To-Do List
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;