import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full flex justify-center px-4"
    >
      <div
        className="
          w-full
          max-w-6xl
          h-16
          rounded-full

          bg-white/65
          backdrop-blur-2xl
          supports-[backdrop-filter]:bg-white/55

          border
          border-white/70

          shadow-[0_8px_40px_rgba(0,0,0,0.08)]

          flex
          items-center
          justify-between

          px-8

          transition-all
          duration-500
        "
      >
        {/* Logo */}
        <button onClick={() => navigate("/")} className="flex items-center gap-2.5 select-none">

  <div
    className="
      flex
      h-11
      w-11
      items-center
      justify-center

      rounded-full

      bg-gradient-to-br from-neutral-900 to-black
      text-white

      shadow-[0_8px_20px_rgba(0,0,0,0.12)]
    "
  >
    <ShieldCheck size={20} strokeWidth={2.4} />
  </div>

  <h1 className="font-montserrat text-2xl font-bold tracking-normal text-black select-none">
  SENTRYNX
</h1>

</button>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-10 text-[15px] font-medium text-neutral-700">
          <button
            onClick={() => navigate("/")}
            className="transition-all duration-300 hover:text-black"
          >
            Home
          </button>

          <button
            onClick={() => navigate("/history")}
            className="transition-all duration-300 hover:text-black"
          >
            History
          </button>

          <a
            href="/#about"
            className="transition-all duration-300 hover:text-black"
          >
            About
          </a>
        </nav>

        {/* Button */}
        <button onClick={() => user ? (signOut(), navigate("/")) : navigate("/login")}
          className="
            rounded-full
            bg-black
            px-5
            py-2.5
            text-sm
            font-semibold
            text-white

            transition-all
            duration-300

            hover:scale-105
            hover:bg-neutral-800
          "
        >
          {user ? "Sign out" : "Sign in"}
        </button>
      </div>
    </motion.header>
  );
}
