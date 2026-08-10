import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, ArrowRight, BadgeCheck, Check, ChevronRight, CircleAlert, Globe2, Radar, ScanSearch, ShieldCheck, Sparkles, TimerReset } from "lucide-react";
import SearchBar from "../SearchBar/SearchBar";

const demos = [
  {
    label: "Established site",
    domain: "northstar.com",
    score: 94,
    verdict: "LOW RISK",
    tone: "emerald",
    findings: ["HTTPS certificate is valid", "DMARC enforcement enabled", "No threat feeds reported a flag"],
  },
  {
    label: "New domain",
    domain: "example-store.net",
    score: 68,
    verdict: "MEDIUM RISK",
    tone: "amber",
    findings: ["Domain registration is recent", "DMARC policy needs strengthening", "Security-header coverage is incomplete"],
  },
  {
    label: "Threat detected",
    domain: "suspicious-example.site",
    score: 31,
    verdict: "HIGH RISK",
    tone: "rose",
    findings: ["Threat-intelligence flag detected", "Domain age is unavailable", "Email authentication is missing"],
  },
];

const toneStyles = {
  emerald: { score: "text-emerald-400", badge: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300", bar: "bg-emerald-400", ring: "stroke-emerald-400" },
  amber: { score: "text-amber-300", badge: "border-amber-300/25 bg-amber-300/10 text-amber-200", bar: "bg-amber-300", ring: "stroke-amber-300" },
  rose: { score: "text-rose-300", badge: "border-rose-300/25 bg-rose-300/10 text-rose-200", bar: "bg-rose-300", ring: "stroke-rose-300" },
};

function LiveReport() {
  const [active, setActive] = useState(0);
  const report = demos[active];
  const style = toneStyles[report.tone];

  return <motion.div initial={{ opacity: 0, y: 26, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: .22, duration: .75, ease: [0.16, 1, .3, 1] }} className="relative mx-auto w-full max-w-lg">
    <div className="absolute -inset-5 -z-10 rounded-[2.5rem] bg-gradient-to-br from-cyan-400/20 via-indigo-500/20 to-fuchsia-500/20 blur-3xl" />
    <div className="terminal-preview relative overflow-hidden rounded-[1.25rem] border border-white/10 bg-slate-950 shadow-2xl shadow-slate-950/40"><motion.div animate={{ y: ["-100%", "420%"] }} transition={{ duration: 4.5, ease: "linear", repeat: Infinity, repeatDelay: 1.5 }} className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cyan-300/0 via-cyan-300/10 to-cyan-300/0" />
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-white"><div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10"><Radar size={15} /></div> Live verdict preview</div>
        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" /> LIVE</span>
      </div>
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap gap-2">{demos.map((demo, index) => <button key={demo.label} onClick={() => setActive(index)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${index === active ? "border-white bg-white text-slate-950" : "border-white/15 text-slate-400 hover:border-white/40 hover:text-white"}`}>{demo.label}</button>)}</div>
        <div className="mt-6 flex items-start justify-between gap-4"><div className="min-w-0"><p className="truncate text-sm font-medium text-slate-400">{report.domain}</p><p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">Security posture</p></div><span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] ${style.badge}`}>{report.verdict}</span></div>
        <div className="mt-5 grid grid-cols-[auto_1fr] items-center gap-5"><div className="relative flex h-24 w-24 items-center justify-center"><svg className="absolute h-24 w-24 -rotate-90"><circle cx="48" cy="48" r="41" fill="none" stroke="currentColor" strokeWidth="6" className="text-white/10" /><circle cx="48" cy="48" r="41" fill="none" strokeWidth="6" strokeLinecap="round" strokeDasharray="258" strokeDashoffset={258 - (258 * report.score) / 100} className={`${style.ring} transition-all duration-500`} /></svg><span className={`text-3xl font-bold ${style.score}`}>{report.score}</span></div><div><p className="text-sm font-semibold text-white">Overall trust score</p><p className="mt-1 text-xs leading-5 text-slate-400">A balanced view across the signals that matter most.</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className={`h-full rounded-full transition-all duration-500 ${style.bar}`} style={{ width: `${report.score}%` }} /></div></div></div>
        <div className="mt-6 space-y-2.5 border-t border-white/10 pt-5">{report.findings.map((finding, index) => <div key={finding} className="flex items-center gap-2.5 text-xs text-slate-300"><span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${index === 0 && active === 2 ? "bg-rose-400/15 text-rose-300" : "bg-emerald-400/15 text-emerald-300"}`}>{index === 0 && active === 2 ? <CircleAlert size={12} /> : <Check size={12} />}</span>{finding}</div>)}</div>
      </div>
    </div>
  </motion.div>;
}

export default function Hero() {
  return <>
    <section className="hero-terminal relative overflow-hidden bg-slate-950 px-5 pb-20 pt-32 text-white sm:px-8 sm:pb-28 sm:pt-40">
      <div className="absolute inset-0 -z-0"><div className="absolute left-[10%] top-[-12rem] h-[30rem] w-[30rem] rounded-full bg-cyan-400/15 blur-[110px]" /><div className="absolute bottom-[-14rem] right-[3%] h-[32rem] w-[32rem] rounded-full bg-indigo-500/20 blur-[120px]" /><div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.045)_1px,transparent_1px)] bg-[size:52px_52px] [mask-image:linear-gradient(to_bottom,black,transparent)]" /></div>
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_.95fr] lg:gap-20">
        <div className="max-w-2xl"><div className="terminal-kicker inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-bold tracking-[0.12em]"><Sparkles size={14} /> SENTRYNX / DOMAIN INTELLIGENCE</div><h1 className="terminal-title mt-6 text-4xl font-bold leading-[1.05] sm:text-6xl"><span className="terminal-title-accent">$ ./scan</span><br />know before you trust.</h1><p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg"><span className="mr-2 font-mono" style={{ color: "var(--neon)" }}>&gt;</span>Sentrynx turns complex DNS, certificate, ownership and threat data into one clear verdict—so you can decide what to trust in seconds.</p><div className="mt-8"><SearchBar /></div><div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-xs font-medium text-slate-400"><span className="flex items-center gap-2"><ShieldCheck size={16} style={{ color: "var(--neon)" }} /> No account needed to scan</span><span className="flex items-center gap-2"><TimerReset size={16} style={{ color: "var(--neon)" }} /> Results in under a minute</span></div></div>
        <LiveReport />
      </div>
    </section>

    <section className="border-b border-slate-200 bg-white px-5 py-7 sm:px-8"><div className="mx-auto grid max-w-7xl grid-cols-2 gap-5 sm:grid-cols-4"><div><p className="text-2xl font-bold text-slate-950">13</p><p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">Security checks</p></div><div><p className="text-2xl font-bold text-slate-950">5</p><p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">Score categories</p></div><div><p className="text-2xl font-bold text-slate-950">1</p><p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">Clear verdict</p></div><div><p className="text-2xl font-bold text-slate-950">0</p><p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">Browser extensions</p></div></div></section>

    <section id="about" className="bg-slate-50 px-5 py-20 sm:px-8 sm:py-28"><div className="mx-auto max-w-7xl"><div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-[0.16em] text-indigo-600">One answer, backed by evidence</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Everything a trustworthy domain should prove.</h2><p className="mt-4 text-base leading-7 text-slate-600">We surface the security signals that are easy to miss and explain exactly what they mean for you.</p></div><div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4"><Feature icon={ShieldCheck} title="Threat intelligence" text="Cross-check known malicious and suspicious activity before you click." /><Feature icon={BadgeCheck} title="Certificate health" text="Verify HTTPS, certificate issuer, validity and expiry at a glance." /><Feature icon={Globe2} title="Ownership signals" text="See registrar, domain age, nameservers and core DNS reliability." /><Feature icon={Activity} title="Email defense" text="Review SPF, DKIM and DMARC to understand phishing resilience." /></div></div></section>

    <section className="bg-white px-5 py-20 sm:px-8 sm:py-28"><div className="mx-auto max-w-7xl"><div className="grid items-center gap-10 rounded-[2rem] bg-slate-950 p-7 text-white sm:p-12 lg:grid-cols-[.85fr_1.15fr]"><div><p className="text-sm font-bold uppercase tracking-[0.16em] text-cyan-300">A clearer workflow</p><h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">From a URL to a confident decision.</h2><p className="mt-4 max-w-md leading-7 text-slate-300">A security report should be useful, not overwhelming. Each scan connects the evidence to a practical next step.</p></div><div className="grid gap-4 sm:grid-cols-3"><Step number="01" title="Enter a domain" text="Paste a domain or full website URL." /><Step number="02" title="We verify" text="Our checks run in parallel for speed." /><Step number="03" title="Act on the verdict" text="See risks, evidence and recommended fixes." /></div></div></div></section>

    <section className="px-5 pb-20 sm:px-8 sm:pb-28"><div className="mx-auto flex max-w-7xl flex-col items-center rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white to-indigo-50 px-6 py-16 text-center shadow-sm sm:px-12"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white"><ScanSearch size={23} /></div><h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">A safer click starts with one scan.</h2><p className="mt-4 max-w-xl text-base leading-7 text-slate-600">Check a domain before you sign in, share data, send money, or recommend it to someone else.</p><a href="#top" onClick={(event) => { event.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800">Scan a domain <ArrowRight size={16} /></a></div></section>
  </>;
}

function Feature({ icon: Icon, title, text }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white"><Icon size={20} /></div><h3 className="mt-5 font-bold text-slate-950">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p><span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600">Included in every scan <ChevronRight size={15} /></span></article>;
}

function Step({ number, title, text }) {
  return <div className="rounded-2xl border border-white/10 bg-white/5 p-5"><p className="text-xs font-bold tracking-[0.16em] text-cyan-300">{number}</p><h3 className="mt-5 font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{text}</p></div>;
}
