import { FaCheckCircle, FaTimes, FaExclamationCircle, FaInfoCircle } from "react-icons/fa";
import { Toast } from "../hooks/useToast";

interface ToastContainerProps {
  toasts: Toast[];
  dismissToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, dismissToast }) => {
  return (
    <>
      <div
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          maxWidth: "400px",
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              padding: "14px 18px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontSize: "14px",
              fontWeight: "500",
              animation: "slideIn 0.3s ease-out",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              backgroundColor:
                toast.type === "success"
                  ? "#10b981"
                  : toast.type === "error"
                    ? "#ef4444"
                    : toast.type === "warning"
                      ? "#f59e0b"
                      : "#3b82f6",
              color: "white",
              cursor: "pointer",
            }}
            onClick={() => dismissToast(toast.id)}
          >
            {toast.type === "success" && <FaCheckCircle size={18} />}
            {toast.type === "error" && <FaTimes size={18} />}
            {toast.type === "warning" && <FaExclamationCircle size={18} />}
            {toast.type === "info" && <FaInfoCircle size={18} />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};
