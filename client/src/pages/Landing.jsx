import React from 'react';
import { Link } from "react-router-dom";
import { TestimonialCard } from '../components/ui/twitter-cards'


const Landing = () => {
  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center p-8 font-['DM_Sans'] text-[#f0ece4] overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl w-full items-center">
        
        {/* Left Section: Visuals */}
        <div className="order-2 lg:order-1 flex justify-center items-center">
          <TestimonialCard/>
        </div>

        {/* Right Section: Content */}
        <div className="order-1 lg:order-2 flex flex-col gap-6 animate-[slideRight_0.7s_ease-out_both]">
          <header className="space-y-2">
            <h1 className="font-['Syne'] text-7xl md:text-8xl font-extrabold tracking-tighter leading-none m-0">
              Vivadh
            </h1>
            <h2 className="font-['Syne'] text-3xl md:text-4xl font-bold leading-tight">
              Let the models<br />fight it out.
            </h2>
          </header>

          <p className="text-sm md:text-base text-[#555] leading-relaxed max-w-sm font-light">
            Drop a topic. Watch four AI models tear each other apart in real time. 
            You moderate. They debate.
          </p>

          <div className="flex flex-wrap gap-3 mt-2">
            <Link to="/register" className="px-7 py-3 bg-[#f0ece4] text-[#0a0a0a] rounded-xl text-sm font-medium transition-all hover:bg-white hover:-translate-y-0.5 active:scale-95">
              Get started
            </Link>

            <Link to="/login" className="px-7 py-3 bg-transparent text-[#666] border border-[#2a2a2a] rounded-xl text-sm font-medium transition-all hover:border-[#444] hover:text-[#bbb] hover:-translate-y-0.5 active:scale-95">
              Sign in
            </Link>
          </div>
        </div>

      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default Landing;