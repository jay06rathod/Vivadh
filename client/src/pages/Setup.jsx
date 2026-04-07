import { useState } from "react";
import { useNavigate } from "react-router-dom";
import HistorySidebar from '../components/ui/HistorySidebar';
import HamBurger from '../components/ui/HamBurger';

const MODELS = [
  { id: "llama", name: "Llama 3.3", initial: "L", bg: "#0f2010", color: "#4ade80" },
  { id: "deepseek", name: "DeepSeek R1", initial: "D", bg: "#0f0f2e", color: "#818cf8" },
  { id: "gemma", name: "Gemma", initial: "G", bg: "#2a1005", color: "#fb923c" },
  { id: "mixtral", name: "Mixtral", initial: "M", bg: "#1a0f1a", color: "#d946ef" },
];

const ROLES = [
  { value: "", label: "No role" },
  { value: "proposition", label: "Proposition" },
  { value: "opposition", label: "Opposition" },
  { value: "devils-advocate", label: "Devil's Advocate" },
  { value: "skeptic", label: "Skeptic" },
  { value: "pragmatist", label: "Pragmatist" },
  { value: "visionary", label: "Visionary" },
  { value: "contrarian", label: "Contrarian" },
];

const TONES = [
  { value: "formal", label: "Formal", desc: "Academic, structured, measured" },
  { value: "aggressive", label: "Aggressive", desc: "Sharp, combative, no mercy" },
  { value: "socratic", label: "Socratic", desc: "Question-driven, methodical" },
  { value: "satirical", label: "Satirical", desc: "Witty, irreverent, sharp" },
];

const ROUND_OPTIONS = [3, 5, 8, 10];

export default function Setup() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [roles, setRoles] = useState({});
  const [tone, setTone] = useState(null);
  const [rounds, setRounds] = useState(5);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const showRoles = topic.trim().length > 5;
  const showTone = showRoles && Object.values(roles).some((r) => r !== "" && r !== undefined);
  const showRounds = showTone && tone !== null;
  const canStart = showRounds;

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleRoleChange = (modelId, value) => {
    setRoles((prev) => ({ ...prev, [modelId]: value }));
  };

  const handleStart = () => {
    if (!canStart) return;
    navigate(`/debate`, {
      state: { topic, roles, tone, rounds }
    });
  };

  return (
    // Changed to flex-col so the navbar and content stack vertically
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col font-['DM_Sans']">
      
      <HistorySidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* --- TOP NAVBAR --- */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#1a1a1a] flex-shrink-0">
        <div className="flex items-center gap-4">
          <HamBurger 
            isOpen={sidebarOpen} 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
          />
          
          <span
            onClick={() => navigate(0)}
            className="font-['Syne'] text-base font-bold text-[#f0ece4] cursor-pointer origin-left inline-block"
          >
            Vivadh
          </span>
        </div>
        
        <button
          onClick={handleLogout}
          className="text-[11px] text-[#333] hover:text-[#666] transition-colors ml-2 cursor-pointer"
        >
          Logout
        </button>
      </div>

      {/* --- MAIN SETUP CONTENT --- */}
      {/* flex-1 makes it fill the remaining height, centering the max-w-xl div */}
      <div className="flex-1 flex items-start justify-center px-4 py-12 md:py-20 overflow-y-auto">
        <div className="w-full max-w-xl flex flex-col gap-10">
          
          {/* Step 1 — Topic */}
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-[11px] text-[#444] tracking-widest uppercase mb-2">Step 1 of 4</p>
              <h2 className="font-['Syne'] text-2xl font-bold text-[#f0ece4] leading-snug">
                What should they debate?
              </h2>
            </div>
            <textarea
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. AI will make democracy obsolete."
              className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-[#f0ece4] placeholder-[#444] outline-none focus:border-[#444] resize-none transition-colors"
            />
          </div>

          {/* Step 2 — Roles */}
          <div
            className={`flex flex-col gap-4 transition-all duration-500 ${
              showRoles ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none h-0 overflow-hidden"
            }`}
          >
            <div className="h-px bg-[#1a1a1a] w-full" />
            <div>
              <p className="text-[11px] text-[#444] tracking-widest uppercase mb-2">Step 2 of 4</p>
              <h2 className="font-['Syne'] text-2xl font-bold text-[#f0ece4] leading-snug">
                Assign roles.
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              {MODELS.map((model) => (
                <div
                  key={model.id}
                  className="flex items-center justify-between bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                      style={{ background: model.bg, color: model.color }}
                    >
                      {model.initial}
                    </div>
                    <span className="text-sm text-[#bbb] font-medium">{model.name}</span>
                  </div>
                  <select
                    value={roles[model.id] || ""}
                    onChange={(e) => handleRoleChange(model.id, e.target.value)}
                    className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-xs text-[#888] outline-none focus:border-[#444] focus:text-[#f0ece4] cursor-pointer transition-colors"
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Step 3 — Tone */}
          <div
            className={`flex flex-col gap-4 transition-all duration-500 ${
              showTone ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none h-0 overflow-hidden"
            }`}
          >
            <div className="h-px bg-[#1a1a1a] w-full" />
            <div>
              <p className="text-[11px] text-[#444] tracking-widest uppercase mb-2">Step 3 of 4</p>
              <h2 className="font-['Syne'] text-2xl font-bold text-[#f0ece4] leading-snug">
                Set the tone.
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {TONES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTone(t.value)}
                  className={`text-left bg-[#111] border rounded-xl px-4 py-3 transition-all cursor-pointer ${
                    tone === t.value
                      ? "border-[#f0ece4] bg-[#1a1a1a]"
                      : "border-[#2a2a2a] hover:border-[#444]"
                  }`}
                >
                  <p className="text-sm font-medium text-[#f0ece4] mb-1">{t.label}</p>
                  <p className="text-[11px] text-[#555]">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Step 4 — Rounds */}
          <div
            className={`flex flex-col gap-4 transition-all duration-500 ${
              showRounds ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none h-0 overflow-hidden"
            }`}
          >
            <div className="h-px bg-[#1a1a1a] w-full" />
            <div>
              <p className="text-[11px] text-[#444] tracking-widest uppercase mb-2">Step 4 of 4</p>
              <h2 className="font-['Syne'] text-2xl font-bold text-[#f0ece4] leading-snug">
                How many rounds?
              </h2>
            </div>
            <div className="flex gap-3">
              {ROUND_OPTIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setRounds(r)}
                  className={`flex-1 py-3 rounded-xl text-sm border transition-all cursor-pointer ${
                    rounds === r
                      ? "border-[#f0ece4] text-[#f0ece4] bg-[#1a1a1a]"
                      : "border-[#2a2a2a] text-[#555] hover:border-[#444] hover:text-[#bbb]"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[#333] text-center">
              {rounds} rounds · ~{rounds * 2} min estimated
            </p>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStart}
            disabled={!canStart}
            className={`w-full py-3.5 rounded-xl text-sm font-medium font-['DM_Sans'] transition-all ${
              canStart
                ? "bg-[#f0ece4] text-[#0a0a0a] hover:bg-white hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                : "bg-[#f0ece4] text-[#0a0a0a] opacity-30 cursor-not-allowed"
            }`}
          >
            Start debate
          </button>

        </div>
      </div>
    </div>
  );
}