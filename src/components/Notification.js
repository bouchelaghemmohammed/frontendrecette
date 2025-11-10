import React, { createContext, useContext, useState, useCallback } from "react";

// afficher des toasts d’erreur/succès.



/*
createContext : pour créer un contexte React (NotificationContext).
useContext : pour consommer ce contexte via le hook useNotification.
useState : pour stocker la liste des notifications à afficher.
useCallback : pour mémoriser les fonctions remove et show (évite recréation à chaque rendu).
*/

const NotificationContext = createContext();
export function useNotification() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const [items, setItems] = useState([]);

  const remove = useCallback((id) => {
    setItems((s) => s.filter((it) => it.id !== id));
  }, []);

   // show pour afficher les nouvelles notifications
  const show = useCallback(({ type = "success", message = "", duration = 3500 }) => {
    const id = Math.random().toString(36).slice(2);
    setItems((s) => [...s, { id, type, message, duration }]);
    setTimeout(() => remove(id), duration + 200);
  }, [remove]);

  return (
   
    <NotificationContext.Provider value={{ show }}>
      {children}

      {/* top-right container */}
      <div style={{
        position: "fixed",
        top: 18,
        right: 18,
        zIndex: 9999,
        pointerEvents: "none",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        alignItems: "flex-end",
        width: "auto",
        maxWidth: "min(420px, calc(100% - 36px))"
      }}>
        {items.map(it => (
          <div
            key={it.id}
            className={`notif-banner ${it.type === "success" ? "notif-success" : "notif-error"}`}
            style={{
              pointerEvents: "auto",
              width: "100%",
              background: "#fff",
              borderRadius: 10,
              boxShadow: "0 10px 30px rgba(10,20,40,0.08)",
              overflow: "hidden",
              borderLeft: it.type === "success" ? "6px solid #10b981" : "6px solid #ef4444",
            }}
            role="status"
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px" }}>
              <div style={{
                width: 36, height: 36, borderRadius: 999,
                background: it.type === "success" ? "linear-gradient(90deg,#ecfdf5,#d1fae5)" : "linear-gradient(90deg,#fff1f0,#fee2e2)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18
              }}>
                {it.type === "success" ? "✅" : "❌"}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#063251" }}>{it.message}</div>
              </div>

              <button
                onClick={() => remove(it.id)}
                aria-label="Fermer la notification"
                style={{
                  background: "transparent", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 18
                }}
              >
                ✖
              </button>
            </div>

            {/* Progress bar */}
            <div style={{ height: 6, width: "100%", background: "rgba(0,0,0,0.04)" }}>
              <div
                style={{
                  height: "100%",
                  width: 0,
                  background: it.type === "success" ? "linear-gradient(90deg,#34d399,#60a5fa)" : "linear-gradient(90deg,#f87171,#fb7185)",
                  transition: `width ${it.duration}ms linear`,
                  animation: `progressFill ${it.duration}ms linear forwards`
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes progressFill {
          from { width: 0; }
          to { width: 100%; }
        }
        @media (max-width:520px) {
          .notif-banner { max-width: calc(100vw - 32px); }
        }
      `}</style>
    </NotificationContext.Provider>
  );
}