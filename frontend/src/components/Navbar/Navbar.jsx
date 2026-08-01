import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar({ hero = false }) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const textTone = hero ? "text-slate-300 hover:text-white" : "text-neutral-700 hover:text-black";

  return <motion.header initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: .8, ease: [0.16, 1, .3, 1] }} className="fixed left-1/2 top-5 z-50 flex w-full -translate-x-1/2 justify-center px-4">
    <div className={`flex h-16 w-full max-w-6xl items-center justify-between rounded-full border px-5 shadow-[0_8px_40px_rgba(0,0,0,.14)] backdrop-blur-2xl sm:px-8 ${hero ? "border-white/10 bg-slate-950/60" : "border-white/70 bg-white/65"}`}>
      <button onClick={() => navigate("/")} className="flex select-none items-center gap-2.5"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-950 shadow-lg"><ShieldCheck size={20} strokeWidth={2.4} /></span><span className={`font-montserrat text-xl font-bold tracking-tight sm:text-2xl ${hero ? "text-white" : "text-black"}`}>SENTRYNX</span></button>
      <nav className="hidden items-center gap-7 text-[15px] font-medium md:flex"><button onClick={() => navigate("/")} className={`transition ${textTone}`}>Home</button><button onClick={() => navigate("/ai")} className={`transition ${textTone}`}>Search with AI</button><button onClick={() => navigate("/history")} className={`transition ${textTone}`}>History</button><button onClick={() => navigate("/about")} className={`transition ${textTone}`}>About</button></nav>
      <button onClick={() => user ? (signOut(), navigate("/")) : navigate("/login")} className="rounded-full bg-white px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:scale-105 hover:bg-cyan-100 sm:px-5">{user ? "Sign out" : "Sign in"}</button>
    </div>
  </motion.header>;
}
