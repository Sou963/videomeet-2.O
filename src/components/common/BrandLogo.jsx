"use client";

import Link from "next/link";
import ReactLogo from "./ReactLogo";

export default function BrandLogo({
  href = "/",
  size = "md",
  showBadge = true,
  theme = "light",
  className = "",
}) {
  const sizeClasses = {
    sm: {
      wrapper: "h-8 w-8",
      icon: "h-5 w-5",
      text: "text-lg",
      badge: "text-[10px] px-1.5 py-0.5",
    },
    md: {
      wrapper: "h-10 w-10",
      icon: "h-6 w-6",
      text: "text-xl",
      badge: "text-xs px-2 py-0.5",
    },
    lg: {
      wrapper: "h-12 w-12",
      icon: "h-7 w-7",
      text: "text-2xl",
      badge: "text-xs px-2.5 py-1",
    },
  }[size] || {
    wrapper: "h-10 w-10",
    icon: "h-6 w-6",
    text: "text-xl",
    badge: "text-xs px-2 py-0.5",
  };

  const isDark = theme === "dark";

  const content = (
    <div className={`group flex items-center gap-3 select-none ${className}`}>
      {/* Icon Badge Container */}
      <div
        className={`relative flex ${sizeClasses.wrapper} items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-500 shadow-md shadow-blue-500/25 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-blue-500/35`}
      >
        <div className="absolute inset-0 rounded-2xl bg-white/15 backdrop-blur-[1px]" />
        <ReactLogo className={`${sizeClasses.icon} relative z-10 text-cyan-200 drop-shadow-[0_0_8px_rgba(0,216,254,0.6)]`} />
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span
            className={`font-black tracking-tight ${
              isDark ? "text-white" : "text-slate-900"
            } ${sizeClasses.text}`}
          >
            Video<span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Meet</span>
          </span>

          {showBadge && (
            <span
              className={`hidden sm:inline-flex items-center gap-1 rounded-full border font-semibold ${
                isDark
                  ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
                  : "border-blue-200 bg-blue-50/80 text-blue-700"
              } ${sizeClasses.badge}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              React
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block transition-opacity hover:opacity-95">
        {content}
      </Link>
    );
  }

  return content;
}
