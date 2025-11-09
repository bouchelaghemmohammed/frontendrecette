import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import RecipeList from "./pages/RecipeList";
import AddRecipe from "./pages/AddRecipe";
import EditRecipe from "./pages/EditRecipe";
import RecipeDetail from "./pages/RecipeDetail";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { AuthContext } from "./components/AuthContext";

/**
 * App : si user n'existe pas -> la racine "/" renvoie vers /login (plus d'ouverture directe /recipes)
 */
export default function App() {
  const { user } = useContext(AuthContext);

  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={user ? <Navigate to="/recipes" replace /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Listing et detail publics */}
        <Route path="/recipes" element={<RecipeList />} />
        <Route path="/recipes/:id" element={<RecipeDetail />} />

        {/* Actions protégées */}
        <Route path="/recipes/new" element={<PrivateRoute><AddRecipe /></PrivateRoute>} />
        <Route path="/recipes/:id/edit" element={<PrivateRoute><EditRecipe /></PrivateRoute>} />
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}