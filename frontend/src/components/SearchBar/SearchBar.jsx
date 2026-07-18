import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingOverlay from "../../loading/LoadingOverlay";
import { useAuth } from "../../context/AuthContext";

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
      `http://127.0.0.1:8000/scan/stream?domain=${encodeURIComponent(domain.trim())}${token ? `&token=${encodeURIComponent(token)}` : ""}`
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
      border-neutral-300
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
        placeholder="Search a domain..."
        className="
        flex-1
        bg-transparent
        px-6
        py-4
        text-lg
        outline-none
        "
      />

      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="
        rounded-xl
        bg-black
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
        {loading ? "Analyzing..." : "Analyze"}
        
      </button>
      <LoadingOverlay loading={loading} progress={progress} />
    </div>
  );
}
