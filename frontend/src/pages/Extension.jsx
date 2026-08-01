import { CheckCircle2, Copy, ExternalLink, Puzzle, ShieldCheck } from "lucide-react";
import MainLayout from "../layout/MainLayout";

const manifest = `{
  "manifest_version": 3,
  "name": "Sentrynx Link Check",
  "version": "1.0.0",
  "action": { "default_popup": "popup.html" },
  "permissions": ["activeTab", "tabs"]
}`;

export default function Extension() {
  return <MainLayout hero><main className="min-h-screen bg-slate-950 px-5 pb-24 pt-24 text-white sm:px-8"><div className="mx-auto max-w-4xl"><p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-bold tracking-[.14em] text-cyan-200"><Puzzle size={14} /> BROWSER EXTENSION STARTER</p><h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">Bring Sentrynx to every link.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">The starter files are in <code className="rounded bg-white/10 px-1.5 py-1 text-cyan-200">browser-extension/</code>. Add your deployed API URL, load the folder in Chrome or Edge, then publish it when you are ready.</p><div className="mt-10 grid gap-4 sm:grid-cols-3"><Step number="01" title="Set API URL" text="Update popup.js with your deployed Sentrynx address." /><Step number="02" title="Load unpacked" text="Open chrome://extensions and select the folder." /><Step number="03" title="Publish" text="Package the folder for the Chrome or Edge store." /></div><div className="mt-10 rounded-3xl border border-white/10 bg-slate-900 p-6"><div className="flex items-center justify-between gap-4"><p className="font-bold">manifest.json</p><button onClick={() => navigator.clipboard.writeText(manifest)} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-slate-300"><Copy size={14} /> Copy</button></div><pre className="mt-5 overflow-x-auto rounded-xl bg-slate-950 p-5 text-sm leading-6 text-cyan-100">{manifest}</pre></div><a href="https://chrome.google.com/webstore" target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950"><ShieldCheck size={17} /> Chrome Web Store <ExternalLink size={15} /></a></div></main></MainLayout>;
}

function Step({ number, title, text }) { return <article className="rounded-2xl border border-white/10 bg-white/[.04] p-5"><p className="text-xs font-bold tracking-[.14em] text-cyan-200">{number}</p><h2 className="mt-5 font-bold">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-400">{text}</p><CheckCircle2 size={16} className="mt-5 text-emerald-400" /></article>; }
