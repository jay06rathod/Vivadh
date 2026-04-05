import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MODEL_META = {
  llama:    { initial: "L", bg: "#0f2010", color: "#4ade80" },
  deepseek: { initial: "D", bg: "#0f0f2e", color: "#818cf8" },
  gemma:    { initial: "G", bg: "#2a1005", color: "#fb923c" },
  mixtral:  { initial: "M", bg: "#1a0f1a", color: "#d946ef" },
};

function ModelDots({ models = [] }) {
  return (
    <div className="flex items-center gap-1">
      {models.map((m) => {
        const meta = MODEL_META[m];
        if (!meta) return null;
        return (
          <div
            key={m}
            className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
            style={{ background: meta.bg, color: meta.color }}
          >
            {meta.initial}
          </div>
        );
      })}
    </div>
  );
}

export default function HistorySidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [debates, setDebates] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (isOpen) fetchHistory();
  }, [isOpen]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/debate/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDebates(data.debates || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDebateClick = (id) => {
    onClose();
    navigate(`/debate/${id}`);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-50 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-[#0f0f0f] border-r border-[#1a1a1a] z-50 flex flex-col transition-transform duration-300 ease-in-out font-['DM_Sans'] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a1a] flex-shrink-0">
          <span className="font-['Syne'] text-sm font-bold text-[#f0ece4]">History</span>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#444] hover:text-[#888] hover:bg-[#1a1a1a] transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* New debate button */}
        <div className="px-4 py-3 border-b border-[#1a1a1a] flex-shrink-0">
          <button
            onClick={() => { onClose(); navigate("/setup"); }}
            className="w-full py-2 bg-[#f0ece4] text-[#0a0a0a] rounded-xl text-xs font-medium hover:bg-white transition-all active:scale-95"
          >
            + New debate
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto py-2">
          {loading && (
            <div className="flex flex-col gap-2 px-3 py-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 bg-[#141414] rounded-xl animate-pulse" />
              ))}
            </div>
          )}

          {!loading && debates.length === 0 && (
            <div className="text-center py-12 px-4">
              <p className="text-xs text-[#333]">No debates yet.</p>
            </div>
          )}

          {!loading && debates.length > 0 && (
            <div className="flex flex-col gap-1 px-2">
              {debates.map((debate) => {
                const date = new Date(debate.createdAt);
                const formatted = date.toLocaleDateString("en-IN", {
                  day: "numeric", month: "short",
                });
                return (
                  <button
                    key={debate._id}
                    onClick={() => handleDebateClick(debate._id)}
                    className="w-full text-left px-3 py-3 rounded-xl hover:bg-[#1a1a1a] transition-all group flex flex-col gap-1.5"
                  >
                    <p className="text-xs text-[#bbb] leading-snug line-clamp-2 group-hover:text-[#f0ece4] transition-colors">
                      {debate.topic}
                    </p>
                    <div className="flex items-center gap-2">
                      <ModelDots models={debate.models || []} />
                      <span className="text-[10px] text-[#333] ml-auto">{formatted}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[#1a1a1a] flex-shrink-0">
          <button
            onClick={() => { onClose(); navigate("/history"); }}
            className="text-[11px] text-[#333] hover:text-[#666] transition-colors"
          >
            View all →
          </button>
        </div>
      </div>
    </>
  );
}