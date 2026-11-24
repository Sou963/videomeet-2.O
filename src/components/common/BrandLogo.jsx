"use client";

import Link from "next/link";
import { Video } from "lucide-react";

export default function BrandLogo({
  href = "/",
  size = "md",
  showBadge = false,
  theme = "light",
  className = "",
}) {
  const sizeClasses = {
    sm: { mark: "h-7 w-7 rounded-[7px]", icon: "h-3.5 w-3.5", text: "text-[15px]" },
    md: { mark: "h-8 w-8 rounded-lg", icon: "h-4 w-4", text: "text-[17px]" },
    lg: { mark: "h-9 w-9 rounded-lg", icon: "h-[18px] w-[18px]", text: "text-lg" },
  }[size] || { mark: "h-8 w-8 rounded-lg", icon: "h-4 w-4", text: "text-[17px]" };

  const isDark = theme === "dark";

  const content = (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div
        className={`flex ${sizeClasses.mark} items-center justify-center bg-brand text-white`}
      >
        <Video className={sizeClasses.icon} strokeWidth={1.75} />
      </div>

      <span
        className={`font-semibold tracking-[-0.01em] ${sizeClasses.text} ${
          isDark ? "text-night-ink" : "text-ink"
        }`}
      >
        VideoMeet
      </span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} aria-label="VideoMeet home">
        {content}
      </Link>
    );
  }

  return content;
}
