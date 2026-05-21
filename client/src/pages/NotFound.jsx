import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center font-['DM_Sans'] text-[#f0ece4]">
      <h1 className="font-['Syne'] text-6xl font-extrabold text-[#222] mb-4">404</h1>
      <p className="text-sm text-[#444] mb-8">This page doesn't exist.</p>
      <button
        onClick={() => navigate('/')}
        className="px-5 py-2.5 bg-[#f0ece4] text-[#0a0a0a] rounded-xl text-sm font-medium hover:bg-white transition-all active:scale-95"
      >
        Go home
      </button>
    </div>
  );
}