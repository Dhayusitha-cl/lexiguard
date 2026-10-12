import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount, verify with /me
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("lexiguard_token");
      const cached = localStorage.getItem("lexiguard_user");

      if (token && cached) {
        setUser(JSON.parse(cached));
        try {
          const { data } = await api.get("/auth/me");
          setUser(data);
          localStorage.setItem("lexiguard_user", JSON.stringify(data));
        } catch (err) {
          console.warn("Token invalid, logging out");
          localStorage.removeItem("lexiguard_token");
          localStorage.removeItem("lexiguard_user");
          setUser(null);
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("lexiguard_token", data.token);
    localStorage.setItem("lexiguard_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password, role) => {
    const { data } = await api.post("/auth/register", {
      name,
      email,
      password,
      role,
    });
    localStorage.setItem("lexiguard_token", data.token);
    localStorage.setItem("lexiguard_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("lexiguard_token");
    localStorage.removeItem("lexiguard_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};