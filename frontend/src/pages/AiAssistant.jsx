import { Bot, CalendarDays, CheckCircle2, Download, Globe2, LoaderCircle, Network, RotateCcw, Send, ShieldAlert, ShieldCheck, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MainLayout from "../layout/MainLayout";

const API_URL = import.meta.env.VITE_API_URL;
const welcomeMessage = { role: "assistant", text: "Hi, I'm Sentrynx AI. Send me a domain and I will turn its security signals into a clear verdict. You can then ask anything about the report." };

function domainFrom(value) {
  try { return new URL(value.includes("://") ? value : `https://${value}`).hostname.replace(/^www\./, ""); } catch { return ""; }
}

function value(value, fallback = "Not available") { return Array.isArray(value) ? value.length ? value.join(", ") : fallback : value === 0 ? "0" : value || fallback; }

function overview(report) {
  const whois = report.analysis?.whois?.data || {};
  const ip = report.analysis?.ip_intelligence?.data || {};
  return `Scan summary for ${report.scan_info?.domain || "this domain"}:\n\n- Verdict: ${value(report.summary?.verdict)} (${value(report.summary?.overall_score)}/100)\n- Registrar: ${value(whois.registrar)}\n- Created: ${value(whois.creation_date)}\n- Expires: ${value(whois.expiration_date)}\n- IP address: ${value(ip.ip)}\n\nAsk me about ownership, DNS, hosting, certificates, threats, score, or recommended fixes.`;
}

function localReply(question, report) {
  const text = question.toLowerCase();
  const analysis = report.analysis || {};
  const summary = report.summary || {};
  const whois = analysis.whois?.data || {};
  const dns = analysis.dns || {};
  const ssl = analysis.ssl?.data || {};
  const threat = analysis.virustotal?.data || {};
  const ip = analysis.ip_intelligence?.data || {};
  const technology = analysis.technology?.data || {};
  const issues = report.issues || [];
  if (/\bwhois\b|who\s+(is|owns|owned|registered)|registr|owner|ownership|created|creation|registered|expiry|expire|expiration|age|when\s+(was|is)/.test(text)) return `Registration details:\n\n- Registrar: ${value(whois.registrar)}\n- Created: ${value(whois.creation_date)}\n- Expires: ${value(whois.expiration_date)}\n- Nameservers: ${value(whois.name_servers)}\n\nRegistrant identity is often hidden by WHOIS privacy, and the registrar is not necessarily the owner.`;
  if (/\bdns\b|nameserver|name server|\bmx\b|\baaaa?\b|\btxt\b|\bcname\b|record/.test(text)) return `DNS records:\n\n- A: ${value(dns.A)}\n- AAAA: ${value(dns.AAAA)}\n- MX: ${value(dns.MX)}\n- NS: ${value(dns.NS)}\n- TXT: ${value(dns.TXT)}\n- CNAME: ${value(dns.CNAME)}`;
  if (/\bip\b|host(ing|ed)?|server|location|country|organisation|organization|city|cdn|technology|powered/.test(text)) return `Infrastructure details:\n\n- IP: ${value(ip.ip)}\n- Organization: ${value(ip.organization)}\n- Location: ${[ip.city, ip.region, ip.country].filter(Boolean).join(", ") || "Not available"}\n- Web server: ${value(technology.web_server)}\n- CDN: ${value(technology.cdn)}\n- Powered by: ${value(technology.powered_by)}`;
  if (/ssl|https|certificate/.test(text)) return ssl.issued_to ? `Certificate details:\n\n- Issued to: ${ssl.issued_to}\n- Issuer: ${value(ssl.issued_by)}\n- Expires: ${value(ssl.valid_until)}\n- Days remaining: ${value(ssl.days_left)}` : "This scan did not return enough certificate details to assess SSL confidently.";
  if (/virus|malware|threat|blacklist|reputation/.test(text)) return `Threat intelligence reported ${value(threat.malicious, "no available")} malicious detection${Number(threat.malicious) === 1 ? "" : "s"}${threat.reputation != null ? ` and a reputation value of ${threat.reputation}` : ""}.`;
  if (/email|spf|dkim|dmarc|spoof/.test(text)) return `Email protection:\n\n- SPF: ${analysis.spf?.data?.enabled ? "Configured" : "Not confirmed"}\n- DKIM: ${analysis.dkim?.data?.enabled ? "Configured" : "Not detected"}\n- DMARC policy: ${value(analysis.dmarc?.data?.policy)}`;
  if (/safe|trust|visit|legit|scam|phish/.test(text)) return `This domain is rated ${value(summary.verdict)} with a ${value(summary.overall_score)}/100 score. ${Number(summary.overall_score) >= 70 ? "The scan is broadly reassuring, but no automated check can guarantee safety." : "Use caution before sharing sensitive information."}`;
  if (/score|verdict|why|mean/.test(text)) return `The ${value(summary.overall_score)}/100 score combines infrastructure, website security, email authentication, threat intelligence, and domain trust. The current verdict is ${value(summary.verdict)}.`;
  if (/fix|issue|problem|recommend/.test(text)) return issues.length ? `The most important items to review are:\n\n${issues.slice(0, 4).map((item) => `- ${item}`).join("\n")}` : "The completed checks did not report scoring deductions. Keep certificates, DNS, and security headers reviewed regularly.";
  return overview(report);
}

function followUps(question, hasReport) {
  if (!hasReport) return ["google.com", "github.com", "example.com"];
  const text = question.toLowerCase();
  if (/registr|created|owner|whois|expire/.test(text)) return ["Show nameservers", "Where is it hosted?", "Is it safe to visit?"];
  if (/dns|nameserver|record/.test(text)) return ["Who is the registrar?", "Show email security", "What should I fix?"];
  if (/threat|safe|scam|phish/.test(text)) return ["Why this score?", "Show certificate details", "What should I fix?"];
  return ["Who is the registrar?", "When was it created?", "Show DNS records", "Where is it hosted?", "Is it safe to visit?", "What should I fix?"];
}

function Message({ item }) {
  const assistant = item.role === "assistant";
  return <div className={`flex gap-3 ${assistant ? "" : "justify-end"}`}>
    {assistant && <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200"><Bot size={18} /></div>}
    <div className={`max-w-[88%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-6 sm:text-[15px] ${assistant ? "rounded-tl-sm border border-white/10 bg-white/[.07] text-slate-200" : "rounded-tr-sm border border-cyan-300/20 bg-cyan-300/15 text-white"}`}>{item.text}</div>
  </div>;
}

function ScanCard({ icon: Icon, label, value: cardValue, action }) {
  return <button onClick={action} className="group rounded-2xl border border-white/10 bg-white/[.05] p-4 text-left transition hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-cyan-300/[.08]"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[.06] text-cyan-200"><Icon size={17} /></span><p className="mt-4 text-xs font-bold uppercase tracking-[.12em] text-slate-500">{label}</p><p className="mt-1 truncate text-sm font-semibold text-white">{cardValue}</p><p className="mt-2 text-xs text-cyan-300 opacity-0 transition group-hover:opacity-100">Explore evidence</p></button>;
}

export default function AiAssistant() {
  const { token } = useAuth();
  const { state } = useLocation();
  const [input, setInput] = useState("");
  const [report, setReport] = useState(state?.report || null);
  const [progress, setProgress] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = state?.report ? localStorage.getItem(`sentrynx-ai:${state.report.scan_info?.domain}`) : null;
      return saved ? JSON.parse(saved) : [welcomeMessage];
    } catch { return [welcomeMessage]; }
  });
  const [lastQuestion, setLastQuestion] = useState("");
  const [saving, setSaving] = useState(false);
  const streamRef = useRef(null);
  const endRef = useRef(null);
  const storageKey = report ? `sentrynx-ai:${report.scan_info?.domain}` : null;
  const suggestions = useMemo(() => followUps(lastQuestion, Boolean(report)), [lastQuestion, report]);
  const status = scanning ? progress?.stage || "Thinking" : report ? `Analysing ${report.scan_info?.domain || "domain"}` : "Ready to analyse";

  useEffect(() => () => streamRef.current?.close(), []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [messages, scanning, progress]);
  useEffect(() => { if (storageKey && messages.length > 1) localStorage.setItem(storageKey, JSON.stringify(messages)); }, [messages, storageKey]);
  useEffect(() => {
    if (!report?.scan_info?.scan_id || !token) return;
    fetch(`${API_URL}/ai/conversations/${report.scan_info.scan_id}?token=${encodeURIComponent(token)}`)
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (data?.messages?.length) setMessages(data.messages); })
      .catch(() => { /* Local browser history remains available if this request fails. */ });
  }, [report?.scan_info?.scan_id, token]);

  function addAssistant(text) { setMessages((current) => [...current, { role: "assistant", text }]); }
  function clearChat() { setMessages([welcomeMessage]); setLastQuestion(""); }
  function newDomain() { streamRef.current?.close(); setReport(null); setProgress(null); setScanning(false); setInput(""); clearChat(); }

  async function saveConversation() {
    if (!report || !token || !report.scan_info?.scan_id) return;
    setSaving(true);
    try { await fetch(`${API_URL}/ai/conversations/${report.scan_info.scan_id}?token=${encodeURIComponent(token)}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages }) }); } finally { setSaving(false); }
  }

  function downloadConversation() {
    const content = [`Sentrynx AI conversation - ${report?.scan_info?.domain || "New domain"}`, "", ...messages.map((item) => `${item.role === "user" ? "You" : "Sentrynx AI"}:\n${item.text}\n`)].join("\n");
    const url = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
    const link = document.createElement("a"); link.href = url; link.download = `sentrynx-${report?.scan_info?.domain || "conversation"}.txt`; link.click(); URL.revokeObjectURL(url);
  }

  function startScan(domain) {
    let finished = false; setScanning(true); setProgress({ stage: "Starting security scan", completed: 0, total: 13 });
    let stream;
    const fail = (message = "I couldn't complete that scan right now. Please check that the API is running, then try again.") => { if (finished) return; finished = true; stream?.close(); setScanning(false); setProgress(null); addAssistant(message); };
    try {
      stream = new EventSource(`${API_URL}/scan/stream?domain=${encodeURIComponent(domain)}${token ? `&token=${encodeURIComponent(token)}` : ""}`); streamRef.current = stream;
      stream.addEventListener("progress", (event) => { try { setProgress(JSON.parse(event.data)); } catch { /* Ignore malformed updates. */ } });
      stream.addEventListener("complete", (event) => { if (finished) return; try { const result = JSON.parse(event.data); finished = true; stream.close(); setReport(result); setScanning(false); setProgress(null); const saved = localStorage.getItem(`sentrynx-ai:${result.scan_info?.domain}`); if (saved) { try { setMessages(JSON.parse(saved)); } catch { addAssistant(`I've finished checking ${result.scan_info?.domain || domain}. Ask me about any part of the report.`); } } else addAssistant(`I've finished checking ${result.scan_info?.domain || domain}.\n\nVerdict: ${result.summary?.verdict || "Unknown"}\nTrust score: ${result.summary?.overall_score ?? "-"}/100\n\nAsk me about the registrar, DNS records, hosting, threats, or recommended fixes.`); } catch { fail("The scan returned an unreadable result. Please try this domain once more."); } });
      stream.addEventListener("error", () => fail()); stream.onerror = () => { if (stream.readyState === EventSource.CLOSED) fail(); };
    } catch { fail(); }
  }

  async function ask(question) {
    const fallback = localReply(question, report);
    try { const response = await fetch(`${API_URL}/ai/answer`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question, report }) }); const data = response.ok ? await response.json() : null; addAssistant(data?.answer || fallback); } catch { addAssistant(fallback); }
  }

  function send(valueToSend = input) {
    const text = valueToSend.trim(); if (!text || scanning) return;
    setMessages((current) => [...current, { role: "user", text }]); setInput(""); setLastQuestion(text);
    if (!report) { const domain = domainFrom(text); if (!domain) { addAssistant("Please send a domain like example.com (or paste a complete URL)."); return; } startScan(domain); return; }
    window.setTimeout(() => { ask(text); }, 250);
  }

  const whois = report?.analysis?.whois?.data || {}; const ip = report?.analysis?.ip_intelligence?.data || {}; const ssl = report?.analysis?.ssl?.data || {};
  return <MainLayout hero><main className="relative min-h-screen overflow-hidden bg-slate-950 pb-20 pt-4 text-white sm:pt-10"><div className="pointer-events-none absolute inset-0"><div className="absolute left-[8%] top-[-14rem] h-[34rem] w-[34rem] rounded-full bg-cyan-400/15 blur-[120px]" /><div className="absolute bottom-[-16rem] right-[-5%] h-[36rem] w-[36rem] rounded-full bg-indigo-500/20 blur-[130px]" /><div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] bg-[size:52px_52px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" /></div><div className="relative mx-auto max-w-7xl px-5 sm:px-8"><div className="mx-auto max-w-4xl pt-16 text-center sm:pt-20"><p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-bold tracking-[.12em] text-cyan-200"><Sparkles size={14} /> SECURITY INTELLIGENCE, ON DEMAND</p><h1 className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">Your domain scan, <span className="bg-gradient-to-r from-cyan-300 to-indigo-300 bg-clip-text text-transparent">explained clearly.</span></h1><p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">Ask about ownership, DNS, certificates, hosting or threats. Get clear answers backed by the scan evidence.</p></div>
    {report && <section className="mx-auto mt-10 max-w-4xl"><div className="mb-4 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-cyan-200">Scan at a glance</p><h2 className="mt-1 text-xl font-bold">{report.scan_info?.domain}</h2></div><div className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-right"><p className="text-xl font-bold text-cyan-200">{value(report.summary?.overall_score)}</p><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{value(report.summary?.verdict)}</p></div></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><ScanCard icon={CalendarDays} label="Registrar" value={value(whois.registrar)} action={() => send("Who is the registrar and when was it created?")} /><ScanCard icon={Network} label="Hosting IP" value={value(ip.ip)} action={() => send("Where is this domain hosted?")} /><ScanCard icon={ShieldCheck} label="Certificate" value={ssl.issued_by ? "Certificate active" : "Certificate unavailable"} action={() => send("Show certificate details")} /><ScanCard icon={ShieldAlert} label="Findings" value={`${report.issues?.length || 0} need attention`} action={() => send("What should I fix?")} /></div></section>}
    <section className="relative mx-auto mt-10 flex min-h-[540px] max-w-4xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/70 shadow-2xl shadow-slate-950/50 backdrop-blur-xl"><div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent" /><div className="flex items-center justify-between border-b border-white/10 bg-white/[.03] px-5 py-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200"><Bot size={18} /></span><div><p className="text-sm font-bold text-white">Sentrynx AI analyst</p><p className="text-xs text-slate-400">Domain intelligence assistant</p></div></div><div className="flex items-center gap-2"><button onClick={newDomain} title="Scan a new domain" className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"><RotateCcw size={16} /></button><button onClick={clearChat} title="Clear chat" className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"><Trash2 size={16} /></button>{report && <button onClick={downloadConversation} title="Download conversation" className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"><Download size={16} /></button>}<span className="ml-1 hidden items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-cyan-200 sm:inline-flex"><span className={`h-2 w-2 rounded-full ${scanning ? "animate-pulse bg-amber-300" : "bg-emerald-400"}`} /> {status}</span></div></div><div className="flex-1 space-y-5 overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,.12),transparent_34%),rgba(2,6,23,.38)] p-5 sm:p-7">{messages.map((item, index) => <Message key={`${item.role}-${index}`} item={item} />)}{scanning && <div className="flex items-center gap-3 text-sm text-cyan-200"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-300/10"><LoaderCircle size={18} className="animate-spin" /></div><span>{progress?.completed || 0} of {progress?.total || 13} security checks complete...</span></div>}<div ref={endRef} /></div><div className="border-t border-white/10 bg-slate-950/80 p-5 sm:p-6"><div className="mb-4 flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-[.12em] text-slate-500">{report ? "Suggested follow-ups" : "Try a domain"}</p>{report && token && <button onClick={saveConversation} disabled={saving} className="text-xs font-semibold text-cyan-300 hover:text-cyan-100 disabled:opacity-50">{saving ? "Saving..." : "Save conversation"}</button>}</div><div className="mb-5 flex flex-wrap gap-2">{suggestions.map((suggestion) => <button key={suggestion} onClick={() => send(suggestion)} disabled={scanning} className="rounded-lg border border-white/10 bg-white/[.05] px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-cyan-300/40 hover:bg-cyan-300/10 hover:text-cyan-100 disabled:opacity-50">{suggestion}</button>)}</div><form onSubmit={(event) => { event.preventDefault(); send(); }} className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 p-1.5 shadow-inner shadow-black/20 transition focus-within:border-cyan-300/60 focus-within:ring-4 focus-within:ring-cyan-300/10"><span className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-300/10 text-cyan-200"><Globe2 size={17} /></span><input value={input} onChange={(event) => setInput(event.target.value)} disabled={scanning} className="min-w-0 flex-1 bg-transparent px-1 py-2.5 text-sm text-white outline-none placeholder:text-slate-500" placeholder={report ? "Ask a question about this domain..." : "Send a domain, e.g. example.com"} /><button disabled={!input.trim() || scanning} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-300 text-slate-950 transition hover:scale-105 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Send"><Send size={17} /></button></form><p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500"><ShieldCheck size={12} /> Answers use completed scan evidence; no automated check can guarantee safety.</p></div></section><div className="mx-auto mt-5 flex max-w-4xl justify-center gap-5 text-xs text-slate-500"><span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-400" /> 13 security checks</span><span>Clear answers, not jargon</span></div></div></main></MainLayout>;
}
