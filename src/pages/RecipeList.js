import React, { useEffect, useState, useContext } from "react";
import { getRecipes, deleteRecipe } from "../api";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../components/Notification";
import { AuthContext } from "../components/AuthContext";

/* keep your helpers (excerpt etc.) as before */

export default function RecipeList() {
  const { user } = useContext(AuthContext);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
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
      })
      .catch(err => {
        console.error("getRecipes error:", err?.response || err);
        if (!mounted) return;
        setRecipes([]);
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const isOwner = (recipe) => {
    if (!recipe) return false;
    if (!user || !user.id) return false;
    return Number(recipe.userId) === Number(user.id);
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
      console.error(err);
      if (notify && notify.show) notify.show({ type: "error", message: err?.response?.data?.message || "Échec de la suppression" });
    }
  };

  if (loading) return <main className="container"><p className="muted">Chargement…</p></main>;
  if (!recipes.length) return <main className="container"><p className="muted">Aucune recette.</p></main>;

  return (
    <main className="container" style={{ paddingTop: 18 }}>
      <div style={{ display: "grid", gap: 12 }}>
        {recipes.map(r => (
          <article key={r.id || r._id} className="card" onClick={() => navigate(`/recipes/${r.id || r._id}`)}>
            <div className="card-body">
              <h3>{r.name}</h3>
              {/* No description displayed */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <div className="author-badge">👩‍🍳 Auteur inconnu</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {isOwner(r) && (
                    <>
                      <button className="icon-btn" onClick={(e) => handleEdit(e, r)}>✏️</button>
                      <button className="icon-btn danger" onClick={(e) => handleDelete(e, r)}>🗑️</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}