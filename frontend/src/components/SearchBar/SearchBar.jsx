import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingOverlay from "../../loading/LoadingOverlay";
import { useAuth } from "../../context/AuthContext";
import { Bot, Search, Sparkles } from "lucide-react";

export default function SearchBar() {
  const [domain, setDomain] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(null);
  const { token } = useAuth();

  function handleAnalyze() {
  if (!domain.trim()) return;

    setLoading(true);
    setProgress({ stage: "Preparing scan", completed: 0, total: 13 });
    let finished = false;
  const stream = new EventSource(
    `${import.meta.env.VITE_API_URL}/scan/stream?domain=${encodeURIComponent(domain.trim())}${token ? `&token=${encodeURIComponent(token)}` : ""}`
  );

    stream.addEventListener("progress", (event) => {
      setProgress(JSON.parse(event.data));
    });

    stream.addEventListener("complete", (event) => {
      finished = true;
      stream.close();
      setLoading(false);
      navigate("/analysis", { state: JSON.parse(event.data) });
    });

    function fail(message) {
      if (finished) return;
      finished = true;
      stream.close();
      setLoading(false);
      setProgress(null);
      alert(message);
    }

    stream.addEventListener("error", (event) => {
      const payload = event.data ? JSON.parse(event.data) : null;
      fail(payload?.message || "Unable to analyze domain. Check that the API is running and try again.");
    });

    stream.onerror = () => {
      if (!finished && stream.readyState === EventSource.CLOSED) {
        fail("The scan connection was interrupted. Please try again.");
      }
    };
}

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      handleAnalyze();
    }
  }

  return (
    <div
      className="
      relative
      mx-auto
      mb-16
      flex
      max-w-3xl
      items-center
      terminal-search rounded-2xl
      border
      border-white/10
      bg-slate-950
      p-2
      shadow-sm
      transition-all
      duration-300
      hover:shadow-lg
      focus-within:border-black
      "
    >
      <input
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
        onKeyDown={handleKeyDown}
        type="text"
        placeholder="Enter a domain, e.g. example.com"
        className="
        flex-1
        bg-transparent
        px-6
        py-4
        text-lg
        font-medium
        text-white
        placeholder:text-slate-500
        outline-none
        "
      />

      <button
        type="button"
        onClick={() => navigate("/ai")}
        className="terminal-ai absolute left-0 top-[calc(100%+0.85rem)] inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition-all duration-300 hover:-translate-y-0.5"
      >
        <span className="relative flex h-6 w-6 items-center justify-center rounded-md"><Bot size={14} /><Sparkles size={9} className="absolute -right-1 -top-1 text-white" /></span>
        Ask Sentrynx AI
      </button>

      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="
        inline-flex
        items-center
        gap-2
        rounded-xl
        terminal-button
        px-8
        py-4
        text-black
        transition-all
        duration-300
        hover:bg-neutral-800
        disabled:cursor-not-allowed
        disabled:opacity-70
        "
      >
        {loading ? "Analyzing..." : <><Search size={18} /> Analyze</>}
        
      </button>
      <LoadingOverlay loading={loading} progress={progress} />
    </div>
  );
}
