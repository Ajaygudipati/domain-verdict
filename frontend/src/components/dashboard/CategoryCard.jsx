import { ChevronRight } from "lucide-react";

function scoreTone(score) {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-amber-400";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
}

export default function CategoryCard({ icon: Icon, name, score, maximum, description, onClick }) {
  const percentage = Math.min((score / maximum) * 100, 100);

  return (
    <button onClick={onClick} className="group w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white"><Icon size={20} /></div>
        <ChevronRight size={18} className="mt-1 text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-700" />
      </div>
      <p className="mt-5 text-sm font-semibold text-slate-900">{name}</p>
      <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
      <div className="mt-5 flex items-end justify-between"><span className="text-2xl font-bold tracking-tight text-slate-950">{score}<span className="text-sm font-medium text-slate-400">/{maximum}</span></span><span className="text-xs font-semibold text-slate-500">{Math.round(percentage)}%</span></div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${scoreTone(percentage)}`} style={{ width: `${percentage}%` }} /></div>
    </button>
  );
}
