import React, { createContext, useState, useContext, useEffect } from "react";

// Create the context
const AuthContext = createContext();

// Custom hook to use the context easily
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component
export const AuthProvider = ({ children }) => {
  // Check localStorage for user info on mount
  const initialUser = JSON.parse(localStorage.getItem("userInfo")) || null;
  const [user, setUser] = useState(initialUser);

  // Function to handle login/registration success
  const login = (userData) => {
    setUser(userData);
    // Store user data (including the JWT token) in localStorage
    localStorage.setItem("userInfo", JSON.stringify(userData));
  };

  // Function to handle logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem("userInfo");
  };

  // Check user state on component mount (for persistent login)
  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
    }
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
