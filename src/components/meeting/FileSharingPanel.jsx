"use client";

import { useRef, useState } from "react";
import { FileIcon } from "./icons";
import { MAX_MEETING_FILE_SIZE_MB } from "@/hooks/useMeetingFiles";

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTime(value) {
  const timestamp = new Date(value);
  return Number.isNaN(timestamp.getTime())
    ? "Recently"
    : timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function statusLabel(status) {
  return {
    authorizing: "Authorizing",
    waiting: "Waiting for participant",
    sending: "Sending",
    receiving: "Receiving",
    verifying: "Verifying file",
    completed: "Complete",
    failed: "Failed",
    cancelled: "Cancelled",
    interrupted: "Interrupted",
  }[status] || "Shared";
}

export default function FileSharingPanel({
  localName,
  remoteParticipants = [],
  transfers = [],
  notification,
  onDismissNotification,
  dismissNotification,
  onShareFile,
  shareFile,
  onCancelTransfer,
  cancelTransfer,
  onDownload,
  downloadTransfer,
  canDownload,
  disabled,
}) {
  const handleShareFile = onShareFile || shareFile;
  const handleCancelTransfer = onCancelTransfer || cancelTransfer;
  const handleDownload = onDownload || downloadTransfer;
  const handleDismissNotification = onDismissNotification || dismissNotification;

  const inputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [recipientId, setRecipientId] = useState("all");

  function share(event) {
    event.preventDefault();
    if (!selectedFile || disabled || typeof handleShareFile !== "function") return;
    const recipients = recipientId === "all"
      ? remoteParticipants.map(({ peerId, name }) => ({ id: peerId, name }))
      : remoteParticipants
          .filter((participant) => participant.peerId === recipientId)
          .map(({ peerId, name }) => ({ id: peerId, name }));
    handleShareFile(selectedFile, recipients);
    setSelectedFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="flex h-full flex-col overflow-hidden text-xs text-slate-300">
      <form onSubmit={share} className="shrink-0 space-y-3 border-b border-slate-800/80 p-4">
        <div>
          <h3 className="font-semibold text-white">Share a file</h3>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
            Files transfer directly to meeting participants. Maximum {MAX_MEETING_FILE_SIZE_MB} MB per file.
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          disabled={disabled || remoteParticipants.length === 0}
          onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
          className="block w-full text-[11px] text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-[#6366F1] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-indigo-600 disabled:opacity-50"
        />

        {selectedFile && (
          <p className="truncate text-[11px] text-slate-300" title={selectedFile.name}>
            {selectedFile.name} · {formatBytes(selectedFile.size)}
          </p>
        )}

        <div className="flex gap-2">
          <select
            aria-label="File recipient"
            value={recipientId}
            onChange={(event) => setRecipientId(event.target.value)}
            disabled={disabled || remoteParticipants.length === 0}
            className="min-w-0 flex-1 rounded-xl border border-slate-700/80 bg-[#101624] px-3 py-2 text-[11px] text-white outline-none focus:border-[#6366F1] disabled:opacity-50"
          >
            <option value="all">All participants</option>
            {remoteParticipants.map((participant) => (
              <option key={participant.peerId} value={participant.peerId}>
                {participant.name || "Participant"}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={disabled || !selectedFile || remoteParticipants.length === 0}
            className="shrink-0 rounded-xl bg-[#6366F1] px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Share
          </button>
        </div>
        {remoteParticipants.length === 0 && (
          <p className="text-[11px] text-slate-500">A participant must join before you can share a file.</p>
        )}
        {disabled && (
          <p className="text-[11px] text-amber-300">File sharing is disabled because this meeting has ended.</p>
        )}
      </form>

      {notification && (
        <div
          role={notification.type === "error" ? "alert" : "status"}
          className={`mx-4 mt-3 rounded-xl border px-3 py-2 text-[11px] ${
            notification.type === "error"
              ? "border-red-500/30 bg-red-950/30 text-red-300"
              : notification.type === "success"
                ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-300"
                : "border-slate-700 bg-[#101624] text-slate-300"
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <span>{notification.message}</span>
            <button type="button" onClick={handleDismissNotification} aria-label="Dismiss notification" className="text-slate-400 hover:text-white">×</button>
          </div>
        </div>
      )}

      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        <div className="mb-2 flex items-center justify-between">
          <h4 className="font-semibold text-slate-200">Shared files</h4>
          <span className="text-[10px] text-slate-500">{transfers.length} recent</span>
        </div>
        {transfers.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700/80 text-center">
            <FileIcon className="mb-2 h-7 w-7 text-slate-600" />
            <p className="font-semibold text-slate-300">No files shared yet</p>
            <p className="mt-1 max-w-[210px] text-[10px] leading-relaxed text-slate-500">
              Files shared here are sent peer-to-peer and never stored in the meeting chat.
            </p>
          </div>
        ) : (
          transfers.map((transfer) => {
            const active = ["authorizing", "waiting", "sending", "receiving", "verifying"]
              .includes(transfer.transferStatus);
            const progress = Math.max(0, Math.min(100, transfer.progress || 0));
            const sender = transfer.direction === "sent" ? "You" : transfer.senderName || "Participant";
            const recipient = transfer.direction === "sent"
              ? transfer.receiver?.name || "Participant"
              : localName || "You";
            const typeLabel = transfer.mimeType || "Unknown type";
            return (
              <article key={transfer.transferId} className="rounded-2xl border border-slate-800/80 bg-[#101624]/70 p-3">
                <div className="flex items-start gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#6366F1]/10 text-[#A5B4FC]">
                    <FileIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-white" title={transfer.fileName}>{transfer.fileName}</p>
                    <p className="mt-1 truncate text-[10px] text-slate-500">
                      {formatBytes(transfer.fileSize)} · {typeLabel}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-500">
                      {sender} → {recipient} · {formatTime(transfer.timestamp)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2 text-[10px]">
                  <span className={
                    transfer.transferStatus === "failed" ? "text-red-300"
                      : transfer.transferStatus === "completed" ? "text-emerald-300"
                        : transfer.transferStatus === "interrupted" ? "text-amber-300"
                          : "text-slate-400"
                  }>
                    {statusLabel(transfer.transferStatus)}
                    {active && ` · ${progress}%`}
                  </span>
                  {active ? (
                    <button
                      type="button"
                      onClick={() => handleCancelTransfer?.(transfer.transferId)}
                      className="rounded-md px-2 py-1 text-red-300 hover:bg-red-500/10"
                    >
                      Cancel
                    </button>
                  ) : transfer.direction === "received" && transfer.transferStatus === "completed" && canDownload?.(transfer.transferId) ? (
                    <button
                      type="button"
                      onClick={() => handleDownload?.(transfer.transferId)}
                      className="rounded-md px-2 py-1 font-semibold text-[#38BDF8] hover:bg-sky-500/10"
                    >
                      Download
                    </button>
                  ) : transfer.direction === "received" && transfer.transferStatus === "completed" ? (
                    <span className="text-slate-500">Not saved on this device</span>
                  ) : null}
                </div>
                {active && (
                  <div
                    className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800"
                    role="progressbar"
                    aria-label={`${transfer.fileName} transfer progress`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={progress}
                  >
                    <div className="h-full rounded-full bg-[#38BDF8] transition-[width]" style={{ width: `${progress}%` }} />
                  </div>
                )}
                {transfer.error && (
                  <p className="mt-2 break-words text-[10px] text-red-300">{transfer.error}</p>
                )}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
