import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../ThemeToggle/ThemeToggle";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const textTone = "terminal-nav-link";

  return <motion.header initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: .8, ease: [0.16, 1, .3, 1] }} className="terminal-header fixed left-1/2 top-4 z-50 flex w-full -translate-x-1/2 justify-center px-4">
    <div className="flex min-h-16 w-full max-w-7xl items-center justify-between rounded-2xl border px-4 shadow-2xl backdrop-blur-2xl sm:px-6">
      <button onClick={() => navigate("/")} className="flex select-none items-center gap-2.5"><span className="terminal-logo flex h-10 w-10 items-center justify-center rounded-xl"><ShieldCheck size={20} strokeWidth={2.4} /></span><span className="terminal-brand font-mono text-xl font-bold tracking-tight sm:text-2xl">SENTRYNX</span></button>
      <nav className="hidden items-center gap-5 font-mono text-sm font-bold md:flex"><button onClick={() => navigate("/")} className={textTone}>[ Home ]</button><button onClick={() => navigate("/ai")} className={textTone}>[ AI Scan ]</button><button onClick={() => navigate("/workspace")} className={textTone}>[ Tools ]</button><button onClick={() => navigate("/email-lab")} className={textTone}>[ Email Lab ]</button><button onClick={() => navigate("/history")} className={textTone}>[ History ]</button>{user?.is_admin && <button onClick={() => navigate("/users")} className={textTone}>[ Users ]</button>}<button onClick={() => navigate("/about")} className={textTone}>[ About ]</button></nav>
      <div className="flex items-center gap-2 sm:gap-3"><ThemeToggle /><button onClick={() => user ? (signOut(), navigate("/")) : navigate("/login")} className="terminal-account rounded-xl px-3 py-2 text-xs font-bold sm:px-4 sm:text-sm">{user ? "Sign out" : "Sign in"}</button></div>
    </div>
  </motion.header>;
}
