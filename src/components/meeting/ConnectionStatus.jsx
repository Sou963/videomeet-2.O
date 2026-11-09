"use client";

export default function ConnectionStatus({ status = "connected" }) {
  const isConnected = status === "connected";
  const isFailed = status === "failed" || status === "error";
  const labels = {
    connecting: "Connecting",
    waiting: "Waiting for ICE",
    reconnecting: "Reconnecting",
    connected: "Connected",
    failed: "Connection failed",
    error: "Reconnecting",
  };

  return (
    <div className="flex items-center gap-2 rounded-full border border-slate-700/60 bg-[#101624]/80 px-3 py-1 text-xs backdrop-blur-md">
      <span
        className={`h-2 w-2 rounded-full ${
          isConnected
            ? "bg-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.6)]"
            : isFailed
            ? "bg-[#EF4444] shadow-[0_0_8px_rgba(239,68,68,0.6)]"
            : "bg-amber-400 animate-pulse"
        }`}
      />
      <span className="text-[11px] font-medium text-slate-300">
        {labels[status] || labels.connecting}
      </span>
    </div>
  );
}
