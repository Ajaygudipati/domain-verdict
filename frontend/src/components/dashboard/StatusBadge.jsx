const styles = {
  safe: "border-emerald-200 bg-emerald-50 text-emerald-700",
  low: "border-emerald-200 bg-emerald-50 text-emerald-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
  high: "border-orange-200 bg-orange-50 text-orange-700",
  critical: "border-red-200 bg-red-50 text-red-700",
  unknown: "border-slate-200 bg-slate-50 text-slate-600",
};

export default function StatusBadge({ value, className = "" }) {
  const label = String(value || "Unknown").replaceAll("_", " ");
  const normalized = label.toLowerCase();
  const tone = normalized.includes("critical") || normalized.includes("danger")
    ? "critical"
    : normalized.includes("high") || normalized.includes("untrusted")
      ? "high"
      : normalized.includes("medium") || normalized.includes("caution")
        ? "medium"
        : normalized.includes("safe")
          ? "safe"
          : normalized.includes("low") || normalized.includes("trusted")
            ? "low"
            : "unknown";

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold tracking-[0.08em] ${styles[tone]} ${className}`}>
      {label}
    </span>
  );
}
