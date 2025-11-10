import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRecipe, updateRecipe } from "../api";
import { useNotification } from "../components/Notification";

export default function EditRecipe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const notify = useNotification();

  const [form, setForm] = useState({ name: "", description: "", ingredients: "", instructions: "", category: "", imageUrl: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!id) { setLoading(false); return; }
    setLoading(true);
    getRecipe(id)
      .then(res => { if (!mounted) return; const data = res.data || {}; setForm({ name: data.name || "", description: data.description || "", ingredients: data.ingredients || "", instructions: data.instructions || "", category: data.category || "", imageUrl: data.imageUrl || "" }); })
      .catch(err => { console.error("getRecipe error:", err?.response || err); })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [id]);

  const handleChange = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSave = async (ev) => {
    ev.preventDefault();
    if (!id) return;
    setSaving(true);
    try {
      await updateRecipe(id, form);
      if (notify && notify.show) notify.show({ type: "success", message: "Recette modifiée" });
      navigate(`/recipes/${id}`);
    } catch (err) {
      console.error("updateRecipe error:", err?.response || err);
      if (notify && notify.show) notify.show({ type: "error", message: "Échec de la mise à jour" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <main className="container"><p className="muted">Chargement…</p></main>;

  return (
    <main className="container" style={{ maxWidth: 880 }}>
      <h2>Modifier la recette</h2>
      <form onSubmit={handleSave}>
        <div className="form-field">
          <label>Nom</label>
          <input className="input" value={form.name} onChange={handleChange("name")} />
        </div>

        <div className="form-field">
          <label>Catégorie</label>
          <input className="input" value={form.category} onChange={handleChange("category")} />
        </div>

        

        <div className="form-field">
          <label>Ingrédients</label>
          <textarea className="input" value={form.ingredients} onChange={handleChange("ingredients")} rows={4} />
        </div>

        <div className="form-field">
          <label>Instructions</label>
          <textarea className="input" value={form.instructions} onChange={handleChange("instructions")} rows={6} />
        </div>

        <div className="form-field">
          <label>Image (URL)</label>
          <input className="input" value={form.imageUrl} onChange={handleChange("imageUrl")} />
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" type="submit" disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</button>
          <button type="button" className="btn secondary" onClick={() => navigate("/recipes")}>Annuler</button>
        </div>
      </form>
    </main>
  );
}