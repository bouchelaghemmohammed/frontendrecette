import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./components/AuthContext";
import { NotificationProvider } from "./components/Notification";
import "./index.css";

/*
  Safe index.js: no manual WebSocket creation here (avoid ws://localhost:3000/ws errors).
  Wrap App with BrowserRouter, AuthProvider and NotificationProvider.
*/

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <BrowserRouter>
    <AuthProvider>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </AuthProvider>
  </BrowserRouter>
);