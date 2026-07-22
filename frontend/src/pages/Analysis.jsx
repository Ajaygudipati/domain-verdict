import { useLocation, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { Activity, AlertTriangle, ArrowLeft, BadgeCheck, CalendarDays, CheckCircle2, ClipboardCheck, FileWarning, Globe2, LockKeyhole, MailCheck, Network, Radar, ScanSearch, Server, ShieldCheck } from "lucide-react";
import MainLayout from "../layout/MainLayout";
import ScoreCard from "../components/dashboard/ScoreCard";
import CategoryCard from "../components/dashboard/CategoryCard";
import StatusBadge from "../components/dashboard/StatusBadge";

const categoryConfig = [
  { key: "infrastructure", name: "Infrastructure", max: 25, icon: Server, description: "SSL, ownership and domain reliability" },
  { key: "website_security", name: "Website security", max: 20, icon: LockKeyhole, description: "HTTPS and defensive browser headers" },
  { key: "email_security", name: "Email security", max: 15, icon: MailCheck, description: "SPF, DKIM and DMARC protections" },
  { key: "threat_intelligence", name: "Threat intelligence", max: 30, icon: Radar, description: "Reputation and abuse intelligence" },
  { key: "domain_trust", name: "Domain trust", max: 10, icon: ShieldCheck, description: "Registration age and identity signals" },
];

function DetailSection({ icon: Icon, title, status, children }) {
  return <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 p-5">
      <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700"><Icon size={19} /></div><div><h2 className="font-semibold text-slate-950">{title}</h2><p className="text-sm text-slate-500">Scan evidence</p></div></div>
      <StatusBadge value={status} />
    </div>
    <div className="p-5">{children}</div>
  </section>;
}

function Value({ label, value, highlight = false, tone = "slate" }) {
  const tones = {
    slate: "border-slate-100 bg-slate-50",
    green: "border-emerald-100 bg-emerald-50",
    amber: "border-amber-100 bg-amber-50",
    red: "border-red-100 bg-red-50",
  };
  const displayValue = value === 0 ? "0" : value || "Not available";
  return <div className={`rounded-xl border p-3 ${tones[tone]}`}><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p><p className={`mt-1 break-all text-sm ${highlight ? "font-bold text-slate-950" : "font-medium text-slate-700"}`}>{displayValue}</p></div>;
}

export default function Analysis() {
  const { state: data } = useLocation();
  const navigate = useNavigate();

  const recommendations = useMemo(() => Object.values(data?.analysis || {}).flatMap((item) => item?.recommendations || []).filter((item, index, all) => all.indexOf(item) === index), [data]);
  if (!data) return <MainLayout><div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center"><FileWarning size={42} className="text-slate-400" /><h1 className="mt-5 text-3xl font-bold">No scan report found</h1><p className="mt-2 text-slate-500">Run a domain scan to see its security report here.</p><button onClick={() => navigate("/")} className="mt-7 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white">Scan a domain</button></div></MainLayout>;

  const { summary, analysis, scan_info: scanInfo, issues = [] } = data;
  const ssl = analysis.ssl?.data || {};
  const whois = analysis.whois?.data || {};
  const ip = analysis.ip_intelligence?.data || {};
  const threat = analysis.virustotal?.data || {};
  const formatTime = scanInfo.scan_time ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(scanInfo.scan_time)) : "Unknown";

  return <MainLayout>
    <div id="report" className="min-h-screen bg-[#f8fafc] pb-16">
      <div className="mx-auto max-w-7xl px-5 pt-8 sm:px-8">
        <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950"><ArrowLeft size={16} /> New scan</button>
        <header className="mt-5 overflow-hidden rounded-3xl bg-slate-950 px-6 py-8 text-white shadow-xl sm:px-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center"><div><div className="flex flex-wrap items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10"><Globe2 size={21} /></div><StatusBadge value={summary.verdict} className="border-white/15 bg-white/10 text-white" /></div><h1 className="mt-5 break-all text-3xl font-bold tracking-tight sm:text-5xl">{scanInfo.domain}</h1><p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">Security posture assessed across email, infrastructure, website configuration, and global threat-intelligence signals.</p><div className="mt-6 flex flex-wrap gap-5 text-sm text-slate-300"><span className="inline-flex items-center gap-2"><ClipboardCheck size={16} /> {formatTime}</span><span className="inline-flex items-center gap-2"><Activity size={16} /> Confidence: {summary.confidence}</span>{summary.scan_coverage && <span className="inline-flex items-center gap-2"><ScanSearch size={16} /> Sources: {summary.scan_coverage.completed_sources}/{summary.scan_coverage.total_sources}</span>}</div></div><div className="rounded-3xl bg-white p-2"><ScoreCard score={summary.overall_score} verdict={summary.verdict} /></div></div>
        </header>

        <section className="mt-10"><div className="flex items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[0.14em] text-slate-400">Security posture</p><h2 className="mt-1 text-2xl font-bold text-slate-950">Category scores</h2></div><p className="hidden text-sm text-slate-500 sm:block">Every score shows its earned points and category maximum.</p></div><div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{categoryConfig.map((category) => <CategoryCard key={category.key} {...category} score={summary.category_scores?.[category.key] ?? 0} />)}</div></section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
          <div><div className="flex items-center gap-3"><AlertTriangle size={21} className={issues.length ? "text-amber-500" : "text-emerald-500"} /><h2 className="text-2xl font-bold text-slate-950">{issues.length ? "Findings that need attention" : "No material findings"}</h2></div><div className="mt-5 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">{issues.length ? issues.map((issue, index) => <div key={`${issue}-${index}`} className="flex gap-3 rounded-xl p-4"><span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">{index + 1}</span><p className="text-sm leading-6 text-slate-700">{issue}</p></div>) : <div className="flex items-center gap-3 p-5 text-sm text-slate-600"><CheckCircle2 className="text-emerald-500" /> No scoring deductions were reported by the completed checks.</div>}</div></div>
          <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm font-bold uppercase tracking-[0.14em] text-slate-400">Recommended action</p><h2 className="mt-2 text-xl font-bold text-slate-950">Improve the weak signals</h2><div className="mt-5 space-y-4">{recommendations.length ? recommendations.slice(0, 4).map((item) => <div key={item} className="border-l-2 border-slate-900 pl-3 text-sm leading-6 text-slate-600">{item}</div>) : <p className="text-sm leading-6 text-slate-500">The scan did not return any specific configuration recommendations.</p>}</div></aside>
        </section>

        <section className="mt-10"><p className="text-sm font-bold uppercase tracking-[0.14em] text-slate-400">Evidence</p><h2 className="mt-1 text-2xl font-bold text-slate-950">Detailed scan report</h2><p className="mt-2 text-sm text-slate-500">All evidence is visible by default, with the most useful signals highlighted.</p><div className="mt-5 grid gap-4 lg:grid-cols-2">
          <DetailSection icon={LockKeyhole} title="SSL certificate" status={analysis.ssl?.status}><div className="mb-4 flex items-center gap-2 text-sm font-semibold text-emerald-700"><BadgeCheck size={17} /> HTTPS certificate details</div><div className="grid gap-3 sm:grid-cols-2"><Value label="Issued to" value={ssl.issued_to} highlight /><Value label="Issuer" value={ssl.issued_by} /><Value label="Expires" value={ssl.valid_until} highlight tone={ssl.days_left < 14 ? "amber" : "green"} /><Value label="Days remaining" value={ssl.days_left ?? null} highlight tone={ssl.days_left < 14 ? "amber" : "green"} /></div></DetailSection>
          <DetailSection icon={Server} title="Domain ownership" status={analysis.whois?.status}><div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700"><CalendarDays size={17} /> Key registration details</div><div className="grid gap-3 sm:grid-cols-2"><Value label="Registrar" value={whois.registrar} highlight /><Value label="Created" value={whois.creation_date} highlight tone="green" /><Value label="Expires" value={whois.expiration_date} highlight /><Value label="Nameservers" value={Array.isArray(whois.name_servers) ? whois.name_servers.join(", ") : whois.name_servers} /></div></DetailSection>
          <DetailSection icon={MailCheck} title="Email authentication" status={analysis.dmarc?.status}><div className="grid gap-3 sm:grid-cols-3"><Value label="SPF" value={analysis.spf?.status === "success" ? analysis.spf?.data?.enabled ? "Configured" : "Missing" : "Not verified"} highlight tone={analysis.spf?.data?.enabled ? "green" : "amber"} /><Value label="DKIM" value={analysis.dkim?.data?.enabled ? `Configured (${analysis.dkim.data.selector})` : "Not detected"} /><Value label="DMARC policy" value={analysis.dmarc?.data?.policy} highlight tone={analysis.dmarc?.data?.policy ? "green" : "amber"} /></div></DetailSection>
          <DetailSection icon={Radar} title="Threat intelligence" status={analysis.virustotal?.status}><div className="grid gap-3 sm:grid-cols-2"><Value label="VirusTotal reputation" value={threat.reputation} highlight tone={threat.malicious ? "red" : "green"} /><Value label="Malicious detections" value={threat.malicious} highlight tone={threat.malicious ? "red" : "green"} /><Value label="Abuse confidence" value={analysis.abuseipdb?.data?.abuse_confidence_score != null ? `${analysis.abuseipdb.data.abuse_confidence_score}%` : null} highlight /><Value label="Safe Browsing" value={analysis.google_safe_browsing?.status === "success" ? analysis.google_safe_browsing?.data?.unsafe ? "Flagged" : "No flag returned" : "Not verified"} highlight tone={analysis.google_safe_browsing?.data?.unsafe ? "red" : "green"} /></div></DetailSection>
          <DetailSection icon={Network} title="Network & technology" status={analysis.ip_intelligence?.status}><div className="grid gap-3 sm:grid-cols-2"><Value label="IP address" value={ip.ip} /><Value label="Organization" value={ip.organization} /><Value label="Web server" value={analysis.technology?.data?.web_server} /><Value label="CDN" value={analysis.technology?.data?.cdn} /></div></DetailSection>
          <DetailSection icon={ScanSearch} title="Security headers" status={analysis.security_headers?.status}><div className="grid gap-3 sm:grid-cols-2">{Object.entries(analysis.security_headers?.data || {}).map(([header, value]) => <Value key={header} label={header} value={value} />)}{!Object.keys(analysis.security_headers?.data || {}).length && <p className="text-sm text-slate-500">No header evidence was returned.</p>}</div></DetailSection>
        </div></section>
      </div>
    </div>
  </MainLayout>;
}
