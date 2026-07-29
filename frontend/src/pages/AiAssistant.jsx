import { ArrowLeft, Bot, CheckCircle2, Globe2, LoaderCircle, Send, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function domainFrom(value) {
  try {
    const url = new URL(value.includes("://") ? value : `https://${value}`);
    return url.hostname.replace(/^www\./, "");
  } catch { return ""; }
}

function reply(question, report) {
  const text = question.toLowerCase();
  const summary = report.summary || {};
  const analysis = report.analysis || {};
  const issues = report.issues || [];
  const threat = analysis.virustotal?.data || {};
  const ssl = analysis.ssl?.data || {};
  if (/safe|trust|visit|legit|scam|phish/.test(text)) return `This domain is rated ${summary.verdict || "Unknown"} with a ${summary.overall_score ?? "—"}/100 score. ${Number(summary.overall_score) >= 70 ? "The scan is broadly reassuring, but no automated check can guarantee safety." : "Use caution before sharing sensitive information."}`;
  if (/score|verdict|why|mean/.test(text)) return `The ${summary.overall_score ?? "—"}/100 score combines infrastructure, website security, email authentication, threat intelligence, and domain trust. The current verdict is ${summary.verdict || "Unknown"}.`;
  if (/virus|malware|threat|blacklist|reputation/.test(text)) return `Threat intelligence reported ${threat.malicious ?? "no available"} malicious detection${Number(threat.malicious) === 1 ? "" : "s"}${threat.reputation != null ? ` and a reputation value of ${threat.reputation}` : ""}.`;
  if (/ssl|https|certificate/.test(text)) return ssl.issued_to ? `The certificate is issued to ${ssl.issued_to} by ${ssl.issued_by || "the reported issuer"}, with ${ssl.days_left ?? "an unknown number of"} days remaining.` : "This scan did not return enough certificate details to assess SSL confidently.";
  if (/email|spf|dkim|dmarc|spoof/.test(text)) return `SPF is ${analysis.spf?.data?.enabled ? "configured" : "not confirmed"}, DKIM is ${analysis.dkim?.data?.enabled ? "configured" : "not detected"}, and DMARC policy is ${analysis.dmarc?.data?.policy || "not reported"}.`;
  if (/fix|issue|problem|recommend/.test(text)) return issues.length ? `The most important items to review are: ${issues.slice(0, 3).join(" • ")}` : "The completed checks did not report scoring deductions. Keep certificates, DNS, and security headers reviewed regularly.";
  return "I can explain safety, score, threats, SSL, email security, and recommended fixes. What would you like to know?";
}

function Message({ item }) {
  const assistant = item.role === "assistant";
  return <div className={`flex gap-3 ${assistant ? "" : "justify-end"}`}>
    {assistant && <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-200"><Bot size={18} /></div>}
    <div className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-6 sm:text-[15px] ${assistant ? "rounded-tl-sm border border-slate-100 bg-white text-slate-700 shadow-sm" : "rounded-tr-sm bg-slate-950 text-white"}`}>{item.text}</div>
  </div>;
}

export default function AiAssistant() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [input, setInput] = useState("");
  const [report, setReport] = useState(null);
  const [progress, setProgress] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [messages, setMessages] = useState([{ role: "assistant", text: "Hi, I’m Sentrynx AI. ✨\n\nSend me a domain and I’ll turn its security signals into a clear verdict. Then you can ask me anything about it." }]);
  const streamRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => () => streamRef.current?.close(), []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [messages, scanning, progress]);

  function addAssistant(text) { setMessages((current) => [...current, { role: "assistant", text }]); }

  function startScan(domain) {
    let finished = false;
    setScanning(true);
    setProgress({ stage: "Starting security scan", completed: 0, total: 13 });
    let stream;
    const fail = (message = "I couldn’t complete that scan right now. Please check that the API is running, then try again.") => {
      if (finished) return;
      finished = true;
      stream?.close();
      setScanning(false);
      setProgress(null);
      addAssistant(message);
    };
    try {
      stream = new EventSource(`${import.meta.env.VITE_API_URL}/scan/stream?domain=${encodeURIComponent(domain)}${token ? `&token=${encodeURIComponent(token)}` : ""}`);
      streamRef.current = stream;
      stream.addEventListener("progress", (event) => {
        try { setProgress(JSON.parse(event.data)); } catch { /* ignore malformed progress update */ }
      });
      stream.addEventListener("complete", (event) => {
        if (finished) return;
        try {
          const result = JSON.parse(event.data);
          finished = true;
          stream.close();
          setReport(result);
          setScanning(false);
          setProgress(null);
          const summary = result.summary || {};
          const issues = result.issues || [];
          const emoji = Number(summary.overall_score) >= 70 ? "✅" : Number(summary.overall_score) >= 45 ? "🧐" : "🚨";
          addAssistant(`${emoji} I’ve finished checking ${result.scan_info?.domain || domain}.\n\nVerdict: ${summary.verdict || "Unknown"}\nTrust score: ${summary.overall_score ?? "—"}/100\n\n${issues[0] || "No material scoring deductions were reported."}\n\nAsk me why it received this score, whether it’s safe, or what should be fixed.`);
        } catch { fail("The scan returned an unreadable result. Please try this domain once more."); }
      });
      stream.addEventListener("error", () => fail());
      stream.onerror = () => { if (stream.readyState === EventSource.CLOSED) fail(); };
    } catch { fail(); }
  }

  function send(value = input) {
    const text = value.trim();
    if (!text || scanning) return;
    setMessages((current) => [...current, { role: "user", text }]);
    setInput("");
    if (!report) {
      const domain = domainFrom(text);
      if (!domain) { addAssistant("Please send a domain like example.com (or paste a complete URL)."); return; }
      startScan(domain);
      return;
    }
    window.setTimeout(() => addAssistant(reply(text, report)), 350);
  }

  const suggestions = report ? ["Is it safe to visit?", "Why this score?", "Any threats found?", "What should I fix?"] : ["google.com", "github.com", "example.com"];
  const status = scanning ? progress?.stage || "Thinking" : report ? `Analysing ${report.scan_info?.domain || "domain"}` : "Ready to analyse";

  return <main className="min-h-screen bg-[#f8fafc] text-slate-950">
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-5 sm:px-8">
      <header className="flex items-center justify-between"><button onClick={() => navigate("/")} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-slate-500 hover:bg-white hover:text-slate-950"><ArrowLeft size={17} /> Back home</button><div className="flex items-center gap-2 text-sm font-bold"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white"><Sparkles size={16} /></span> Domaini AI</div></header>
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col pt-10 sm:pt-16"><div className="mb-7 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 text-white shadow-xl shadow-indigo-200"><Bot size={30} /></div><h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">Ask anything about a domain.</h1><p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">A chat-style security analyst that explains your domain scan in plain language.</p></div>
        <section className="flex min-h-[420px] flex-1 flex-col rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50"><div className="border-b border-slate-100 px-5 py-4"><span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-violet-700"><span className={`h-2 w-2 rounded-full ${scanning ? "animate-pulse bg-amber-400" : "bg-emerald-500"}`} /> {status}</span></div><div className="flex-1 space-y-5 overflow-y-auto bg-[radial-gradient(circle_at_top_right,#eef2ff,transparent_34%),#f8fafc] p-5 sm:p-7">{messages.map((item, index) => <Message key={`${item.role}-${index}`} item={item} />)}{scanning && <div className="flex items-center gap-3 text-sm text-violet-700"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100"><LoaderCircle size={18} className="animate-spin" /></div><span>{progress?.completed || 0} of {progress?.total || 13} security checks complete…</span></div>}<div ref={endRef} /></div><div className="border-t border-slate-100 p-4 sm:p-5"><div className="mb-3 flex gap-2 overflow-x-auto pb-1">{suggestions.map((suggestion) => <button key={suggestion} onClick={() => send(suggestion)} disabled={scanning} className="whitespace-nowrap rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700 hover:bg-violet-100 disabled:opacity-50">{suggestion}</button>)}</div><form onSubmit={(event) => { event.preventDefault(); send(); }} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5 focus-within:border-violet-300 focus-within:ring-4 focus-within:ring-violet-100"><Globe2 size={18} className="ml-2 text-slate-400" /><input value={input} onChange={(event) => setInput(event.target.value)} disabled={scanning} className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-sm outline-none placeholder:text-slate-400" placeholder={report ? "Ask a question about this domain…" : "Send a domain, e.g. example.com"} /><button disabled={!input.trim() || scanning} className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Send"><Send size={17} /></button></form><p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400"><ShieldCheck size={12} /> Explanations use the completed scan and are not a guarantee of safety.</p></div></section>
        <div className="mt-5 flex justify-center gap-5 text-xs text-slate-400"><span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-500" /> 13 security checks</span><span>Clear answers, not jargon</span></div>
      </div>
    </div>
  </main>;
}
