import OBR from "@owlbear-rodeo/sdk";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

export const ID = "pro.juzam.statblock";

OBR.onReady(async () => {
  const isGM = (await OBR.player.getRole()) === "GM";

  const rootElement = document.getElementById("root");
  if (rootElement) {
    createRoot(rootElement).render(
      <StrictMode>
        <App isGM={isGM} />
      </StrictMode>,
    );
  }
});
