import { useCallback, useEffect, useRef, useState } from "react";
import { Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const apiError = (payload, fallback) => typeof payload?.detail === "string" ? payload.detail : Array.isArray(payload?.detail) ? payload.detail.map((item) => item.msg).filter(Boolean).join(" ") || fallback : fallback;

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const googleButton = useRef(null);
  const [register, setRegister] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", password: "", confirm_password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const finishGoogleSignIn = useCallback(async (credential) => {
    setBusy(true); setError("");
    try {
      const response = await fetch(`${API_URL}/auth/google`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ credential }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(apiError(payload, "Google sign-in failed."));
      signIn(payload); navigate("/history");
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }, [navigate, signIn]);

  useEffect(() => {
    const buttonElement = googleButton.current;
    if (!GOOGLE_CLIENT_ID || !buttonElement) return undefined;
    const renderGoogle = () => window.google?.accounts.id.renderButton(buttonElement, { theme: "outline", size: "large", text: register ? "signup_with" : "signin_with", shape: "pill", width: 360 });
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) { renderGoogle(); return undefined; }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client"; script.async = true;
    script.onload = () => { window.google?.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: (response) => finishGoogleSignIn(response.credential) }); renderGoogle(); };
    document.head.appendChild(script);
    return () => { buttonElement.innerHTML = ""; };
  }, [finishGoogleSignIn, register]);

  async function submit(event) {
    event.preventDefault(); setError("");
    if (register && form.password !== form.confirm_password) { setError("Passwords do not match."); return; }
    setBusy(true);
    const payload = register ? { full_name: form.full_name, email: form.email, password: form.password } : { email: form.email, password: form.password };
    try {
      const response = await fetch(`${API_URL}/auth/${register ? "register" : "login"}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(apiError(data, register ? "Unable to create the account." : "Unable to sign in."));
      signIn(data); navigate("/history");
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  const switchMode = () => { setRegister((value) => !value); setError(""); setForm({ full_name: "", email: "", password: "", confirm_password: "" }); };
  return <MainLayout><main className="min-h-screen bg-slate-50 px-5 py-12"><div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl sm:p-9"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white"><ShieldCheck size={24} /></div><p className="mt-6 text-sm font-bold uppercase tracking-[.14em] text-slate-400">Sentrynx account</p><h1 className="mt-2 text-3xl font-bold text-slate-950">{register ? "Create your account" : "Welcome back"}</h1><p className="mt-2 text-sm leading-6 text-slate-500">{register ? "Create a private workspace for reports, monitoring, and email investigations." : "Sign in to access your private reports and monitored domains."}</p>
    <form onSubmit={submit} className="mt-7 space-y-4">{register && <label className="block text-sm font-semibold text-slate-700">Name<input required autoComplete="name" value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-slate-950" /></label>}<label className="block text-sm font-semibold text-slate-700">Email<input required type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-slate-950" /></label><label className="block text-sm font-semibold text-slate-700">Password<div className="relative mt-1.5"><input required type={showPassword ? "text" : "password"} autoComplete={register ? "new-password" : "current-password"} minLength="10" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-3 pr-11 outline-none focus:border-slate-950" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>{register && <span className="mt-1 block text-xs font-normal text-slate-500">At least 10 characters, including uppercase, lowercase, and a number.</span>}</label>{register && <label className="block text-sm font-semibold text-slate-700">Confirm password<input required type={showPassword ? "text" : "password"} autoComplete="new-password" minLength="10" value={form.confirm_password} onChange={(event) => setForm({ ...form, confirm_password: event.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-slate-950" /></label>}{error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white disabled:opacity-60"><LockKeyhole size={17} />{busy ? "Please wait..." : register ? "Create account" : "Sign in"}</button></form>
    {GOOGLE_CLIENT_ID && <><div className="my-6 flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-slate-400"><span className="h-px flex-1 bg-slate-200" />or continue with Google<span className="h-px flex-1 bg-slate-200" /></div><div ref={googleButton} className="flex min-h-11 justify-center" /></>}
    {!register && <button onClick={() => navigate("/forgot-password")} className="mt-4 w-full text-sm font-semibold text-slate-500 hover:text-slate-950">Forgot password?</button>}<button onClick={switchMode} className="mt-5 w-full text-sm font-semibold text-slate-600 hover:text-slate-950">{register ? "Already have an account? Sign in" : "New here? Create an account"}</button>{!GOOGLE_CLIENT_ID && <p className="mt-6 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">Email sign-in is ready. Add <code>VITE_GOOGLE_CLIENT_ID</code> and <code>GOOGLE_CLIENT_ID</code> to enable Google sign-in.</p>}</div></main></MainLayout>;
}
