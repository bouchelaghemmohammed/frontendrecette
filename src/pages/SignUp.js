import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../components/AuthContext";
import { useNotification } from "../components/Notification";

export default function SignUp() {
  const { signup } = useContext(AuthContext);
  const notify = useNotification();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const show = (type, msg) => {
    if (notify && typeof notify.show === "function") notify.show({ type, message: msg });
    else alert(msg);
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!username.trim() || !password) {
      show("error", "Remplissez nom d'utilisateur et mot de passe");
      return;
    }
    setLoading(true);
    try {
      const res = await signup({ username: username.trim(), password });
      if (res.success) {
        show("success", "Inscription réussie !");
        navigate("/login");
      } else {
        show("error", res.message || "Échec de l'inscription");
      }
    } catch (err) {
      console.error("Signup error:", err?.response || err);
      show("error", "Échec de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="container">
        <div className="auth-card" style={{ marginTop: 18 }}>
          <div className="auth-form">
            <h2 style={{ marginTop: 0 }}>Inscription</h2>
            <p style={{ marginTop: 0, marginBottom: 18, color: "#475569" }}>Crée un compte pour ajouter et gérer tes recettes.</p>

            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <label>Nom d'utilisateur</label>
                <input className="input" value={username} onChange={e => setUsername(e.target.value)} placeholder="Mohammed" />
              </div>

              <div className="form-field">
                <label>Mot de passe</label>
                <input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} placeholder="***************" />
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn" type="submit" disabled={loading}>{loading ? "Inscription…" : "S'inscrire"}</button>
                <button type="button" className="btn secondary" onClick={() => navigate("/login")}>Annuler</button>
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