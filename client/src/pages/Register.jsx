import React, { useState } from "react";
import { Link } from "react-router-dom";
import BackButton from "../components/ui/BackButton";
import { useNavigate } from 'react-router-dom';

import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";


const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate(); // ✅ inside component

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log(result.user);

      navigate("/setup"); // or dynamic id
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center p-6 font-['DM_Sans'] text-[#f0ece4] relative">
      
      {/* Back Button */}
      <BackButton className="absolute top-6 left-6" />

      <div className="w-full max-w-md flex flex-col gap-8">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="font-['Syne'] text-5xl font-extrabold tracking-tight">
            Vivadh
          </h1>
          <p className="text-sm text-[#666]">
            Create your account. Enter the arena.
          </p>
        </div>

        {/* Form */}
        <form className="flex flex-col gap-5">

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full px-6 py-3 bg-[#111] border border-[#2a2a2a] rounded-xl text-sm text-[#bbb] hover:border-[#444] hover:text-white transition flex items-center justify-center gap-3 active:scale-95"
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.9 0 7.4 1.3 10.1 3.9l7.5-7.5C36.9 2.3 30.9 0 24 0 14.6 0 6.4 5.6 2.5 13.7l8.7 6.8C13.2 13.6 18.1 9.5 24 9.5z"/>
            <path fill="#34A853" d="M46.5 24.5c0-1.6-.1-3.2-.4-4.7H24v9h12.7c-.5 2.7-2.1 5-4.4 6.5l6.9 5.4c4-3.7 6.3-9.2 6.3-15.2z"/>
            <path fill="#FBBC05" d="M11.2 28.5c-.5-1.5-.8-3-.8-4.5s.3-3 .8-4.5l-8.7-6.8C.9 16.3 0 20.1 0 24s.9 7.7 2.5 11.3l8.7-6.8z"/>
            <path fill="#4285F4" d="M24 48c6.9 0 12.9-2.3 17.2-6.3l-6.9-5.4c-2 1.3-4.6 2.1-10.3 2.1-5.9 0-10.8-4.1-12.6-9.6l-8.7 6.8C6.4 42.4 14.6 48 24 48z"/>
          </svg>

          <span>Continue with Google</span>
        </button>

        <div className="flex items-center gap-3 text-[#444] text-xs">
          <div className="flex-1 h-[1px] bg-[#2a2a2a]" />
          OR
          <div className="flex-1 h-[1px] bg-[#2a2a2a]" />
        </div>

          {/* Username */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#777]">Username</label>
            <input
              type="text"
              placeholder="cool_username"
              className="px-4 py-3 rounded-xl bg-[#111] border border-[#2a2a2a] text-sm focus:outline-none focus:border-[#444] transition"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#777]">Email</label>
            <input
              type="email"
              placeholder="you@domain.com"
              className="px-4 py-3 rounded-xl bg-[#111] border border-[#2a2a2a] text-sm focus:outline-none focus:border-[#444] transition"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#777]">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-[#111] border border-[#2a2a2a] text-sm focus:outline-none focus:border-[#444] transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#bbb] text-xs"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#777]">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-[#111] border border-[#2a2a2a] text-sm focus:outline-none focus:border-[#444] transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#bbb] text-xs"
              >
                {showConfirm ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="mt-2 px-6 py-3 bg-[#f0ece4] text-[#0a0a0a] rounded-xl text-sm font-medium transition-all hover:bg-white hover:-translate-y-0.5 active:scale-95"
          >
            Create account
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-sm text-[#555]">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#bbb] hover:text-white transition"
          >
            Sign in
          </Link>
        </div>

      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap');
      `}</style>
    </div>
  );
};

export default Register;