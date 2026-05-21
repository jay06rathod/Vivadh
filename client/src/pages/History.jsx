import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const MODEL_META = {
  llama:    { name: "Llama 3.3",   initial: "L", bg: "#0f2010", color: "#4ade80" },
  deepseek: { name: "DeepSeek R1", initial: "D", bg: "#0f0f2e", color: "#818cf8" },
  gemma:    { name: "Gemma",       initial: "G", bg: "#2a1005", color: "#fb923c" },
  mixtral:  { name: "Mixtral",     initial: "M", bg: "#1a0f1a", color: "#d946ef" },
};

const TONE_LABELS = {
  formal: "Formal", aggressive: "Aggressive",
  socratic: "Socratic", satirical: "Satirical",
};

function ModelPill({ modelId }) {
  const meta = MODEL_META[modelId];
  if (!meta) return null;
  return (
    <div
      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
      style={{ background: meta.bg, color: meta.color }}
    >
      {meta.initial}
    </div>
  );
}

function DebateCard({ debate, onClick }) {
  const date = new Date(debate.createdAt);
  const formatted = date.toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
  const assignedModels = Object.entries(debate.roles || {})
    .filter(([, role]) => role && role !== '')
    .map(([modelId]) => modelId);

  return (
    <button  // ← changed from div to button
      onClick={onClick}  // ← added onClick
      className="w-full text-left bg-[#111] border border-[#2a2a2a] rounded-xl px-5 py-4 flex flex-col gap-3 animate-[fadeUp_0.4s_ease_both] hover:border-[#444] transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium text-[#f0ece4] leading-snug line-clamp-2 flex-1">
          {debate.topic}
        </p>
        {/* Resume/View badge */}
        <span className="text-[10px] text-[#444] border border-[#2a2a2a] rounded-lg px-2 py-1 flex-shrink-0">
          {debate.status === 'completed' ? 'View' : 'Resume →'}
        </span>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1">
          {assignedModels.map((m) => (
            <ModelPill key={m} modelId={m} />
          ))}
        </div>
        <div className="w-px h-3 bg-[#2a2a2a]" />
        <span className="text-[11px] text-[#444]">{debate.rounds || 3} rounds</span>
        {debate.tone && (
          <>
            <div className="w-px h-3 bg-[#2a2a2a]" />
            <span className="text-[11px] text-[#444]">{TONE_LABELS[debate.tone] || debate.tone}</span>
          </>
        )}
        <span className="text-[11px] text-[#333] ml-auto">{formatted}</span>
      </div>

      {debate.summary && (
        <p className="text-xs text-[#444] leading-relaxed border-t border-[#1a1a1a] pt-3">
          {debate.summary}
        </p>
      )}
    </button>
  );
}

export default function History() {
  const navigate = useNavigate();
  const { authFetch, logout  } = useAuth();
  const [debates, setDebates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch("/api/debate/history");
      if (!res) return; 
      const data = await res.json();
      setDebates(Array.isArray(data) ? data : []); // ← fix
    } catch (err) {
      // console.error("fetchHistory error:", err);
      setError("Couldn't load your debates.");
    } finally {
      setLoading(false);
    }
  };

    const handleLogout = () => {
      logout();
      navigate('/login');
    };

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-['DM_Sans']">
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#1a1a1a]">
        <button
          onClick={() => navigate("/")}
          className="font-['Syne'] text-base font-bold text-[#f0ece4] hover:text-white transition-colors"
        >
          Vivadh
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="text-[11px] text-[#444] hover:text-[#888] transition-colors"
          >
            Logout
          </button>
          <button
            onClick={() => navigate("/setup")}
            className="px-4 py-2 bg-[#f0ece4] text-[#0a0a0a] rounded-xl text-xs font-medium hover:bg-white transition-all active:scale-95"
          >
            New debate
          </button>
        </div>
        </div>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="font-['Syne'] text-2xl font-bold text-[#f0ece4] mb-1">History</h1>
          <p className="text-xs text-[#444]">All your past debates.</p>
        </div>

        {loading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-full h-24 bg-[#111] border border-[#1a1a1a] rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-16">
            <p className="text-sm text-[#444] mb-4">{error}</p>
            <button onClick={fetchHistory}
              className="text-xs text-[#555] border border-[#2a2a2a] rounded-xl px-4 py-2 hover:border-[#444] hover:text-[#888] transition-all">
              Try again
            </button>
          </div>
        )}

        {!loading && !error && debates.length === 0 && (
          <div className="text-center py-20">
            <p className="text-sm text-[#333] mb-2">No debates yet.</p>
            <p className="text-xs text-[#222] mb-6">Start one.</p>
            <button onClick={() => navigate("/setup")}
              className="px-5 py-2.5 bg-[#f0ece4] text-[#0a0a0a] rounded-xl text-xs font-medium hover:bg-white transition-all active:scale-95">
              Start a debate
            </button>
          </div>
        )}

        {!loading && !error && debates.length > 0 && (
          <div className="flex flex-col gap-3">
            {debates.map((debate) => (
              <DebateCard
                key={debate._id}
                debate={debate}
                onClick={() => navigate(`/debate/${debate._id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}