import { AnimatePresence, motion } from "framer-motion";
import { Check, Globe2, LockKeyhole, Radar, SearchCheck, Server, ShieldCheck, Wifi } from "lucide-react";

const scanSteps = [
  { label: "DNS & infrastructure", icon: Server },
  { label: "SSL & web security", icon: LockKeyhole },
  { label: "Email authentication", icon: Wifi },
  { label: "Threat intelligence", icon: Radar },
];

export default function LoadingOverlay({ loading, progress }) {
  const completed = progress?.completed || 0;
  const total = progress?.total || 13;
  const percentage = Math.min(Math.round((completed / total) * 100), 100);
  const completedSteps = Math.min(Math.floor((completed / total) * scanSteps.length), scanSteps.length);

  return <AnimatePresence>
    {loading && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .25 }} className="scan-overlay fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="scan-overlay-grid absolute inset-0" />
      <motion.section initial={{ opacity: 0, y: 20, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: .98 }} transition={{ duration: .35, ease: [0.16, 1, .3, 1] }} className="scan-console relative w-full max-w-2xl overflow-hidden rounded-3xl border p-5 sm:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full blur-3xl" style={{ background: "var(--neon-soft)" }} />
        <header className="relative flex items-center justify-between border-b border-white/10 pb-5">
          <div className="flex items-center gap-3"><div className="scan-mark flex h-10 w-10 items-center justify-center rounded-xl"><ShieldCheck size={21} /></div><div><p className="font-mono text-sm font-bold tracking-[.14em] text-white">SENTRYNX / SCAN ENGINE</p><p className="mt-1 text-xs text-slate-500">Secure analysis session in progress</p></div></div>
          <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[.03] px-3 py-1.5 font-mono text-xs font-bold" style={{ color: "var(--neon)" }}><span className="h-2 w-2 animate-pulse rounded-full" style={{ background: "var(--neon)" }} /> LIVE</span>
        </header>

        <div className="relative grid items-center gap-7 py-8 sm:grid-cols-[190px_1fr]">
          <div className="relative mx-auto flex h-44 w-44 items-center justify-center">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 7, ease: "linear" }} className="scan-orbit absolute inset-0 rounded-full border border-dashed" />
            <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 4.5, ease: "linear" }} className="scan-orbit-inner absolute inset-5 rounded-full border" />
            <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }} className="scan-shield relative flex h-24 w-24 items-center justify-center rounded-3xl"><ShieldCheck size={44} strokeWidth={1.8} /></motion.div>
            <motion.span animate={{ rotate: [0, 360] }} transition={{ repeat: Infinity, duration: 3.2, ease: "linear" }} className="absolute -top-1 left-1/2 h-3 w-3 rounded-full" style={{ background: "var(--neon)", boxShadow: "0 0 13px var(--neon)" }} />
          </div>
          <div><p className="font-mono text-xs font-bold tracking-[.16em]" style={{ color: "var(--neon)" }}>SCANNING TARGET</p><motion.h2 key={progress?.stage} initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} className="mt-3 text-2xl font-bold text-white sm:text-3xl">{progress?.stage || "Initializing intelligence engine"}</motion.h2><p className="mt-3 text-sm leading-6 text-slate-400">We are checking live infrastructure, security configuration, and threat signals before building your verdict.</p><div className="mt-5 flex items-center gap-3"><div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10"><motion.div className="h-full rounded-full" style={{ background: "var(--neon)", boxShadow: "0 0 15px var(--neon)" }} animate={{ width: `${percentage}%` }} transition={{ duration: .4 }} /></div><span className="font-mono text-sm font-bold" style={{ color: "var(--neon)" }}>{percentage}%</span></div><p className="mt-2 font-mono text-xs text-slate-500">{completed} / {total} SECURITY CHECKS COMPLETE</p></div>
        </div>

        <div className="relative grid gap-2 border-t border-white/10 pt-5 sm:grid-cols-2">
          {scanSteps.map(({ label, icon: Icon }, index) => { const done = index < completedSteps; const active = index === completedSteps && completedSteps < scanSteps.length; return <div key={label} className={`scan-step flex items-center gap-3 rounded-xl border px-3 py-3 ${done ? "is-done" : active ? "is-active" : ""}`}><span className="flex h-7 w-7 items-center justify-center rounded-lg">{done ? <Check size={15} /> : active ? <SearchCheck size={15} className="animate-pulse" /> : <Icon size={15} />}</span><span className="text-xs font-semibold">{label}</span>{active && <span className="ml-auto font-mono text-[10px]" style={{ color: "var(--neon)" }}>RUNNING</span>}</div>; })}
        </div>
        <footer className="relative mt-5 flex items-center gap-2 border-t border-white/10 pt-4 text-xs text-slate-500"><Globe2 size={14} style={{ color: "var(--neon)" }} /> Your report is generated from live signals. Please keep this window open.</footer>
      </motion.section>
    </motion.div>}
  </AnimatePresence>;
}
