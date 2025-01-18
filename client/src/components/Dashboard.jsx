import React, { useContext, useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // Import AuthContext
import todoImage from "../assets/todo.jpg"; // To-Do List image
import chatImage from "../assets/chat.png"; // Chat Application image
import "../styles/Dashboard.css";

const Dashboard = () => {
  const { isAuthenticated, userEmail, checkAuthStatus } = useContext(AuthContext); // Access auth status and email from context
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthStatus(); // Check authentication status when the component mounts
  }, [checkAuthStatus]);

  if (!isAuthenticated) {
    navigate("/login"); // Redirect to login if the user is not authenticated
    return null; // Prevent rendering while redirecting
  }

  return (
    <div>
      <Navbar username={userEmail} /> {/* Pass userEmail from context to Navbar */}
      <div className="container mt-5">
        <h1>Dashboard</h1>
        <p>Welcome to the dashboard, {userEmail}!</p> {/* Display email */}
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
                  onClick={() => navigate("/todo")}
                >
                  Go to To-Do List
                </button>
              </div>
            </div>
          </div>

          {/* Chat Application Card */}
          <div className="col-md-6">
            <div className="card chat-card shadow-lg">
              <img
                src={chatImage}
                className="card-img-top chat-image"
                alt="Chat Application"
              />
              <div className="card-body">
                <h5 className="card-title">Chat Application</h5>
                <p className="card-text">
                  Stay connected with friends and family using our chat
                  application.
                </p>
                <button
                  className="btn btn-success"
                  onClick={() => navigate("/chat")}
                >
                  Go to Chat App
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
