import React, { useEffect, useState, useContext } from "react";
import { getRecipes, deleteRecipe } from "../api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../components/AuthContext";


export default function RecipeList() {
  const { user } = useContext(AuthContext);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
        if (mounted) setRecipes([]);
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const isOwner = (r) => {
    if (!r) return false;
    if (!user || !user.id) return false;
    return Number(r.userId) === Number(user.id);
  };

  const handleDelete = async (e, r) => {
    e.stopPropagation();
    const rid = r.id || r._id;
    if (!rid) return;
    if (!window.confirm("Supprimer cette recette ?")) return;
    try {
      await deleteRecipe(rid);
      setRecipes(prev => prev.filter(item => (item.id || item._id) !== rid));
      alert("Recette supprimée");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Échec suppression");
    }
  };

  const handleEdit = (e, r) => {
    e.stopPropagation();
    const rid = r.id || r._id;
    if (!rid) return;
    navigate(`/recipes/${rid}/edit`);
  };

  if (loading) return <main className="container"><p>Chargement…</p></main>;
  if (!recipes.length) return <main className="container"><p>Aucune recette.</p></main>;

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 16
  };

  const cardStyle = {
    background: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 6px 20px rgba(16,24,40,0.08)",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    minHeight: 240
  };

  const imgWrapStyle = {
    width: "100%",
    height: 160,
    background: "#f3f4f6",
    display: "block",
    overflow: "hidden"
  };

  const imgStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block"
  };

  const bodyStyle = {
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    flex: 1
  };

  const footerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "auto"
  };

  return (
    <main className="container" style={{ paddingTop: 18 }}>
      <div style={gridStyle}>
        {recipes.map(r => {
          const rid = r.id || r._id;
          const category = r.category || "";
          return (
            <article
              key={rid}
              style={cardStyle}
              onClick={() => navigate(`/recipes/${rid}`)}
              role="button"
              aria-label={r.name || "Recette"}
            >
              <div style={imgWrapStyle}>
                {r.imageUrl ? (
                  <img src={r.imageUrl} alt={r.name || "Image recette"} style={imgStyle} loading="lazy" />
                ) : (
                  <div style={{ ...imgStyle, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontWeight: 600 }}>
                    Pas d'image
                  </div>
                )}
              </div>

              <div style={bodyStyle}>
                <h3 style={{ margin: 0, fontSize: 18, lineHeight: 1.15 }}>{r.name}</h3>

                
                {category ? (
                  <div style={{ color: "#4b5563", fontSize: 13, marginTop: 6 }}>{category}</div>
                ) : null}

                <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10 }}>
                  <div style={{ background: "#eef2ff", color: "#3730a3", padding: "4px 8px", borderRadius: 999, fontSize: 13 }}>
                    👩‍🍳 Auteur: Mohammed
                  </div>
                </div>

                <div style={footerStyle}>
                  <div style={{ display: "flex", gap: 8 }}>
                    {isOwner(r) && (
                      <>
                        <button
                          onClick={(e) => handleEdit(e, r)}
                          style={{ background: "#fff", border: "1px solid #e6e6e6", padding: "6px 8px", borderRadius: 8, cursor: "pointer" }}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, r)}
                          style={{ background: "#fff", border: "1px solid #fee2e2", color: "#b91c1c", padding: "6px 8px", borderRadius: 8, cursor: "pointer" }}
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/recipes/${rid}`); }}
                    style={{ background: "#3b82f6", color: "#fff", borderRadius: 8, padding: "6px 10px", border: "none", cursor: "pointer" }}
                  >
                    Voir
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}