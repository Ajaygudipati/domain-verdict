import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock3, FileWarning, History as HistoryIcon, LoaderCircle, Trash2 } from "lucide-react";
import MainLayout from "../layout/MainLayout";
import StatusBadge from "../components/dashboard/StatusBadge";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://127.0.0.1:8000";

export default function History() {
  const navigate = useNavigate();
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [opening, setOpening] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetch(`${API_URL}/history?token=${encodeURIComponent(token)}`)
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => setScans(data.scans || []))
      .catch(() => setError("Unable to load scan history. Check that the API is running."))
      .finally(() => setLoading(false));
  }, [navigate, token]);

  async function openScan(id) {
    setOpening(id);
    try {
      const response = await fetch(`${API_URL}/history/${id}?token=${encodeURIComponent(token)}`);
      if (!response.ok) throw new Error();
      navigate("/analysis", { state: await response.json() });
    } catch {
      setError("That report is no longer available.");
    } finally {
      setOpening(null);
    }
  }

  async function deleteScan(id) {
    if (!window.confirm("Remove this saved scan? This cannot be undone.")) return;
    try {
      const response = await fetch(`${API_URL}/history/${id}?token=${encodeURIComponent(token)}`, { method: "DELETE" });
      if (!response.ok) throw new Error();
      setScans((current) => current.filter((scan) => scan.id !== id));
    } catch {
      setError("Unable to remove the saved scan.");
    }
  }

  return <MainLayout>
    <main className="min-h-screen bg-slate-50 pb-16">
      <div className="mx-auto max-w-5xl px-5 pt-8 sm:px-8">
        <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-950"><ArrowLeft size={16} /> New scan</button>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[0.14em] text-slate-400">Saved reports</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Scan history</h1><p className="mt-2 text-slate-500">Reopen a previous report or remove it from this device.</p></div><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white"><HistoryIcon size={22} /></div></div>

        {loading && <div className="mt-10 flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-12 text-slate-500"><LoaderCircle className="animate-spin" size={20} /> Loading saved scans</div>}
        {error && <div className="mt-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {!loading && !error && !scans.length && <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><FileWarning size={34} className="text-slate-400" /><h2 className="mt-4 text-xl font-bold text-slate-900">No saved scans yet</h2><p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">Completed domain scans will automatically appear here.</p></div>}
        {!loading && scans.length > 0 && <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">{scans.map((scan) => <div key={scan.id} className="flex flex-col gap-4 border-b border-slate-100 p-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-3"><h2 className="truncate text-lg font-bold text-slate-950">{scan.domain}</h2><StatusBadge value={scan.verdict} /></div><p className="mt-2 inline-flex items-center gap-2 text-sm text-slate-500"><Clock3 size={15} /> {new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(scan.created_at))}</p></div><div className="flex items-center gap-3"><div className="text-right"><p className="text-2xl font-bold tracking-tight text-slate-950">{scan.overall_score}</p><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Score</p></div><button onClick={() => openScan(scan.id)} disabled={opening === scan.id} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{opening === scan.id ? "Opening..." : "Open"}</button><button onClick={() => deleteScan(scan.id)} className="rounded-xl p-2.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600" aria-label={`Delete ${scan.domain} scan`}><Trash2 size={18} /></button></div></div>)}</div>}
      </div>
    </main>
  </MainLayout>;
}
