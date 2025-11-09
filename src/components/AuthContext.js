import React, { createContext, useState, useEffect } from "react";
import * as api from "../api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem("user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const onStorage = () => {
      try {
        const u = localStorage.getItem("user");
        setUser(u ? JSON.parse(u) : null);
      } catch {
        setUser(null);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = async ({ username, password }) => {
    try {
      const res = await api.login({ username, password });
      const { token, user: u } = res.data || {};
      if (token && u) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(u));
        setUser(u);
        return { success: true, message: "Connecté avec succès", user: u };
      }
      return { success: false, message: "Réponse invalide du serveur" };
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Échec de la connexion";
      return { success: false, message };
    }
  };

  const signup = async (data) => {
    try {
      const res = await api.signup(data);
      return { success: true, data: res.data };
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Échec de l'inscription";
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};