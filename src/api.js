import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json"
  }
});

// helper to attach auth header if token exists
function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Recipes
export const getRecipes = () => api.get("/recipes");
export const getRecipe = (id) => api.get(`/recipes/${id}`);
export const createRecipe = (data) => api.post("/recipes", data, { headers: authHeaders() });
export const updateRecipe = (id, data) => api.put(`/recipes/${id}`, data, { headers: authHeaders() });
export const deleteRecipe = (id) => api.delete(`/recipes/${id}`, { headers: authHeaders() });

// Auth (example endpoints — adapte si ton backend a d'autres chemins)
export const login = (credentials) => api.post("/auth/login", credentials);
export const signup = (user) => api.post("/auth/signup", user);

// Export axios instance if needed elsewhere
export default api;