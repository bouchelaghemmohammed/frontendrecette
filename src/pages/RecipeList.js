import React, { useEffect, useState } from "react";
import { getRecipes, deleteRecipe } from "../api";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../components/Notification";

/**
 * Robust author extraction
 * We try many possible fields commonly used by different backends.
 */
function getAuthor(recipe) {
  if (!recipe) return null;

  // common nested user object
  const userObj = recipe.user || recipe.creator || recipe.owner || recipe.createdBy || recipe.author;
  if (userObj) {
    if (typeof userObj === "object") {
      return userObj.username || userObj.name || userObj.fullName || userObj.displayName || userObj.firstName || null;
    }
    if (typeof userObj === "string") return userObj;
  }

  // fallback top-level fields
  if (recipe.authorName) return recipe.authorName;
  if (recipe.author && typeof recipe.author === "string") return recipe.author;
  if (recipe.username) return recipe.username;
  if (recipe.userName) return recipe.userName;
  if (recipe.createdByName) return recipe.createdByName;

  // some backends put user in nested path like meta.createdBy
  if (recipe.meta && recipe.meta.createdBy) {
    const m = recipe.meta.createdBy;
    if (typeof m === "object") return m.username || m.name || null;
    return m;
  }

  return null;
}

function excerptText(text, max = 250) {
  if (!text) return "";
  const clean = String(text).trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max).trim() + "…";
}

export default function RecipeList() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const notify = useNotification();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getRecipes()
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data && res.data.recipes ? res.data.recipes : (res.data || []));
        if (!mounted) return;
        setRecipes(data);
        // debug: log a sample recipe to inspect structure if author missing
        if (data && data.length) {
          // log only one sample for debugging
          // eslint-disable-next-line no-console
          console.info("Sample recipe (for debugging author field):", data[0]);
        }
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.error("getRecipes error:", err?.response || err);
        if (!mounted) return;
        setRecipes([]);
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const openDetail = (r) => {
    const rid = r.id || r._id;
    if (!rid) return;
    navigate(`/recipes/${rid}`);
  };

  const handleEdit = (e, r) => {
    e.stopPropagation();
    const rid = r.id || r._id;
    if (!rid) return;
    navigate(`/recipes/${rid}/edit`);
  };

  const handleDelete = async (e, r) => {
    e.stopPropagation();
    const rid = r.id || r._id;
    if (!rid) return;
    if (!window.confirm("Voulez-vous supprimer cette recette ?")) return;
    try {
      await deleteRecipe(rid);
      setRecipes(prev => prev.filter(item => (item.id || item._id) !== rid));
      if (notify && notify.show) notify.show({ type: "success", message: "Recette supprimée" });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      if (notify && notify.show) notify.show({ type: "error", message: "Échec de la suppression" });
    }
  };

  const filtered = recipes.filter(r => {
    if (!q) return true;
    const s = q.trim().toLowerCase();
    return (r.name && r.name.toLowerCase().includes(s))
      || (r.description && r.description.toLowerCase().includes(s))
      || (r.category && r.category.toLowerCase().includes(s));
  });

  return (
    <main className="container" style={{ paddingTop: 8 }}>
      <div className="header-row">
        <h2 className="title">Mes recettes</h2>
        <div style={{ flex: 1 }} />
        <div className="header-actions" style={{ maxWidth: 900 }}>
          <div className="search-wrap" style={{ width: "100%" }}>
            <input
              className="input search-input"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Rechercher une recette..."
              aria-label="Rechercher une recette"
            />
            <button className="btn" onClick={() => setQ("")}>Effacer</button>
          </div>
        </div>
      </div>

      {loading ? <p className="muted">Chargement…</p> : (
        <section className="recipes-grid" aria-live="polite">
          {filtered.length === 0 ? (
            <div style={{ padding: 20, color: "#6b7280" }}>Aucune recette trouvée.</div>
          ) : filtered.map(r => {
            const rid = r.id || r._id;
            const author = getAuthor(r) || "Auteur inconnu";
            const description = r.description ? r.description : "";
            return (
              <article
                key={rid || Math.random()}
                className="recipe-card"
                onClick={() => openDetail(r)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") openDetail(r); }}
                style={{ cursor: rid ? "pointer" : "default" }}
              >
                <div className="body">
                  <h3 className="recipe-title">{r.name}</h3>

                  {/* DESCRIPTION */}
                  <p className="excerpt" style={{ marginTop: 8 }}>{excerptText(description, 300)}</p>

                  {/* IMAGE under description */}
                  <div style={{ marginTop: 12, borderRadius: 10, overflow: "hidden", boxShadow: "0 10px 30px rgba(10,20,40,0.04)" }}>
                    {r.imageUrl ? (
                      <img src={r.imageUrl} alt={r.name || "Recette"} style={{ width: "100%", height: 260, objectFit: "cover", display: "block" }} />
                    ) : (
                      <div style={{ padding: 22, textAlign: "center", color: "var(--primary-600)" }}>
                        <div style={{ fontSize: 16, fontWeight: 700 }}>Ajouter une image</div>
                        <div style={{ fontSize: 12 }}>Mets le chemin dans Image</div>
                      </div>
                    )}
                  </div>

                  {/* AUTHOR */}
                  <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="author-badge">👩‍🍳 {author}</div>
                    <div style={{ flex: 1 }} />
                  </div>

                  <div style={{ flex: 1 }} />

                  {/* FOOTER: category + actions */}
                  <div className="card-footer" style={{ marginTop: 12 }}>
                    <small className="muted">#{r.category || "Général"}</small>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="icon-btn large" onClick={(e) => handleEdit(e, r)} aria-label="Modifier">✏️</button>
                      <button className="icon-btn large" onClick={(e) => handleDelete(e, r)} aria-label="Supprimer" style={{ color: "var(--danger)" }}>🗑️</button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}