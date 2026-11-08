"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { SendIcon, ChatIcon } from "./icons";

export default function ChatPanel({ meetingId, name, socketRef }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);
  const listenerAttached = useRef(false);

  // Load existing messages + attach socket listener
  useEffect(() => {
    api(`/meetings/${meetingId}/messages`)
      .then(({ messages: msgs }) => setMessages(msgs || []))
      .catch(() => {});

    const socket = socketRef?.current;
    if (!socket) return;

    function onChatMessage(msg) {
      setMessages((prev) => [...prev, msg]);
    }

    if (!listenerAttached.current) {
      socket.on("chat-message", onChatMessage);
      listenerAttached.current = true;
    }

    return () => {
      socket.off("chat-message", onChatMessage);
      listenerAttached.current = false;
    };
  }, [meetingId, socketRef]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function send(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !socketRef?.current?.connected) return;
    socketRef.current.emit("chat-message", {
      meetingId,
      message: trimmed,
      name,
    });
    setText("");
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Messages Feed ────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3.5 text-xs">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center text-slate-500 py-12">
            <ChatIcon className="w-8 h-8 text-slate-600 mb-2 opacity-60" />
            <p className="font-semibold text-slate-300">No messages yet</p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-[200px]">
              Send a note to start collaborating with everyone in the room.
            </p>
          </div>
        )}

        {messages.map((msg, i) => {
          const isMe = msg.senderName === name;
          const initial = msg.senderName ? msg.senderName[0].toUpperCase() : "U";

          return (
            <div
              key={msg._id || i}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-slate-300 text-[11px]">
                  {isMe ? "You" : msg.senderName}
                </span>
                {msg.createdAt && (
                  <span className="text-[10px] text-slate-500">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>

              <div
                className={`rounded-2xl px-3.5 py-2.5 max-w-[85%] text-xs leading-relaxed break-words shadow-sm ${
                  isMe
                    ? "bg-[#6366F1] text-white"
                    : "bg-[#1A2437] text-slate-200 border border-slate-700/60"
                }`}
              >
                {msg.message}
              </div>
            </div>
          );
        })}
        <span ref={bottomRef} />
      </div>

      {/* ── Message Input ────────────────────────────────────────── */}
      <form
        onSubmit={send}
        className="flex gap-2 border-t border-slate-800/80 p-3 bg-[#101624]/60"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-w-0 flex-1 rounded-xl border border-slate-700/80 bg-[#151D2E] px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none transition focus:border-[#6366F1]"
          placeholder="Send a message to everyone…"
          maxLength={1500}
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6366F1] text-white transition hover:bg-indigo-600 disabled:opacity-40 shrink-0"
          title="Send"
        >
          <SendIcon className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
