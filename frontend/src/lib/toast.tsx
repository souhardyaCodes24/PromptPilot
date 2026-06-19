import toast from "react-hot-toast";

interface ToastContentProps {
  title: string;
  description: string;
  borderColor: string;
}

function ToastContent({ title, description, borderColor }: ToastContentProps) {
  return (
    <div
      style={{
        borderLeft: `3px solid ${borderColor}`,
        paddingLeft: 12,
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 14,
          fontWeight: 600,
          color: "var(--card-foreground)",
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        {title}
      </p>
      <p
        style={{
          margin: "4px 0 0",
          fontSize: 13,
          color: "var(--muted-foreground)",
          lineHeight: 1.4,
        }}
      >
        {description}
      </p>
    </div>
  );
}

export function showErrorToast(title: string, description: string) {
  toast.custom(
    (t) => (
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: "12px 16px",
          minWidth: 300,
          maxWidth: 420,
          opacity: t.visible ? 1 : 0,
          transform: t.visible ? "translateY(0)" : "translateY(-8px)",
          transition: "all 0.3s ease",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      >
        <ToastContent
          title={title}
          description={description}
          borderColor="#ef4444"
        />
      </div>
    ),
    { duration: 5000, position: "top-center" }
  );
}

export function showWarningToast(title: string, description: string) {
  toast.custom(
    (t) => (
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: "12px 16px",
          minWidth: 300,
          maxWidth: 420,
          opacity: t.visible ? 1 : 0,
          transform: t.visible ? "translateY(0)" : "translateY(-8px)",
          transition: "all 0.3s ease",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      >
        <ToastContent
          title={title}
          description={description}
          borderColor="#f59e0b"
        />
      </div>
    ),
    { duration: 5000, position: "top-center" }
  );
}

export function showSuccessToast(title: string, description: string, duration = 3000) {
  toast.custom(
    (t) => (
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: "12px 16px",
          minWidth: 300,
          maxWidth: 420,
          opacity: t.visible ? 1 : 0,
          transform: t.visible ? "translateY(0)" : "translateY(-8px)",
          transition: "all 0.3s ease",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      >
        <ToastContent
          title={title}
          description={description}
          borderColor="#06b6d4"
        />
      </div>
    ),
    { duration, position: "top-center" }
  );
}
