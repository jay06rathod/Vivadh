import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import HistorySidebar from '../components/ui/HistorySidebar';
import HamBurger from '../components/ui/HamBurger';

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
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message.content);
    utterance.rate = 1.05;
    utterance.pitch = 1;
    utterance.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    const englishVoices = voices.filter(v => v.lang.startsWith('en'));
    const voiceIndex = ['llama', 'gemma', 'mixtral', 'deepseek'].indexOf(message.modelId);
    if (englishVoices[voiceIndex]) utterance.voice = englishVoices[voiceIndex];
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
          <button
            onClick={handleSpeak}
            className={`ml-1 p-1 rounded-md transition-colors ${isPlaying ? "text-[#4ade80]" : "text-[#333] hover:text-[#888]"}`}
            title={isPlaying ? "Stop" : "Listen"}
          >
            {isPlaying ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2"/>
              </svg>
            ) : (
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
  const { id } = useParams();
  const { topic, roles = {}, tone, rounds = 5 } = location.state || {};

  // console.log("useParams id:", id);
  // console.log("location.state:", location.state);

  // ← Refs at component level — not inside functions
  const topicRef = useRef(topic);
  const rolesRef = useRef(roles);
  const roundsRef = useRef(rounds);

  const [messages, setMessages] = useState([]);
  const [streamingModel, setStreamingModel] = useState(null);
  const [streamingContent, setStreamingContent] = useState("");
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(rounds);
  const [phase, setPhase] = useState("running");
  const [moderatorInput, setModeratorInput] = useState("");
  const [debateId, setDebateId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [displayTopic, setDisplayTopic] = useState(topic || "");
  const [summary, setSummary] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  const feedRef = useRef(null);
  const inputRef = useRef(null);
  const token = localStorage.getItem("token");
  const hasStarted = useRef(false);

useEffect(() => {
  if (hasStarted.current) return;
  hasStarted.current = true;

  if (location.state?.topic) {
    // New debate from Setup
    startDebate();
  } else if (id && id !== 'new') {
    // Load existing from history
    loadExistingDebate(id);
  } else {
    navigate("/setup");
  }
}, []);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  useEffect(() => {
    if (!location.state?.topic && id && id !== 'new') {
      // ID changed — load the new debate
      setMessages([]);
      setPhase("running");
      setCurrentRound(1);
      setSummary("");
      loadExistingDebate(id);
    }
  }, [id]);

  const loadExistingDebate = async (debateId) => {
    console.log("Loading debate:", debateId);
    console.log("Token:", token);
      setIsLoading(true);
      try {
        const res = await fetch(`/api/debate/${debateId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) { navigate("/history"); return; }

        const debate = await res.json();
        setDebateId(debate._id);
        setDisplayTopic(debate.topic);
        setTotalRounds(debate.rounds);

        topicRef.current = debate.topic;
        rolesRef.current = debate.roles || {};
        roundsRef.current = debate.rounds;

        // Fix 4 — include moderator messages, don't filter them out
        const mapped = debate.messages.map(m => {
          if (m.modelId === 'user') {
            // Moderator message — use type flag so ModeratorCard renders
            return { type: 'moderator', content: m.content, round: m.round };
          }
          return {
            modelId: m.modelId,
            role: m.role,
            round: m.round,
            content: m.content,
          };
        });
        setMessages(mapped);

        if (debate.status === 'completed') {
          setCurrentRound(debate.rounds); // Fix 5 — use DB value not location.state
          setPhase("ended");
          if (debate.status === 'completed') {
            setCurrentRound(debate.rounds);
            setPhase("ended");
            if (debate.summary) setSummary(debate.summary); // ← restore summary
          }
        } else {
          const nonModeratorMessages = mapped.filter(m => m.type !== 'moderator');
          const lastRound = nonModeratorMessages.length > 0
            ? Math.max(...nonModeratorMessages.map(m => m.round))
            : 0;
          setCurrentRound(lastRound); // Fix 5 — correct round from DB
          setPhase("moderating");
        }

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
    setDisplayTopic(topic);

    // ← Replace URL with real MongoDB ID — no remount, no Date.now()
    window.history.replaceState(
      { topic, roles, tone, rounds }, // preserve state
      '',
      `/debate/new`
    );

    await runRound(data.debateId, 1);
  } catch (err) {
    console.error(err);
  } finally {
    setIsLoading(false);
  }
};

const handleFeedScroll = () => {
  if (feedRef.current) {
    // If scrolled down more than 50 pixels, set to true. Otherwise, false.
    setIsScrolled(feedRef.current.scrollTop > 25); 
  }
};

  // Use refs as fallback so resumed debates work after refresh
  const getActiveRoles = () => Object.keys(roles).length > 0 ? roles : rolesRef.current;
  const getActiveRounds = () => rounds > 0 ? rounds : roundsRef.current;

  const runRound = async (id, round) => {
    const dId = id || debateId;
    const activeRoles = getActiveRoles();
    const activeRounds = getActiveRounds();
    setPhase("running");

    const res = await fetch(`/api/debate/${dId}/round`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ round }),
    });

    if (!res.ok) { console.error("runRound failed:", res.status); return; }

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
            state.role = activeRoles[event.modelId] || "";
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
            state.modelId = null; state.role = ""; state.text = "";
            setStreamingModel(null); setStreamingContent("");
            if (savedId && savedText) {
              setMessages((prev) => [...prev, { modelId: savedId, role: savedRole, round, content: savedText }]);
            }
          }
          if (event.type === "round_end") {
            setStreamingModel(null); setStreamingContent("");
            if (round < activeRounds) {
              setPhase("moderating");
            } else {
              await endDebate(dId);
            }
          }
          if (event.type === "error") {
            console.error("Stream error:", event.message);
            setStreamingModel(null); setStreamingContent("");
          }
        } catch (e) { /* skip malformed */ }
      }
    }
  };

  const handleModeratorSubmit = async () => {
    if (!moderatorInput.trim() || phase !== "moderating") return;
    const msg = moderatorInput.trim();
    setModeratorInput("");
    setMessages((prev) => [...prev, { type: "moderator", content: msg }]);
    try {
      await fetch(`/api/debate/${debateId}/moderator`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: msg, roundNumber: currentRound }),
      });
    } catch (e) { console.error(e); }
    await runModeratorRound(debateId, currentRound, msg);
  };

  const runModeratorRound = async (id, round, moderatorMsg) => {
    const dId = id || debateId;
    const activeRoles = getActiveRoles();
    setPhase("running");

    const res = await fetch(`/api/debate/${dId}/round`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ round, moderatorMessage: moderatorMsg }),
    });

    if (!res.ok) { console.error("runModeratorRound failed:", res.status); return; }

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
            state.role = activeRoles[event.modelId] || "";
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
            state.modelId = null; state.role = ""; state.text = "";
            setStreamingModel(null); setStreamingContent("");
            if (savedId && savedText) {
              setMessages((prev) => [...prev, { modelId: savedId, role: savedRole, round, content: savedText }]);
            }
          }
          if (event.type === "round_end") {
            setStreamingModel(null); setStreamingContent("");
            setPhase("waiting");
          }
          if (event.type === "error") {
            console.error("Stream error:", event.message);
            setStreamingModel(null); setStreamingContent("");
          }
        } catch (e) { /* skip malformed */ }
      }
    }
  };

const handleNextRound = async () => {
  if (phase !== "waiting" && phase !== "moderating") return;
  const next = currentRound + 1;
  const activeRounds = getActiveRounds();

  // Warn before final round
  if (next > activeRounds) {
    const confirm = window.confirm("This will end the debate and generate a summary. Continue?");
    if (!confirm) return;
    await endDebate(debateId);
    return;
  }

  setCurrentRound(next);
  await runRound(debateId, next);
};

  const endDebate = async (id) => {
    const dId = id || debateId;
    setPhase("ended");
    try {
      const res = await fetch(`/api/debate/${dId}/end`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.summary) setSummary(data.summary); // ← capture summary
      }
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

  const activeRounds = getActiveRounds();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="h-screen bg-[#0a0a0a] flex flex-col font-['DM_Sans'] overflow-hidden">
      <HistorySidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#1a1a1a] flex-shrink-0">
        <div className="flex items-center gap-4">
          
          {/* 2. Drop the reusable component here */}
          <HamBurger 
            isOpen={sidebarOpen} 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
          />

          <span
            onClick={() => navigate(0)}
            className="font-['Syne'] text-base font-bold text-[#f0ece4] cursor-pointer"
          >
            Vivadh
          </span>
          <div className="h-4 w-px bg-[#2a2a2a]" />
          <span className="text-xs text-[#555] max-w-xs truncate">{displayTopic}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#444]">
            {phase === "ended" ? "Debate ended" : `Round ${currentRound} / ${activeRounds}`}
          </span>
          {phase !== "ended" && (
            <div className={`w-1.5 h-1.5 rounded-full ${phase === "running" ? "bg-[#4ade80] animate-pulse" : "bg-[#555]"}`} />
          )}
            <button
              onClick={handleLogout}
              className="text-[11px] text-[#333] hover:text-[#666] transition-colors ml-2"
            >
              Logout
            </button>
        </div>
      {(phase === "ended" || currentRound === activeRounds) && isScrolled && (
        <button
          onClick={() => {
            if (feedRef.current) {
              feedRef.current.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 group flex items-center justify-center w-[50px] h-[50px] hover:w-[130px] rounded-full bg-[#111] hover:bg-[#f0ece4] border border-[#2a2a2a] hover:border-[#f0ece4] shadow-lg shadow-black/50 transition-all duration-300 overflow-hidden cursor-pointer"
        >
          <svg
            className="w-3 fill-[#888] group-hover:fill-[#0a0a0a] transition-all duration-300 group-hover:-translate-y-[300%]"
            viewBox="0 0 384 512"
          >
            <path d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z" />
          </svg>
          
          <span className="absolute text-[#0a0a0a] font-semibold text-[13px] opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 whitespace-nowrap">
            Back to Top
          </span>
        </button>
      )}
      </div>

          
      {/* Feed */}
      <div 
        ref={feedRef} 
        onScroll={handleFeedScroll} 
        className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-4 pb-36"
      >
        {isLoading && messages.length === 0 && (
          <div className="text-center text-xs text-[#333] mt-8">Loading...</div>
        )}
        {renderedRounds}
        {streamingModel && (
          <StreamingCard
            modelId={streamingModel}
            role={getActiveRoles()[streamingModel] || ""}
            round={currentRound}
            content={streamingContent}
          />
        )}
        {phase === "ended" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="h-px w-full bg-[#1a1a1a]" />
            <p className="text-xs text-[#333] tracking-widest uppercase">Debate concluded</p>

            {/* Summary */}
            {summary && (
              <div className="w-full max-w-2xl bg-[#111] border border-[#2a2a2a] rounded-xl px-5 py-4">
                <p className="text-[11px] text-[#444] tracking-widest uppercase mb-2">Summary</p>
                <p className="text-sm text-[#888] leading-relaxed">{summary}</p>
              </div>
            )}

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
              {phase === "moderating" && (
                <button
                  onClick={handleModeratorSubmit}
                  disabled={!moderatorInput.trim()}
                  className="px-4 py-3 bg-[#111] border border-[#2a2a2a] text-[#888] rounded-xl text-sm font-medium transition-all disabled:opacity-20 disabled:cursor-not-allowed hover:border-[#444] hover:text-[#f0ece4] active:scale-95"
                >
                  Send
                </button>
              )}
              <button
                onClick={handleNextRound}
                className="px-4 py-3 bg-[#f0ece4] text-[#0a0a0a] rounded-xl text-sm font-medium transition-all hover:bg-white active:scale-95"
              >
                Next Round →
              </button>
            </div>
          )}
          {phase === "running" && (
            <p className="text-center text-[10px] text-[#333] tracking-wide py-1">Models are debating...</p>
          )}
          {phase === "moderating" && (
            <p className="text-center text-[10px] text-[#333] tracking-wide">
              {currentRound === getActiveRounds()
                ? "Final round complete — next round will end the debate"
                : `Round ${currentRound} complete — add your take or go to next round`}
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