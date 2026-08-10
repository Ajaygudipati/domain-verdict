import { Palette } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, setTheme, palettes } = useTheme();
  return <div className="theme-switcher" aria-label="Choose interface colour">
    <Palette size={15} aria-hidden="true" />
    <div className="theme-swatches">
      {palettes.map((palette) => <button key={palette.id} type="button" title={palette.label} aria-label={`Use ${palette.label} theme`} aria-pressed={theme === palette.id} className={`theme-swatch ${theme === palette.id ? "is-active" : ""}`} style={{ "--swatch": palette.color }} onClick={() => setTheme(palette.id)} />)}
    </div>
  </div>;
}
