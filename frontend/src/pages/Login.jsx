import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import MainLayout from "../layout/MainLayout";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [register, setRegister] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true); setError("");
    try {
      const response = await fetch(`http://127.0.0.1:8000/auth/${register ? "register" : "login"}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const payload = await response.json();
      if (!response.ok) throw new Error(typeof payload.detail === "string" ? payload.detail : "Unable to sign in.");
      signIn(payload);
      navigate("/history");
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  return <MainLayout><main className="min-h-screen bg-slate-50 px-5 py-12"><div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl sm:p-9"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white"><ShieldCheck size={24} /></div><p className="mt-6 text-sm font-bold uppercase tracking-[.14em] text-slate-400">Sentrynx account</p><h1 className="mt-2 text-3xl font-bold text-slate-950">{register ? "Create your account" : "Welcome back"}</h1><p className="mt-2 text-sm leading-6 text-slate-500">Save private reports and monitor the domains that matter to you.</p><form onSubmit={submit} className="mt-7 space-y-4">{register && <label className="block text-sm font-semibold text-slate-700">Name<input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-slate-950" /></label>}<label className="block text-sm font-semibold text-slate-700">Email<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-slate-950" /></label><label className="block text-sm font-semibold text-slate-700">Password<input required type="password" minLength="10" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-slate-950" /></label>{error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button disabled={busy} className="w-full rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white disabled:opacity-60">{busy ? "Please wait..." : register ? "Create account" : "Sign in"}</button></form><button onClick={() => { setRegister(!register); setError(""); }} className="mt-5 w-full text-sm font-semibold text-slate-600 hover:text-slate-950">{register ? "Already have an account? Sign in" : "New here? Create an account"}</button></div></main></MainLayout>;
}
