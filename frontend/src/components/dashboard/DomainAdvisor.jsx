import { AnimatePresence, motion } from "framer-motion";
import { Bot, MessageCircle, Send, ShieldCheck, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const openings = {
  safe: ["Looking strong! This domain has built a reassuring security story.", "Nice work — the scan signals are largely healthy and well defended.", "This is a calm result. The important trust indicators are doing their job."],
  caution: ["A few signals deserve a closer look before you fully trust this domain.", "This domain is not a write-off, but it has gaps worth tightening.", "Think of this as a yellow light: proceed thoughtfully and fix the weak spots."],
  danger: ["Heads up — this scan found signals that should not be ignored.", "This result needs attention. Treat the domain carefully until the risks are understood.", "This is a red-flag result. Avoid sharing sensitive information here for now."],
};

function getTone(score, verdict) {
  const label = String(verdict || "").toLowerCase();
  if (label.includes("critical") || label.includes("high") || label.includes("danger") || score < 45) return "danger";
  if (label.includes("medium") || label.includes("caution") || score < 70) return "caution";
  return "safe";
}

function Thinking() {
  return <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-end gap-2">
    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100 text-violet-700"><Bot size={16} /></div>
    <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-slate-100 px-4 py-3">
      {[0, 1, 2].map((dot) => <motion.span key={dot} className="h-1.5 w-1.5 rounded-full bg-violet-500" animate={{ y: [0, -4, 0], opacity: [.35, 1, .35] }} transition={{ duration: .7, repeat: Infinity, delay: dot * .14 }} />)}
    </div>
  </motion.div>;
}

function buildAnswer(question, data = {}) {
  const text = question.toLowerCase();
  const { summary = {}, analysis = {}, issues = [], scan_info: scanInfo = {} } = data;
  const threat = analysis?.virustotal?.data || {};
  const ssl = analysis?.ssl?.data || {};
  const email = analysis?.dmarc?.data || {};
  const tone = getTone(summary?.overall_score, summary?.verdict);
  const safety = tone === "safe" ? "Based on this scan, it looks relatively safe to visit." : tone === "caution" ? "Use normal caution — the scan found items that deserve attention." : "I would avoid entering sensitive data until the flagged items are resolved.";

  if (/safe|trust|visit|legit|scam|phish/.test(text)) return `${safety} The verdict is ${summary?.verdict || "unavailable"} with a ${summary?.overall_score ?? "—"}/100 score. A scan is a point-in-time signal, not a guarantee, so always verify unexpected payment or login requests.`;
  if (/score|verdict|result|mean/.test(text)) return `The ${summary?.overall_score ?? "—"}/100 score summarizes infrastructure, website security, email authentication, threat intelligence, and domain trust. This domain is currently labelled ${summary?.verdict || "Unknown"}.`;
  if (/virus|malware|threat|blacklist|reputation/.test(text)) return `Threat intelligence reports ${threat.malicious ?? "no available"} malicious detections${threat.reputation != null ? ` and a reputation value of ${threat.reputation}` : ""}. ${threat.malicious ? "That is a meaningful warning signal." : "No malicious detection is reassuring, though it is not an absolute guarantee."}`;
  if (/ssl|https|certificate|encrypt/.test(text)) return ssl.issued_to ? `The site presents an SSL/TLS certificate issued to ${ssl.issued_to}, from ${ssl.issued_by || "an unreported issuer"}. It has ${ssl.days_left ?? "an unknown number of"} days remaining. HTTPS protects the connection, but does not by itself prove the business is trustworthy.` : "The scan did not return enough SSL certificate detail to assess it confidently.";
  if (/email|spf|dkim|dmarc|spoof/.test(text)) return `Email protection: SPF is ${analysis?.spf?.data?.enabled ? "configured" : "not confirmed"}, DKIM is ${analysis?.dkim?.data?.enabled ? "configured" : "not detected"}, and DMARC policy is ${email.policy || "not reported"}. Strong email controls make spoofing this domain harder.`;
  if (/who|owner|registrar|age|created|domain/.test(text)) return `The scanned domain is ${scanInfo?.domain || "this domain"}. Its registrar is ${analysis?.whois?.data?.registrar || "not available"}; creation date is ${analysis?.whois?.data?.creation_date || "not available"}. Domain age can be useful context, but it is never proof by itself.`;
  if (/problem|issue|fix|recommend/.test(text)) return issues.length ? `The scan found ${issues.length} item${issues.length === 1 ? "" : "s"} to address: ${issues.slice(0, 3).join(" • ")}` : "No scoring deductions were reported in the completed checks. Keep certificates, DNS records, and security headers reviewed as part of regular maintenance.";
  return `I can help interpret this scan for ${scanInfo?.domain || "the domain"}. Try asking whether it is safe, why the score is ${summary?.overall_score ?? "shown"}, about SSL, email security, threats, ownership, or the reported findings.`;
}

export default function DomainAdvisor({ data = {}, initiallyOpen = false }) {
  const [open, setOpen] = useState(initiallyOpen);
  const [thinking, setThinking] = useState(initiallyOpen);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const timerRef = useRef();
  const bottomRef = useRef();
  const { summary = {}, issues = [] } = data;
  const tone = getTone(summary?.overall_score, summary?.verdict);
  const starter = useMemo(() => {
    const intro = openings[tone][issues.length % openings[tone].length];
    const keyFinding = issues[0] || (tone === "safe" ? "No material scoring deductions were reported." : "Review the report findings below for the full context.");
    return { id: "welcome", from: "ai", text: `${intro}\n\n${tone === "safe" ? "✨" : tone === "caution" ? "🧐" : "🚨"} ${keyFinding}` };
  }, [issues, tone]);

  useEffect(() => () => clearTimeout(timerRef.current), []);
  useEffect(() => {
    if (!initiallyOpen) return undefined;
    timerRef.current = setTimeout(() => { setMessages([starter]); setThinking(false); }, 850);
    return () => clearTimeout(timerRef.current);
  }, [initiallyOpen, starter]);
  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), [messages, thinking]);

  const start = () => {
    setOpen(true);
    if (!messages.length && !thinking) {
      const variedStarter = { ...starter, id: `welcome-${Date.now()}` };
      setThinking(true);
      timerRef.current = setTimeout(() => { setMessages([variedStarter]); setThinking(false); }, 850);
    }
  };
  const ask = (question) => {
    const clean = question.trim();
    if (!clean || thinking) return;
    setMessages((current) => [...current, { id: `user-${Date.now()}`, from: "user", text: clean }]);
    setInput(""); setThinking(true);
    timerRef.current = setTimeout(() => { setMessages((current) => [...current, { id: `ai-${Date.now()}`, from: "ai", text: buildAnswer(clean, data) }]); setThinking(false); }, 700 + Math.min(clean.length * 9, 700));
  };
  const suggestions = ["Is it safe to visit?", "Why this score?", "Any threats found?", "What should be fixed?"];

  return <>
    <button onClick={start} className="group inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-violet-50 focus:outline-none focus:ring-2 focus:ring-white/70">
      <span className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600 text-white"><Sparkles size={15} /><span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-slate-950" /></span> Ask AI about this domain <MessageCircle size={15} className="text-violet-600 transition group-hover:rotate-[-10deg]" />
    </button>
    <AnimatePresence>{open && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-3 backdrop-blur-sm sm:items-center sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <motion.section initial={{ opacity: 0, y: 30, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: .97 }} transition={{ type: "spring", damping: 24, stiffness: 280 }} className="flex max-h-[min(720px,92vh)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="relative overflow-hidden bg-slate-950 px-5 py-5 text-white sm:px-7"><div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-violet-500/30 blur-2xl" /><div className="relative flex items-start justify-between gap-4"><div className="flex gap-3"><motion.div animate={{ rotate: [0, -7, 7, 0] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-violet-200"><Bot /></motion.div><div><p className="text-xs font-bold uppercase tracking-[.16em] text-violet-300">Sentrynx AI</p><h2 className="mt-1 text-lg font-bold">Your domain security co-pilot</h2><p className="mt-1 text-xs text-slate-300">Grounded in this report • {summary?.overall_score ?? "—"}/100 score</p></div></div><button onClick={() => setOpen(false)} className="rounded-xl p-2 text-slate-300 transition hover:bg-white/10 hover:text-white" aria-label="Close AI advisor"><X size={20} /></button></div></div>
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-[radial-gradient(circle_at_100%_0%,#f5f3ff,transparent_30%),#fff] p-5 sm:p-7">
          {messages.map((message) => <motion.div key={message.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex items-end gap-2 ${message.from === "user" ? "justify-end" : ""}`}><>{message.from === "ai" && <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700"><Bot size={16} /></div>}<div className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-6 ${message.from === "user" ? "rounded-br-sm bg-slate-950 text-white" : "rounded-bl-sm border border-slate-100 bg-white text-slate-700 shadow-sm"}`}>{message.text}</div></></motion.div>)}
          {thinking && <Thinking />}<div ref={bottomRef} />
        </div>
        <div className="border-t border-slate-100 bg-white p-4 sm:px-6"><div className="mb-3 flex gap-2 overflow-x-auto pb-1">{suggestions.map((item) => <button key={item} onClick={() => ask(item)} disabled={thinking} className="whitespace-nowrap rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-100 disabled:opacity-50">{item}</button>)}</div><form onSubmit={(event) => { event.preventDefault(); ask(input); }} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5 transition focus-within:border-violet-300 focus-within:ring-4 focus-within:ring-violet-100"><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask anything about this domain…" className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-slate-400" /><button disabled={!input.trim() || thinking} className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Send question"><Send size={17} /></button></form><p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400"><ShieldCheck size={12} /> Answers use the results of this scan; they are not a security guarantee.</p></div>
      </motion.section>
    </motion.div>}</AnimatePresence>
  </>;
}
