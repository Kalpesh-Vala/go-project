import React, { useContext, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SignupForm from "./components/SignupForm";
import LoginForm from "./components/LoginForm";
import Dashboard from "./components/Dashboard";
import HomePage from "./components/HomePage";
import TodoTemplate from "./components/todo-app/TodoTemplate"; // Import the To-Do List component
import { AuthContext } from "./context/AuthContext"; // Import the AuthContext

const App = () => {
  const { isAuthenticated, userEmail, checkAuthStatus } = useContext(AuthContext);

  useEffect(() => {
    checkAuthStatus(); // Ensure the authentication status is checked on load
  }, [checkAuthStatus]);

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginForm />}
          />
          <Route
            path="/dashboard"
            element={isAuthenticated ? <Dashboard username={userEmail} /> : <Navigate to="/login" />}
          />
          <Route
            path="/todo"
            element={isAuthenticated ? <TodoTemplate /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
