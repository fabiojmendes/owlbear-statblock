import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { PluginGate } from "./components/PluginGate.tsx";
import { OBRThemeProvider } from "./theme/OBRThemeProvider.tsx";

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <PluginGate>
        <OBRThemeProvider>
          <App />
        </OBRThemeProvider>
      </PluginGate>
    </StrictMode>,
  );
}
