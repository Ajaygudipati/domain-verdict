import { CheckCircle2 } from "lucide-react";

function scoreTone(score) {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-amber-400";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
}

export default function CategoryCard({ icon: Icon, name, score = 0, max, description }) {
  const safeMaximum = Number(max) || 1;
  const safeScore = Math.min(Math.max(Number(score) || 0, 0), safeMaximum);
  const percentage = Math.round((safeScore / safeMaximum) * 100);

  return (
    <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white"><Icon size={20} /></div>
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${percentage >= 80 ? "bg-emerald-50 text-emerald-700" : percentage >= 60 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}><CheckCircle2 size={13} /> {percentage}%</span>
      </div>
      <p className="mt-5 text-sm font-semibold text-slate-900">{name}</p>
      <p className="mt-1 min-h-10 text-sm leading-5 text-slate-500">{description}</p>
      <div className="mt-5 flex items-end justify-between"><span className="text-3xl font-bold tracking-tight text-slate-950">{safeScore}<span className="text-base font-medium text-slate-400">/{safeMaximum}</span></span><span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Score</span></div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${scoreTone(percentage)}`} style={{ width: `${percentage}%` }} /></div>
    </article>
  );
}
