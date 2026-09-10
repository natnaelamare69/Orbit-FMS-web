import { createContext, type ReactNode, useContext, useMemo, useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

interface ThemeContextValue {
  dark: boolean;
  toggle(): void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** MUI theming with a light/dark toggle and fleet management color palette. */
export function ThemeContextProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem("orbit.theme") === "dark";
    } catch {
      return false;
    }
  });

  const toggle = () => {
    setDark((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("orbit.theme", next ? "dark" : "light");
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: dark ? "dark" : "light",
          primary: {
            main: "#1e40af", // deep fleet indigo
            light: "#3b82f6",
            dark: "#1e3a8a",
          },
          secondary: {
            main: "#0284c7", // sky cyan
          },
          background: {
            default: dark ? "#0f172a" : "#f8fafc",
            paper: dark ? "#1e293b" : "#ffffff",
          },
        },
        typography: {
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          h5: {
            fontWeight: 600,
          },
          h6: {
            fontWeight: 600,
          },
        },
        shape: {
          borderRadius: 8,
        },
      }),
    [dark],
  );

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeContextProvider");
  return ctx;
}