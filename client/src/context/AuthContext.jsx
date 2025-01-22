// src/context/AuthContext.js
import React, { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");

  const checkAuthStatus = () => {
    const token = localStorage.getItem("token");
    
    if (token) {
      try {
        // console.log(token);
        const payload = JSON.parse(atob(token.split(".")[1]));
        // console.log(payload);
        setUserEmail(payload.email || "User");
        setUserId(payload.id);
        setIsAuthenticated(payload.exp > Date.now() / 1000);
      } catch {
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userEmail, userId, checkAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
};