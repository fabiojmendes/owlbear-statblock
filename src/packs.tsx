import OBR from "@owlbear-rodeo/sdk";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import CustomPacksModal from "./components/CustomPacksModal.tsx";
import { OBRThemeProvider } from "./theme/OBRThemeProvider.tsx";
import "./index.css";

OBR.onReady(async () => {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    createRoot(rootElement).render(
      <StrictMode>
        <OBRThemeProvider>
          <CustomPacksModal />
        </OBRThemeProvider>
      </StrictMode>,
    );
  }
});
