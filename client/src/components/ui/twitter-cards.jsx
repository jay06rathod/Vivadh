"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** * Utility to merge tailwind classes safely 
 * Requires: npm install clsx tailwind-merge
 */
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

function TwitterIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function VerifiedBadge() {
  return (
    <svg className="size-4 text-[#1d9bf0]" viewBox="0 0 22 22" fill="currentColor">
      <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
    </svg>
  );
}

export function TestimonialCard({
  className,
  avatar,
  username = "PEPE",
  handle = "@PEPE_bigbrother",
  content = "This is amazing! 🔥",
  date = "Jan 5, 2026",
  verified = true,
  likes = 142,
  retweets = 23,
  tweetUrl = "#",
  onHover,
  onLeave,
  isActive,
  onTap,
}) {
  const handleClick = (e) => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice && !isActive) {
      e.preventDefault();
      onTap?.();
    }
  };

  return (
    <a
      href={tweetUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={cn(
        "relative flex h-auto min-h-[140px] sm:min-h-[180px] w-[260px] sm:w-[380px] -skew-y-[8deg] select-none flex-col rounded-2xl border border-zinc-800 bg-zinc-900/90 backdrop-blur-sm px-4 py-4 transition-all duration-500 hover:border-zinc-700 hover:bg-zinc-900 cursor-pointer text-zinc-100",
        isActive && "ring-2 ring-blue-500/50",
        className
      )}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="size-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center overflow-hidden shrink-0">
          {avatar ? <img src={avatar} alt={username} className="w-full h-full object-cover" /> : <span>🐸</span>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="font-bold truncate text-sm sm:text-base">{username}</span>
            {verified && <VerifiedBadge />}
          </div>
          <span className="text-zinc-500 text-xs">{handle}</span>
        </div>
        <TwitterIcon className="size-5 text-white shrink-0" />
      </div>

      <p className="text-zinc-300 text-sm sm:text-[15px] leading-relaxed mb-3 line-clamp-3">
        {content}
      </p>

      <div className="flex items-center justify-between text-zinc-500 text-xs mt-auto">
        <span>{date}</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="text-zinc-400">{likes}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-zinc-400">{retweets}</span>
          </div>
        </div>
      </div>
    </a>
  );
}

export default function Testimonials({ cards }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);

  const getCardClassName = (index, baseClassName) => {
    const focusedIndex = hoveredIndex ?? activeIndex;
    if (focusedIndex === 0 && index === 1) return baseClassName + " !translate-y-32 !translate-x-24";
    if (focusedIndex === 0 && index === 2) return baseClassName + " !translate-y-44 !translate-x-40";
    if (focusedIndex === 1 && index === 2) return baseClassName + " !translate-y-40 !translate-x-40";
    return baseClassName;
  };

  const defaultCards = [
    {
      className: "[grid-area:stack] z-30 hover:-translate-y-10 transition-transform",
      username: "Sarah Chen",
      handle: "@sarahchen",
      content: "This component is exactly what I needed for my landing page. The stacked effect is beautiful! 🎨",
    },
    {
      className: "[grid-area:stack] z-20 translate-x-16 translate-y-10 grayscale hover:grayscale-0 transition-all",
      username: "Mike Johnson",
      handle: "@mikej_dev",
      content: "The hover interactions are so smooth. Love how the cards spread apart.",
    },
    {
      className: "[grid-area:stack] z-10 translate-x-32 translate-y-20 grayscale hover:grayscale-0 transition-all",
      username: "Alex Rivera",
      handle: "@alexrivera",
      content: "Finally a testimonial component that looks native to Twitter/X!",
    },
  ];

  const displayCards = cards || defaultCards;

  return (
    <div className="grid [grid-template-areas:'stack'] place-items-center h-[400px]">
      {displayCards.map((cardProps, index) => (
        <TestimonialCard
          key={index}
          {...cardProps}
          className={getCardClassName(index, cardProps.className || "")}
          onHover={() => setHoveredIndex(index)}
          onLeave={() => setHoveredIndex(null)}
          isActive={activeIndex === index}
          onTap={() => setActiveIndex(index)}
        />
      ))}
    </div>
  );
}