import OBR from "@owlbear-rodeo/sdk";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import StatBlock from "./components/StatBlock.tsx";
import "./index.css";

OBR.onReady(async () => {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    createRoot(rootElement).render(
      <StrictMode>
        <StatBlock />
      </StrictMode>,
    );
  }
});
