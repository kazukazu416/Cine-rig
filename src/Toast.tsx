export interface ToastItem {
  id: string;
  message: string;
  type?: "warning" | "info";
}

interface Props {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function Toast({ toasts, onDismiss }: Props) {
  if (toasts.length === 0) return null;
  return (
    <div style={{
      position: "absolute",
      top: 12,
      left: "50%",
      transform: "translateX(-50%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 6,
      zIndex: 200,
      pointerEvents: "none",
    }}>
      {toasts.map(t => (
        <div
          key={t.id}
          style={{
            background: t.type === "warning" ? "#FFF7ED" : "#FFFFFF",
            border: `1px solid ${t.type === "warning" ? "rgba(194,65,12,0.22)" : "rgba(0,0,0,0.10)"}`,
            color: t.type === "warning" ? "#9a3412" : "#1d1d1f",
            borderRadius: 8,
            padding: "7px 12px",
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            gap: 10,
            pointerEvents: "all",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            maxWidth: 420,
            fontFamily: "-apple-system, 'SF Pro Display', Inter, sans-serif",
          }}
        >
          {t.message}
          <button
            onClick={() => onDismiss(t.id)}
            style={{
              background: "none",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              opacity: 0.5,
              fontSize: 15,
              lineHeight: 1,
              flexShrink: 0,
              padding: "0 2px",
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
