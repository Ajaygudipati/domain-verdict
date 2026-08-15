import { createContext, useContext, useEffect, useState } from "react";

const palettes = [
  { id: "green", label: "Matrix green", color: "#00ff5a" },
  { id: "cyan", label: "Electric blue", color: "#22d3ee" },
  { id: "violet", label: "Ultraviolet", color: "#a78bfa" },
  { id: "pink", label: "Hot pink", color: "#fb4b9b" },
  { id: "orange", label: "Solar orange", color: "#ff8a38" },
];

const ThemeContext = createContext(null);

const hexToRgb = (hex) => {
  const value = hex.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(value)) return null;
  return [parseInt(value.slice(0, 2), 16), parseInt(value.slice(2, 4), 16), parseInt(value.slice(4, 6), 16)];
};

const rgbToHex = (red, green, blue) => `#${[red, green, blue].map((value) => Number(value).toString(16).padStart(2, "0")).join("")}`;

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("sentrynx-theme") || "green");
  const [customColor, setCustomColor] = useState(() => localStorage.getItem("sentrynx-custom-color") || "#00f451");

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    if (theme === "custom") {
      const [red, green, blue] = hexToRgb(customColor) || [0, 244, 81];
      root.style.setProperty("--neon", customColor);
      root.style.setProperty("--neon-soft", `rgba(${red}, ${green}, ${blue}, .12)`);
      root.style.setProperty("--neon-glow", `rgba(${red}, ${green}, ${blue}, .27)`);
    } else {
      root.style.removeProperty("--neon");
      root.style.removeProperty("--neon-soft");
      root.style.removeProperty("--neon-glow");
    }
    localStorage.setItem("sentrynx-theme", theme);
    localStorage.setItem("sentrynx-custom-color", customColor);
  }, [theme, customColor]);

  function setCustomThemeColor(color) {
    if (!hexToRgb(color)) return;
    setCustomColor(color.toUpperCase());
    setTheme("custom");
  }

  return <ThemeContext.Provider value={{ theme, setTheme, palettes, customColor, setCustomThemeColor, hexToRgb, rgbToHex }}>{children}</ThemeContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
