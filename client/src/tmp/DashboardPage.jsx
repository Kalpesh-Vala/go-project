import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import jwtDecode from "jwt-decode";
import "../styles/dashboard.css"; // Assuming you have styles for your dashboard

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const history = useHistory();

  useEffect(() => {
    // Check if the JWT token is present in localStorage
    const token = localStorage.getItem("token");

    if (!token) {
      // If no token, redirect to login page
      history.push("/login");
    } else {
      // Decode the token
      try {
        const decodedToken = jwtDecode(token);
        setUser(decodedToken); // Set the user info (email, etc.)
      } catch (error) {
        // If the token is invalid, clear it and redirect to login
        localStorage.removeItem("token");
        history.push("/login");
      }
    }
  }, [history]);

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            GO Lang Projects
          </a>
          <div className="ml-auto">
            {/* Display username in the navbar */}
            {user && <span className="navbar-text">Welcome, {user.email}</span>}
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="dashboard-container d-flex">
        {/* Left Sidebar */}
        <div className="sidebar bg-light">
          <ul className="list-group">
            <li className="list-group-item active">
              <a href="/dashboard">Dashboard</a>
            </li>
            <li className="list-group-item">
              <a href="/profile">Profile</a>
            </li>
            <li className="list-group-item">
              <a href="/settings">Settings</a>
            </li>
            <li className="list-group-item">
              <a href="/" onClick={() => { localStorage.removeItem("token"); history.push("/login"); }}>
                Logout
              </a>
            </li>
          </ul>
        </div>

        {/* Right Content Area */}
        <div className="content-area p-4">
          <h2>Welcome to Your Dashboard</h2>
          {user ? (
            <>
              <p>Welcome, {user.email}!</p>
              {/* You can add more user-specific content here */}
            </>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
