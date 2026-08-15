import { Palette, Pipette } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, setTheme, palettes, customColor, setCustomThemeColor, hexToRgb, rgbToHex } = useTheme();
  const [hex, setHex] = useState(customColor);
  const [isOpen, setIsOpen] = useState(false);
  const switcherRef = useRef(null);
  const rgb = hexToRgb(customColor) || [0, 244, 81];
  const commitHex = (value) => { const normalized = value.startsWith("#") ? value : `#${value}`; if (hexToRgb(normalized)) { setHex(normalized.toUpperCase()); setCustomThemeColor(normalized); } else setHex(customColor); };
  const updateRgb = (index, value) => { const values = [...rgb]; values[index] = Math.max(0, Math.min(255, Number(value) || 0)); const next = rgbToHex(...values).toUpperCase(); setHex(next); setCustomThemeColor(next); };

  useEffect(() => {
    const closeOnOutsideClick = (event) => { if (!switcherRef.current?.contains(event.target)) setIsOpen(false); };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  return <div ref={switcherRef} className={`theme-switcher ${isOpen ? "is-open" : ""}`}>
    <button type="button" className="theme-trigger" aria-label="Choose interface colour" aria-expanded={isOpen} onClick={() => setIsOpen((open) => !open)}><Palette size={15} aria-hidden="true" /><span className="theme-current" style={{ "--swatch": theme === "custom" ? customColor : palettes.find((palette) => palette.id === theme)?.color }} aria-hidden="true" /></button>
    <div className="theme-picker" role="dialog" aria-label="Colour picker">
      <div className="theme-picker-title"><Pipette size={15} /> Interface colour</div>
      <div className="theme-swatches">{palettes.map((palette) => <button key={palette.id} type="button" title={palette.label} aria-label={`Use ${palette.label} theme`} aria-pressed={theme === palette.id} className={`theme-swatch ${theme === palette.id ? "is-active" : ""}`} style={{ "--swatch": palette.color }} onClick={() => { setTheme(palette.id); setIsOpen(false); }} />)}</div>
      <div className="theme-custom"><label className="theme-color-input" title="Open full colour picker"><input type="color" value={customColor} aria-label="Choose a custom colour" onChange={(event) => { setHex(event.target.value.toUpperCase()); setCustomThemeColor(event.target.value); }} /><span style={{ background: customColor }} /></label><label className="theme-hex"><span>HEX</span><input value={hex} maxLength="7" onChange={(event) => setHex(event.target.value)} onBlur={(event) => commitHex(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} /></label></div>
      <div className="theme-rgb">{["R", "G", "B"].map((label, index) => <label key={label}><span>{label}</span><input type="number" min="0" max="255" value={rgb[index]} onChange={(event) => updateRgb(index, event.target.value)} /></label>)}</div>
    </div>
  </div>;
}
