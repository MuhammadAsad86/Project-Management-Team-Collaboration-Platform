import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <App />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#FFFFFF",
            color: "#0F172A",
            border: "1px solid #E2E8F0",
            borderRadius: "16px",
            boxShadow:
              "0 12px 32px rgba(15, 23, 42, 0.12)",
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
            fontWeight: 500,
          },
          success: {
            iconTheme: {
              primary: "#10B981",
              secondary: "#FFFFFF",
            },
          },
          error: {
            iconTheme: {
              primary: "#EF4444",
              secondary: "#FFFFFF",
            },
          },
        }}
      />
    </AuthProvider>
  </BrowserRouter>
);