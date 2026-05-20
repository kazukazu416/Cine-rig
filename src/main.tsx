import React from "react";
import ReactDOM from "react-dom/client";
import { ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "./index.css";
import App from "./App";
import { LandingPage } from "./LandingPage";

const path = window.location.pathname;
const isApp = path === "/app" || path.startsWith("/app/");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {isApp ? (
      <ReactFlowProvider>
        <App />
      </ReactFlowProvider>
    ) : (
      <LandingPage />
    )}
  </React.StrictMode>
);
