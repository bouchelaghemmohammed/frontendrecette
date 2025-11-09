import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../components/AuthContext";
import { useNotification } from "../components/Notification";

/**
 * Login: form aligned with the left edge of the navbar (.container)
 * Form uses modern .input fields and bigger, centered composition.
 */
export default function Login() {
  const { login } = useContext(AuthContext);
  const notify = useNotification();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!username.trim()) e.username = "Nom d'utilisateur requis";
    if (!password) e.password = "Mot de passe requis";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const showNotify = (type, message) => {
    if (notify && typeof notify.show === "function") notify.show({ type, message });
    else alert(message);
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await login({ username: username.trim(), password });
      if (res.success) {
        showNotify("success", "Connecté avec succès !");
        navigate("/recipes");
      } else {
        showNotify("error", res.message || "Échec de la connexion");
      }
    } catch (err) {
      console.error("Login error:", err?.response || err);
      showNotify("error", "Échec de la connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="container">
        <div className="auth-card" style={{ marginTop: 18 }}>
          <div className="auth-form" aria-labelledby="login-title">
            <h2 id="login-title" style={{ marginBottom: 8 }}>Connexion</h2>
            <p style={{ marginTop: 0, marginBottom: 35, color: "#475569" }}>
             Connectez-vous pour gérer vos propres recettes et découvrir toutes les recettes partagées par la communauté.
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-field">
                <label htmlFor="username">Nom d'utilisateur</label>
                <input id="username" className="input" value={username} onChange={e => setUsername(e.target.value)} placeholder="Mohammed" />
                {errors.username && <div style={{ color: "#ef4444", marginTop: 6 }}>{errors.username}</div>}
              </div>

              <div className="form-field">
                <label htmlFor="password" >Mot de passe</label>
                <input id="password" type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} placeholder="***************" />
                {errors.password && <div style={{ color: "#ef4444", marginTop: 6 }}>{errors.password}</div>}
              </div>

              <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 6 }}>
                <button type="submit" className="btn" disabled={loading}>{loading ? "Connexion…" : "Se connecter"}</button>
                <Link to="/signup" style={{ marginLeft: "auto", color: "var(--primary-600)", textDecoration: "underline" }}>Inscription</Link>
              </div>
            </form>
          </div>

          <div className="auth-hero" aria-hidden>
            <img src="/hero.png" alt="Décor cuisine" />
          </div>
        </div>
      </div>
    </main>
  );
}