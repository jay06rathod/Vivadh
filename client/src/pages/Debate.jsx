import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import HistorySidebar from '../components/ui/HistorySidebar';

const MODEL_META = {
  llama:    { name: "Llama 3.3 70B", handle: "@llama",    initial: "L", bg: "#0f2010", color: "#4ade80" },
  gemma:    { name: "Llama 3.1 8B",  handle: "@gemma",    initial: "G", bg: "#2a1005", color: "#fb923c" },
  mixtral:  { name: "Llama 4 Scout", handle: "@mixtral",  initial: "S", bg: "#1a0f1a", color: "#d946ef" },
  deepseek: { name: "Qwen3 32B",     handle: "@deepseek", initial: "Q", bg: "#0f0f2e", color: "#818cf8" },
};

const ROLE_LABELS = {
  proposition:       "Proposition",
  opposition:        "Opposition",
  "devils-advocate": "Devil's Advocate",
  skeptic:           "Skeptic",
  pragmatist:        "Pragmatist",
  visionary:         "Visionary",
  contrarian:        "Contrarian",
};

function Avatar({ modelId }) {
  const meta = MODEL_META[modelId];
  if (!meta) return null;
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
      style={{ background: meta.bg, color: meta.color }}
    >
      {meta.initial}
    </div>
  );
}

function MessageCard({ message }) {
  const meta = MODEL_META[message.modelId];
  const [isPlaying, setIsPlaying] = useState(false);
  if (!meta) return null;

  const handleSpeak = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    // Cancel any currently playing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(message.content);
    utterance.rate = 1.05;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Give each model a slightly different voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoices = voices.filter(v => v.lang.startsWith('en'));
    const voiceIndex = ['llama', 'gemma', 'mixtral', 'deepseek'].indexOf(message.modelId);
    if (englishVoices[voiceIndex]) {
      utterance.voice = englishVoices[voiceIndex];
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex gap-3 animate-[fadeUp_0.4s_ease_both]">
      <Avatar modelId={message.modelId} />
      <div className="flex-1 bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-3 min-w-0">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-sm font-medium text-[#f0ece4]">{meta.name}</span>
          <span className="text-xs text-[#444]">{meta.handle}</span>
          {message.role && (
            <span className="text-[10px] text-[#555] border border-[#2a2a2a] rounded px-1.5 py-0.5">
              {ROLE_LABELS[message.role] || message.role}
            </span>
          )}
          <span className="text-[10px] text-[#333] ml-auto">Round {message.round}</span>

          {/* Audio button */}
          <button
            onClick={handleSpeak}
            className={`ml-1 p-1 rounded-md transition-colors ${
              isPlaying
                ? "text-[#4ade80]"
                : "text-[#333] hover:text-[#888]"
            }`}
            title={isPlaying ? "Stop" : "Listen"}
          >
            {isPlaying ? (
              // Stop icon
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2"/>
              </svg>
            ) : (
              // Speaker icon
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
              </svg>
            )}
          </button>
        </div>
        <p className="text-sm text-[#bbb] leading-relaxed">{message.content}</p>
      </div>
    </div>
  );
}

function StreamingCard({ modelId, role, round, content }) {
  const meta = MODEL_META[modelId];
  if (!meta) return null;
  return (
    <div className="flex gap-3">
      <Avatar modelId={modelId} />
      <div className="flex-1 bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-3 min-w-0">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-sm font-medium text-[#f0ece4]">{meta.name}</span>
          <span className="text-xs text-[#444]">{meta.handle}</span>
          {role && (
            <span className="text-[10px] text-[#555] border border-[#2a2a2a] rounded px-1.5 py-0.5">
              {ROLE_LABELS[role] || role}
            </span>
          )}
          <span className="text-[10px] text-[#333] ml-auto">Round {round}</span>
        </div>
        <p className="text-sm text-[#bbb] leading-relaxed">
          {content}
          <span className="inline-block w-0.5 h-3.5 bg-[#555] ml-0.5 animate-pulse align-middle" />
        </p>
      </div>
    </div>
  );
}

function ModeratorCard({ message }) {
  return (
    <div className="flex gap-3 animate-[fadeUp_0.4s_ease_both]">
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-[#1a1a1a] border border-[#2a2a2a] text-[#666]">
        M
      </div>
      <div className="flex-1 bg-[#0f0f0f] border border-[#222] rounded-xl px-4 py-3 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-[#666]">Moderator</span>
          <span className="text-[10px] text-[#333]">@you</span>
        </div>
        <p className="text-sm text-[#555] leading-relaxed">{message}</p>
      </div>
    </div>
  );
}

function RoundDivider({ round }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-1 h-px bg-[#1a1a1a]" />
      <span className="text-[11px] text-[#333] tracking-widest uppercase">Round {round}</span>
      <div className="flex-1 h-px bg-[#1a1a1a]" />
    </div>
  );
}

export default function Debate() {
  const location = useLocation();
  const navigate = useNavigate();
  const { topic, roles = {}, tone, rounds = 5 } = location.state || {};
  const { id } = useParams();

  const [messages, setMessages] = useState([]);
  const [streamingModel, setStreamingModel] = useState(null);
  const [streamingContent, setStreamingContent] = useState("");
  const [currentRound, setCurrentRound] = useState(1);
  // phases: running | moderating | waiting | ended
  // running   → models are streaming
  // moderating → round done, user can type and send to models
  // waiting   → moderator sent, models responded, waiting for "Next Round" click
  // ended     → all rounds done
  const [phase, setPhase] = useState("running");
  const [moderatorInput, setModeratorInput] = useState("");
  const [debateId, setDebateId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const feedRef = useRef(null);
  const inputRef = useRef(null);
  const token = localStorage.getItem("token");
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    if (location.state?.topic) {
      // New debate — has state from Setup
      startDebate();
    } else {
      // History view — load existing debate from DB
      loadExistingDebate(id);
    }
  }, []);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);


  const loadExistingDebate = async (debateId) => {
  setIsLoading(true);
  try {
    const res = await fetch(`/api/debate/${debateId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) { navigate("/history"); return; }

    const debate = await res.json();

    // Populate state from the existing debate
    setDebateId(debate._id);
    setCurrentRound(debate.rounds);
    setPhase("ended"); // it's a completed debate, show as ended

    // Map DB messages to frontend format
    setMessages(
      debate.messages
        .filter(m => m.modelId !== 'user') // exclude moderator messages
        .map(m => ({
          modelId: m.modelId,
          role: m.role,
          round: m.round,
          content: m.content,
        }))
    );
  } catch (err) {
    console.error(err);
    navigate("/history");
  } finally {
    setIsLoading(false);
  }
};

  const startDebate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/debate/start", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ topic, roles, tone, rounds }),
      });
      if (!res.ok) {
        const err = await res.json();
        console.error("startDebate failed:", err.message);
        return;
      }
      const data = await res.json();
      setDebateId(data.debateId);
      await runRound(data.debateId, 1);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const runRound = async (id, round) => {
    const dId = id || debateId;
    setPhase("running");

    const res = await fetch(`/api/debate/${dId}/round`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ round }),
    });

    if (!res.ok) {
      console.error("runRound failed:", res.status);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    const state = { modelId: null, role: "", text: "" };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const raw = line.slice(6).trim();
        if (!raw || raw === "[DONE]") continue;

        try {
          const event = JSON.parse(raw);

          if (event.type === "model_start") {
            state.modelId = event.modelId;
            state.role = roles[event.modelId] || "";
            state.text = "";
            setStreamingModel(event.modelId);
            setStreamingContent("");
          }

          if (event.type === "token") {
            state.text += event.content;
            setStreamingContent(state.text);
          }

          if (event.type === "model_end") {
            const savedId = state.modelId;
            const savedRole = state.role;
            const savedText = state.text;
            state.modelId = null;
            state.role = "";
            state.text = "";
            setStreamingModel(null);
            setStreamingContent("");
            if (savedId && savedText) {
              setMessages((prev) => [...prev, {
                modelId: savedId,
                role: savedRole,
                round,
                content: savedText,
              }]);
            }
          }

          if (event.type === "round_end") {
            setStreamingModel(null);
            setStreamingContent("");
            if (round < rounds) {
              setPhase("moderating"); // user can now type or click Next Round
            } else {
              await endDebate(dId);
            }
          }

          if (event.type === "error") {
            console.error("Stream error:", event.message);
            setStreamingModel(null);
            setStreamingContent("");
          }

        } catch (e) { /* skip malformed */ }
      }
    }
  };

  // Moderator sends a message — models respond in SAME round, then go to "waiting"
  const handleModeratorSubmit = async () => {
    if (!moderatorInput.trim() || phase !== "moderating") return;
    const msg = moderatorInput.trim();
    setModeratorInput("");

    // Show moderator card
    setMessages((prev) => [...prev, { type: "moderator", content: msg }]);

    // Save to backend
    try {
      await fetch(`/api/debate/${debateId}/moderator`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: msg, roundNumber: currentRound }),
      });
    } catch (e) { console.error(e); }

    // Models respond to moderator in the SAME round — don't increment yet
    await runModeratorRound(debateId, currentRound, msg);
  };

  // Run models responding to moderator — same round, then go to "waiting"
  const runModeratorRound = async (id, round, moderatorMsg) => {
    const dId = id || debateId;
    setPhase("running");

    const res = await fetch(`/api/debate/${dId}/round`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ round, moderatorMessage: moderatorMsg }),
    });

    if (!res.ok) {
      console.error("runModeratorRound failed:", res.status);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    const state = { modelId: null, role: "", text: "" };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const raw = line.slice(6).trim();
        if (!raw || raw === "[DONE]") continue;

        try {
          const event = JSON.parse(raw);

          if (event.type === "model_start") {
            state.modelId = event.modelId;
            state.role = roles[event.modelId] || "";
            state.text = "";
            setStreamingModel(event.modelId);
            setStreamingContent("");
          }

          if (event.type === "token") {
            state.text += event.content;
            setStreamingContent(state.text);
          }

          if (event.type === "model_end") {
            const savedId = state.modelId;
            const savedRole = state.role;
            const savedText = state.text;
            state.modelId = null;
            state.role = "";
            state.text = "";
            setStreamingModel(null);
            setStreamingContent("");
            if (savedId && savedText) {
              setMessages((prev) => [...prev, {
                modelId: savedId,
                role: savedRole,
                round, // same round number
                content: savedText,
              }]);
            }
          }

          if (event.type === "round_end") {
            setStreamingModel(null);
            setStreamingContent("");
            setPhase("waiting"); // ← waiting for user to click Next Round
          }

          if (event.type === "error") {
            console.error("Stream error:", event.message);
            setStreamingModel(null);
            setStreamingContent("");
          }

        } catch (e) { /* skip malformed */ }
      }
    }
  };

  // User manually clicks Next Round
  const handleNextRound = async () => {
    if (phase !== "waiting" && phase !== "moderating") return;
    const next = currentRound + 1;
    setCurrentRound(next);
    await runRound(debateId, next);
  };

  const endDebate = async (id) => {
    const dId = id || debateId;
    setPhase("ended");
    try {
      await fetch(`/api/debate/${dId}/end`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (e) { console.error(e); }
  };

  const renderedRounds = [];
  let lastRound = 0;

  messages.forEach((msg, i) => {
    if (msg.type === "moderator") {
      renderedRounds.push(<ModeratorCard key={`mod-${i}`} message={msg.content} />);
      return;
    }
    if (msg.round !== lastRound) {
      renderedRounds.push(<RoundDivider key={`rd-${msg.round}`} round={msg.round} />);
      lastRound = msg.round;
    }
    renderedRounds.push(<MessageCard key={i} message={msg} />);
  });

  return (
    <div className="h-screen bg-[#0a0a0a] flex flex-col font-['DM_Sans'] overflow-hidden">

        <HistorySidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#1a1a1a] flex-shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="text-[#444] hover:text-[#888] transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
          <span className="font-['Syne'] text-base font-bold text-[#f0ece4]">Vivadh</span>
          <div className="h-4 w-px bg-[#2a2a2a]" />
          <span className="text-xs text-[#555] max-w-xs truncate">{topic}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#444]">
            {phase === "ended" ? "Debate ended" : `Round ${currentRound} / ${rounds}`}
          </span>
          {phase !== "ended" && (
            <div className={`w-1.5 h-1.5 rounded-full ${phase === "running" ? "bg-[#4ade80] animate-pulse" : "bg-[#555]"}`} />
          )}
        </div>
      </div>

      {/* Feed */}
      <div ref={feedRef} className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-4 pb-36">
        {isLoading && messages.length === 0 && (
          <div className="text-center text-xs text-[#333] mt-8">Starting debate...</div>
        )}

        {renderedRounds}

        {streamingModel && (
          <StreamingCard
            modelId={streamingModel}
            role={roles[streamingModel] || ""}
            round={currentRound}
            content={streamingContent}
          />
        )}

        {phase === "ended" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="h-px w-full bg-[#1a1a1a]" />
            <p className="text-xs text-[#333] tracking-widest uppercase">Debate concluded</p>
            <button
              onClick={() => navigate("/history")}
              className="px-5 py-2.5 bg-transparent border border-[#2a2a2a] text-[#666] rounded-xl text-sm hover:border-[#444] hover:text-[#bbb] transition-all"
            >
              View history
            </button>
          </div>
        )}
      </div>

      {/* Fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-[#1a1a1a] px-4 py-3">
        <div className="max-w-3xl mx-auto flex flex-col gap-2">

          {/* Moderator input — only shown in moderating phase */}
          {(phase === "moderating" || phase === "waiting") && (
            <div className="flex gap-3 items-end">
              <div className="flex-1 bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-3 flex items-end gap-2 focus-within:border-[#444] transition-colors">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={moderatorInput}
                  onChange={(e) => {
                    setModeratorInput(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleModeratorSubmit(); }
                  }}
                  placeholder={
                    phase === "waiting"
                      ? "Models responded — click Next Round to continue..."
                      : "Add your take, models will respond before next round..."
                  }
                  disabled={phase !== "moderating"}
                  className="flex-1 bg-transparent text-sm text-[#f0ece4] placeholder-[#333] outline-none resize-none leading-relaxed disabled:cursor-not-allowed"
                  style={{ maxHeight: "100px", overflow: "hidden" }}
                />
              </div>
              {/* Send — only in moderating phase */}
              {phase === "moderating" && (
                <button
                  onClick={handleModeratorSubmit}
                  disabled={!moderatorInput.trim()}
                  className="px-4 py-3 bg-[#111] border border-[#2a2a2a] text-[#888] rounded-xl text-sm font-medium transition-all disabled:opacity-20 disabled:cursor-not-allowed hover:border-[#444] hover:text-[#f0ece4] active:scale-95"
                >
                  Send
                </button>
              )}
              {/* Next Round — shown in both moderating and waiting */}
              <button
                onClick={handleNextRound}
                className="px-4 py-3 bg-[#f0ece4] text-[#0a0a0a] rounded-xl text-sm font-medium transition-all hover:bg-white active:scale-95"
              >
                Next Round →
              </button>
            </div>
          )}

          {/* Running state hint */}
          {phase === "running" && (
            <p className="text-center text-[10px] text-[#333] tracking-wide py-1">
              Models are debating...
            </p>
          )}

          {/* Status text */}
          {phase === "moderating" && (
            <p className="text-center text-[10px] text-[#333] tracking-wide">
              Round {currentRound} complete — add your take or go to next round
            </p>
          )}
          {phase === "waiting" && (
            <p className="text-center text-[10px] text-[#333] tracking-wide">
              Models responded — click Next Round when ready
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}