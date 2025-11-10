import React, { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "./AuthContext";

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  const goAdd = () => navigate("/recipes/new");
  const doLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar container" role="navigation" aria-label="Main Navigation">
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div className="brand" aria-hidden style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 28 }}>🍽️</span>
          <span style={{ marginLeft: 6, fontSize: 20 }}>Recette App</span>
        </div>
        {user && (
          <button type="button" className="btn secondary" onClick={goAdd} aria-label="Ajouter une recette">
            ➕ Ajouter
          </button>
        )}
      </div>

      <div className="nav-right" style={{ alignItems: "center" }}>
        {user ? (
          <>
            <button type="button" className="btn secondary" style={{ display: "flex", alignItems: "center", gap: 8 }} onClick={() => {}}>
              <span style={{ fontSize: 18 }}>👤</span>
              <span>{user.username}</span>
            </button>

            <button
              type="button"
              className="btn danger"
              onClick={doLogout}
              style={{ background: "var(--danger)", border: 0, padding: "10px 12px" }}
            >
              Déconnecter
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="btn"
              onClick={() => navigate("/login")}
              aria-current={location.pathname === "/login" ? "page" : undefined}
            >
              Connexion
            </button>
            <button
              type="button"
              className="btn secondary"
              onClick={() => navigate("/signup")}
              aria-current={location.pathname === "/signup" ? "page" : undefined}
            >
              Inscription
            </button>
          </>
        )}
      </div>
    </header>
  );
}