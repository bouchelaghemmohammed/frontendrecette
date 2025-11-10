import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 15000
});

// attacher token si il est  present
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {}
  return config;
});


export const signup = (data) => api.post("/auth/signup", data);
export const login = (credentials) => api.post("/auth/login", credentials);

export const getRecipes = () => api.get("/recipes");
export const getRecipe = (id) => api.get(`/recipes/${id}`);
export const createRecipe = (data) => api.post("/recipes", data);
export const updateRecipe = (id, data) => api.put(`/recipes/${id}`, data);
export const deleteRecipe = (id) => api.delete(`/recipes/${id}`);

export default api;