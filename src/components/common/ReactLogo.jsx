"use client";

export default function ReactLogo({ className = "h-6 w-6", animated = true }) {
  return (
    <svg
      viewBox="-11.5 -10.23174 23 20.46348"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${animated ? "animate-[spin_20s_linear_infinite]" : ""}`}
      aria-label="React Logo"
    >
      {/* Central nucleus */}
      <circle cx="0" cy="0" r="2.05" fill="#00d8fe" />
      {/* Orbit 1 */}
      <g stroke="#00d8fe" strokeWidth="1" fill="none">
        <ellipse rx="11" ry="4.2" />
        <ellipse rx="11" ry="4.2" transform="rotate(60)" />
        <ellipse rx="11" ry="4.2" transform="rotate(120)" />
      </g>
    </svg>
  );
}
