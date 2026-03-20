import {
  CssBaseline,
  createTheme,
  StyledEngineProvider,
  ThemeProvider,
} from "@mui/material";
import OBR, { type Theme as OBRTheme } from "@owlbear-rodeo/sdk";
import { type ReactNode, useEffect, useMemo, useState } from "react";

interface OBRThemeProviderProps {
  children: ReactNode;
}

export function OBRThemeProvider({ children }: OBRThemeProviderProps) {
  const [obrTheme, setObrTheme] = useState<OBRTheme | null>(null);

  useEffect(() => {
    // Initial fetch
    OBR.theme.getTheme().then(setObrTheme);

    // Subscribe to changes
    return OBR.theme.onChange(setObrTheme);
  }, []);

  const muiTheme = useMemo(() => {
    if (!obrTheme) return createTheme({ palette: { mode: "dark" } });

    return createTheme({
      palette: obrTheme
        ? {
            mode: obrTheme.mode === "LIGHT" ? "light" : "dark",
            text: obrTheme.text,
            primary: obrTheme.primary,
            secondary: obrTheme.secondary,
            background: obrTheme?.background,
          }
        : undefined,
      shape: {
        borderRadius: 16,
      },
      components: {
        MuiButtonBase: {
          defaultProps: {
            disableRipple: true,
          },
        },
      },
    });
  }, [obrTheme]);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
