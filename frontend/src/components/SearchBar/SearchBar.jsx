import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingOverlay from "../../loading/LoadingOverlay";
import { useAuth } from "../../context/AuthContext";
import { Search } from "lucide-react";

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
      mx-auto
      flex
      max-w-3xl
      items-center
      rounded-2xl
      border
      border-white/80
      bg-white
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
        text-slate-950
        placeholder:text-slate-400
        outline-none
        "
      />

      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="
        inline-flex
        items-center
        gap-2
        rounded-xl
        bg-slate-950
        px-8
        py-4
        text-white
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
