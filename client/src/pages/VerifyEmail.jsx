import React, { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const email = location.state?.email;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const inputs = useRef([]);

  if (!email) {
    navigate("/register");
    return null;
  }

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) { setError("Enter the full 6-digit code"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      login(data.user);
      localStorage.setItem("token", data.token);
      navigate("/setup");
    } catch (err) {
      setError("Verification failed. Try again.");
    } finally {
      setLoading(false);
    }
  };



const handleResend = async () => {
    if (cooldown > 0) return;
    setResending(true);
    setResent(false);
    setError("");
    try {
        const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.message); return; }
        setResent(true);
        setCooldown(30);
        const interval = setInterval(() => {
        setCooldown((prev) => {
            if (prev <= 1) { clearInterval(interval); return 0; }
            return prev - 1;
        });
        }, 1000);
    } catch (err) {
        setError("Failed to resend. Try again.");
    } finally {
        setResending(false);
    }
    };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center p-6 font-['DM_Sans'] text-[#f0ece4]">
      <div className="w-full max-w-md flex flex-col gap-8">
        <div className="space-y-2 text-center">
          <h1 className="font-['Syne'] text-5xl font-extrabold tracking-tight">Vivadh</h1>
          <p className="text-sm text-[#666]">Check your email for a 6-digit code.</p>
          <p className="text-xs text-[#444]">{email}</p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex gap-3 justify-center" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-12 h-14 text-center text-xl font-bold bg-[#111] border border-[#2a2a2a] rounded-xl text-[#f0ece4] focus:outline-none focus:border-[#444] transition"
              />
            ))}
          </div>

          {error && (
            <p className="text-xs text-red-400 text-center bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-2">
              {error}
            </p>
          )}

          {resent && (
            <p className="text-xs text-green-400 text-center">
              Code resent successfully.
            </p>
          )}

          <button
            onClick={handleVerify}
            disabled={loading}
            className="px-6 py-3 bg-[#f0ece4] text-[#0a0a0a] rounded-xl text-sm font-medium transition-all hover:bg-white hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify email"}
          </button>

          <button
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="text-xs text-[#555] hover:text-[#888] transition-colors disabled:opacity-50"
            >
            {cooldown > 0 ? `Resend in ${cooldown}s` : resending ? "Resending..." : "Didn't get it? Resend code"}
        </button>
        </div>
      </div>
    </div>
  );
}