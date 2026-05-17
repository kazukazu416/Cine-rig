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
      top: 56,
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
            background: t.type === "warning" ? "#431407" : "#0f172a",
            border: `1px solid ${t.type === "warning" ? "#c2410c" : "#334155"}`,
            color: t.type === "warning" ? "#fdba74" : "#e2e8f0",
            borderRadius: 6,
            padding: "7px 12px",
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            gap: 10,
            pointerEvents: "all",
            boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
            maxWidth: 420,
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
              opacity: 0.6,
              fontSize: 15,
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
