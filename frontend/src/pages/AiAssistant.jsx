import { Bot, CheckCircle2, Globe2, LoaderCircle, Send, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import MainLayout from "../layout/MainLayout";

function domainFrom(value) {
  try {
    const url = new URL(value.includes("://") ? value : `https://${value}`);
    return url.hostname.replace(/^www\./, "");
  } catch { return ""; }
}

function valueOrUnknown(value, label = "Not available") {
  if (Array.isArray(value)) return value.length ? value.join(", ") : label;
  return value === 0 ? "0" : value || label;
}

function reportOverview(report) {
  const summary = report.summary || {};
  const analysis = report.analysis || {};
  const whois = analysis.whois?.data || {};
  const ip = analysis.ip_intelligence?.data || {};
  return `Here is the scan summary for ${report.scan_info?.domain || "this domain"}:\n\n• Verdict: ${valueOrUnknown(summary.verdict)} (${valueOrUnknown(summary.overall_score)}/100)\n• Registrar: ${valueOrUnknown(whois.registrar)}\n• Created: ${valueOrUnknown(whois.creation_date)}\n• Expires: ${valueOrUnknown(whois.expiration_date)}\n• IP address: ${valueOrUnknown(ip.ip)}\n\nYou can ask about ownership, DNS, hosting, certificate, email protection, threats, score, or fixes.`;
}

function reply(question, report) {
  const text = question.toLowerCase();
  const summary = report.summary || {};
  const analysis = report.analysis || {};
  const issues = report.issues || [];
  const whois = analysis.whois?.data || {};
  const dns = analysis.dns || {};
  const threat = analysis.virustotal?.data || {};
  const ssl = analysis.ssl?.data || {};
  const ip = analysis.ip_intelligence?.data || {};
  const technology = analysis.technology?.data || {};
  const headers = analysis.security_headers?.data || {};
  const registrationQuestion = /\bwhois\b|who\s+(is|owns|owned|registered)|registr|owner|ownership|created|creation|registered|expiry|expire|expiration|age|when\s+(was|is)/.test(text);
  const dnsQuestion = /\bdns\b|nameserver|name server|\bmx\b|\baaaa?\b|\btxt\b|\bcname\b|record/.test(text);
  const hostingQuestion = /\bip\b|host(ing|ed)?|server|location|country|organisation|organization|city|cdn|technology|powered/.test(text);
  const overviewQuestion = /^(help|summary|overview|details|information|tell me (everything|about))\b/.test(text);

  if (overviewQuestion) return reportOverview(report);
  if (registrationQuestion) {
    const details = [`Registrar: ${valueOrUnknown(whois.registrar)}`, `Created: ${valueOrUnknown(whois.creation_date)}`, `Expires: ${valueOrUnknown(whois.expiration_date)}`, `Nameservers: ${valueOrUnknown(whois.name_servers)}`];
    if (/who\s+(is|owns|owned)|registrant|owner/.test(text)) details.push("Registrant identity: WHOIS data returned by this scan does not include a verified registrant name. Many domains use privacy protection, so the registrar is not necessarily the owner.");
    return `Registration details for ${report.scan_info?.domain || "this domain"}:\n\n${details.map((item) => `• ${item}`).join("\n")}`;
  }
  if (dnsQuestion) return `DNS records for ${report.scan_info?.domain || "this domain"}:\n\n• A: ${valueOrUnknown(dns.A)}\n• AAAA: ${valueOrUnknown(dns.AAAA)}\n• MX: ${valueOrUnknown(dns.MX)}\n• NS: ${valueOrUnknown(dns.NS)}\n• TXT: ${valueOrUnknown(dns.TXT)}\n• CNAME: ${valueOrUnknown(dns.CNAME)}`;
  if (hostingQuestion) return `Infrastructure details for ${report.scan_info?.domain || "this domain"}:\n\n• IP address: ${valueOrUnknown(ip.ip)}\n• Organization: ${valueOrUnknown(ip.organization)}\n• Location: ${[ip.city, ip.region, ip.country].filter(Boolean).join(", ") || "Not available"}\n• Web server: ${valueOrUnknown(technology.web_server)}\n• CDN: ${valueOrUnknown(technology.cdn)}\n• Powered by: ${valueOrUnknown(technology.powered_by)}`;
  if (/safe|trust|visit|legit|scam|phish/.test(text)) return `This domain is rated ${summary.verdict || "Unknown"} with a ${summary.overall_score ?? "-"}/100 score. ${Number(summary.overall_score) >= 70 ? "The scan is broadly reassuring, but no automated check can guarantee safety." : "Use caution before sharing sensitive information."}`;
  if (/score|verdict|why|mean/.test(text)) return `The ${summary.overall_score ?? "-"}/100 score combines infrastructure, website security, email authentication, threat intelligence, and domain trust. The current verdict is ${summary.verdict || "Unknown"}.`;
  if (/virus|malware|threat|blacklist|reputation/.test(text)) return `Threat intelligence reported ${threat.malicious ?? "no available"} malicious detection${Number(threat.malicious) === 1 ? "" : "s"}${threat.reputation != null ? ` and a reputation value of ${threat.reputation}` : ""}.`;
  if (/ssl|https|certificate/.test(text)) return ssl.issued_to ? `The certificate is issued to ${ssl.issued_to} by ${ssl.issued_by || "the reported issuer"}, with ${ssl.days_left ?? "an unknown number of"} days remaining.` : "This scan did not return enough certificate details to assess SSL confidently.";
  if (/email|spf|dkim|dmarc|spoof/.test(text)) return `SPF is ${analysis.spf?.data?.enabled ? "configured" : "not confirmed"}, DKIM is ${analysis.dkim?.data?.enabled ? "configured" : "not detected"}, and DMARC policy is ${analysis.dmarc?.data?.policy || "not reported"}.`;
  if (/header|content-security|hsts|x-frame/.test(text)) return Object.keys(headers).length ? `Security-header results:\n\n${Object.entries(headers).map(([name, result]) => `• ${name}: ${valueOrUnknown(result)}`).join("\n")}` : "No security-header evidence was returned by this scan.";
  if (/fix|issue|problem|recommend/.test(text)) return issues.length ? `The most important items to review are: ${issues.slice(0, 3).join(" • ")}` : "The completed checks did not report scoring deductions. Keep certificates, DNS, and security headers reviewed regularly.";
  return `${reportOverview(report)}\n\nI answer from the scan evidence, so I will be clear when a detail was not returned.`;
}

function Message({ item }) {
  const assistant = item.role === "assistant";
  return <div className={`flex gap-3 ${assistant ? "" : "justify-end"}`}>
    {assistant && <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200 shadow-lg shadow-cyan-950/30"><Bot size={18} /></div>}
    <div className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-6 sm:text-[15px] ${assistant ? "rounded-tl-sm border border-white/10 bg-white/[.07] text-slate-200 shadow-sm" : "rounded-tr-sm border border-cyan-300/20 bg-cyan-300/15 text-white"}`}>{item.text}</div>
  </div>;
}

export default function AiAssistant() {
  const { token } = useAuth();
  const [input, setInput] = useState("");
  const [report, setReport] = useState(null);
  const [progress, setProgress] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [messages, setMessages] = useState([{ role: "assistant", text: "Hi, I'm Sentrynx AI.\n\nSend me a domain and I'll turn its security signals into a clear verdict. Then you can ask me anything about it." }]);
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
    const fail = (message = "I couldn't complete that scan right now. Please check that the API is running, then try again.") => {
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
      stream.addEventListener("progress", (event) => { try { setProgress(JSON.parse(event.data)); } catch { /* Ignore a malformed update. */ } });
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
          addAssistant(`I've finished checking ${result.scan_info?.domain || domain}.\n\nVerdict: ${summary.verdict || "Unknown"}\nTrust score: ${summary.overall_score ?? "-"}/100\n\n${issues[0] || "No material scoring deductions were reported."}\n\nAsk me why it received this score, whether it's safe, or what should be fixed.`);
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

  const suggestions = report ? ["Who is the registrar?", "When was it created?", "Show DNS records", "Where is it hosted?", "Is it safe to visit?", "What should I fix?"] : ["google.com", "github.com", "example.com"];
  const status = scanning ? progress?.stage || "Thinking" : report ? `Analysing ${report.scan_info?.domain || "domain"}` : "Ready to analyse";

  return <MainLayout hero><main className="relative min-h-screen overflow-hidden bg-slate-950 pb-20 pt-4 text-white sm:pt-10">
    <div className="pointer-events-none absolute inset-0"><div className="absolute left-[8%] top-[-14rem] h-[34rem] w-[34rem] rounded-full bg-cyan-400/15 blur-[120px]" /><div className="absolute bottom-[-16rem] right-[-5%] h-[36rem] w-[36rem] rounded-full bg-indigo-500/20 blur-[130px]" /><div className="absolute inset-0 opacity-70 bg-[linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] bg-[size:52px_52px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" /></div>
    <div className="relative mx-auto max-w-7xl px-5 sm:px-8"><div className="mx-auto max-w-4xl pt-16 text-center sm:pt-20"><p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-bold tracking-[.12em] text-cyan-200"><Sparkles size={14} /> SECURITY INTELLIGENCE, ON DEMAND</p><h1 className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">Your domain scan, <span className="bg-gradient-to-r from-cyan-300 to-indigo-300 bg-clip-text text-transparent">explained clearly.</span></h1><p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">Ask about ownership, DNS, certificates, hosting or threats. Sentrynx AI turns the evidence into the answer you need.</p><div className="mt-7 flex flex-wrap justify-center gap-x-5 gap-y-3 text-xs font-medium text-slate-400"><span className="flex items-center gap-2"><ShieldCheck size={16} className="text-emerald-400" /> Grounded in live scan evidence</span><span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-cyan-300" /> 13 security checks, one conversation</span></div></div>
      <section className="relative mx-auto mt-12 flex min-h-[540px] max-w-4xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/70 shadow-2xl shadow-slate-950/50 backdrop-blur-xl"><div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent" /><div className="flex items-center justify-between border-b border-white/10 bg-white/[.03] px-5 py-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200"><Bot size={18} /></span><div><p className="text-sm font-bold text-white">Sentrynx AI analyst</p><p className="text-xs text-slate-400">Domain intelligence assistant</p></div></div><span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-cyan-200"><span className={`h-2 w-2 rounded-full ${scanning ? "animate-pulse bg-amber-300" : "bg-emerald-400"}`} /> {status}</span></div><div className="flex-1 space-y-5 overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,.12),transparent_34%),rgba(2,6,23,.38)] p-5 sm:p-7">{messages.map((item, index) => <Message key={`${item.role}-${index}`} item={item} />)}{scanning && <div className="flex items-center gap-3 text-sm text-cyan-200"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-300/10"><LoaderCircle size={18} className="animate-spin" /></div><span>{progress?.completed || 0} of {progress?.total || 13} security checks complete...</span></div>}<div ref={endRef} /></div><div className="border-t border-white/10 bg-slate-950/80 p-5 sm:p-6"><div className="mb-4 flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-[.12em] text-slate-500">Suggested questions</p><span className="text-[11px] text-slate-600">Choose one or type your own</span></div><div className="mb-5 flex flex-wrap gap-2">{suggestions.map((suggestion) => <button key={suggestion} onClick={() => send(suggestion)} disabled={scanning} className="rounded-lg border border-white/10 bg-white/[.05] px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-cyan-300/40 hover:bg-cyan-300/10 hover:text-cyan-100 disabled:opacity-50">{suggestion}</button>)}</div><form onSubmit={(event) => { event.preventDefault(); send(); }} className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 p-1.5 shadow-inner shadow-black/20 transition focus-within:border-cyan-300/60 focus-within:ring-4 focus-within:ring-cyan-300/10"><span className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-300/10 text-cyan-200"><Globe2 size={17} /></span><input value={input} onChange={(event) => setInput(event.target.value)} disabled={scanning} className="min-w-0 flex-1 bg-transparent px-1 py-2.5 text-sm text-white outline-none placeholder:text-slate-500" placeholder={report ? "Ask a question about this domain..." : "Send a domain, e.g. example.com"} /><button disabled={!input.trim() || scanning} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-300 text-slate-950 transition hover:scale-105 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Send"><Send size={17} /></button></form><p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500"><ShieldCheck size={12} /> Answers use the completed scan; no automated check can guarantee safety.</p></div></section></div>
  </main></MainLayout>;
}
