import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");
    const id = localStorage.getItem("userId");

    if (token && role && id) {
      setUser({
        token,
        role,
        id,
        isAuthenticated: true,
        isAdmin: role === "ADMIN",
      });
    }

    setLoading(false);
  }, []);

  //  LOGIN
  const login = (token, role, id) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userRole", role);
    localStorage.setItem("userId", id);

    setUser({
      token,
      role,
      id,
      isAuthenticated: true,
      isAdmin: role === "ADMIN",
    });
  };

  //  LOGOUT
  const logout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: user?.isAuthenticated || false,
        isAdmin: user?.isAdmin || false,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
