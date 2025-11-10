import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRecipe, deleteRecipe } from "../api";
import { useNotification } from "../components/Notification";

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const notify = useNotification();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    if (!id) { setLoading(false); return; }
    setLoading(true);
    getRecipe(id)
      .then(res => { if (!mounted) return; setRecipe(res.data || res); })
      .catch(err => { console.error("getRecipe error:", err?.response || err); setRecipe(null); })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [id]);

  const handleEdit = (e) => {
    e?.stopPropagation();
    const rid = (recipe && (recipe.id || recipe._id)) || id;
    if (!rid) return;
    navigate(`/recipes/${rid}/edit`);
  };

  const handleDelete = async (e) => {
    e?.stopPropagation();
    const rid = (recipe && (recipe.id || recipe._id)) || id;
    if (!rid) return;
    if (!window.confirm("Confirmer la suppression ?")) return;
    try {
      await deleteRecipe(rid);
      if (notify && notify.show) notify.show({ type: "success", message: "Recette supprimée" });
      navigate("/recipes");
    } catch (err) {
      console.error(err);
      if (notify && notify.show) notify.show({ type: "error", message: err?.response?.data?.message || "Échec de la suppression" });
    }
  };

  if (loading) return <main className="container"><p className="muted">Chargement…</p></main>;
  if (!recipe) return <main className="container"><p className="muted">Recette introuvable.</p></main>;

  const author = "Auteur : Mohammed"; // manuellement pour le moment.
  const createdAt = recipe.createdAt ? new Date(recipe.createdAt).toLocaleString() : null;

  return (
    <main className="container" style={{ paddingTop: 18 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <button className="btn secondary" onClick={() => navigate("/recipes")}>← Retour</button>
        <h1 style={{ margin: 0 }}>{recipe.name}</h1>

        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <div className="author-badge">👩‍🍳 {author}</div>
          {createdAt && <div style={{ color: "var(--muted)", fontSize: 13 }}>{createdAt}</div>}

          {/* Buttons: Modifier (blue) and Supprimer (red) */}
          <div style={{ display: "flex", gap: 8, marginLeft: 8 }}>
            <button
              onClick={handleEdit}
              style={{
                background: "#2563eb",
                color: "#fff",
                border: "none",
                padding: "8px 12px",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600
              }}
              aria-label="Modifier la recette"
            >
              Modifier
            </button>

            <button
              onClick={handleDelete}
              style={{
                background: "#dc2626",
                color: "#fff",
                border: "none",
                padding: "8px 12px",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600
              }}
              aria-label="Supprimer la recette"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>

      <div className="detail-content">
        <h3>Ingrédients</h3>
        <pre style={{ whiteSpace: "pre-wrap", margin: 0, color: '#344055' }}>{recipe.ingredients || "Aucun"}</pre>

        <h3 style={{ marginTop: 12 }}>Instructions</h3>
        <pre style={{ whiteSpace: "pre-wrap", margin: 0, color: '#344055' }}>{recipe.instructions || "Aucune instruction"}</pre>

        <div style={{ marginTop: 18, borderRadius: 12, overflow: "hidden", boxShadow: "var(--shadow-lg)" }}>
          {recipe.imageUrl ? (
            <img src={recipe.imageUrl} alt={recipe.name} style={{ width: "100%", height: 420, objectFit: "cover", display: "block" }} />
          ) : (
            <div style={{ padding: 32, textAlign: "center", background: "linear-gradient(180deg,#eef7ff,#e6f2ff)" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--primary-600)" }}>Aucune image</div>
              <div style={{ color: "#64748b", marginTop: 6 }}>Ajoute une image via le champ Image</div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}