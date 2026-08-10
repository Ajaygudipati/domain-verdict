import { createContext, useContext, useEffect, useState } from "react";

const palettes = [
  { id: "green", label: "Matrix green", color: "#00ff5a" },
  { id: "cyan", label: "Electric blue", color: "#22d3ee" },
  { id: "violet", label: "Ultraviolet", color: "#a78bfa" },
  { id: "pink", label: "Hot pink", color: "#fb4b9b" },
  { id: "orange", label: "Solar orange", color: "#ff8a38" },
];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("sentrynx-theme") || "green");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("sentrynx-theme", theme);
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme, palettes }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
