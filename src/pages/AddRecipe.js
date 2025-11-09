import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRecipe } from "../api";
import { useNotification } from "../components/Notification";

export default function AddRecipe() {
  const navigate = useNavigate();
  const notify = useNotification();

  const [form, setForm] = useState({ name: "", description: "", ingredients: "", instructions: "", category: "", imageUrl: "" });
  const [saving, setSaving] = useState(false);

  const handleChange = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setSaving(true);
    try {
      await createRecipe(form);
      if (notify && notify.show) notify.show({ type: "success", message: "Recette ajoutée" });
      navigate("/recipes");
    } catch (err) {
      console.error("createRecipe error:", err?.response || err);
      if (notify && notify.show) notify.show({ type: "error", message: "Échec de l'ajout" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="container" style={{ maxWidth: 880 }}>
      <h2>Ajouter une recette</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label>Nom</label>
          <input className="input" value={form.name} onChange={handleChange("name")} />
        </div>

        <div className="form-field">
          <label>Catégorie</label>
          <input className="input" value={form.category} onChange={handleChange("category")} />
        </div>

        <div className="form-field">
          <label>Description</label>
          <textarea className="input" value={form.description} onChange={handleChange("description")} rows={4} />
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
          <input className="input" value={form.imageUrl} onChange={handleChange("imageUrl")} placeholder="/images/monimage.jpg or https://..." />
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" type="submit" disabled={saving}>{saving ? "Ajout…" : "Ajouter"}</button>
          <button type="button" className="btn secondary" onClick={() => navigate("/recipes")}>Annuler</button>
        </div>
      </form>
    </main>
  );
}