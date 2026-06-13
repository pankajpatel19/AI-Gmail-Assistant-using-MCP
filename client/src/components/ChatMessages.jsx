import { useRef, useEffect } from "react";
import { SUGGESTIONS } from "../constants/suggestions.js";

export default function ChatMessages({ messages, loading, onSuggestionClick }) {
  const bottomRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-4">
      {messages.length === 0 ? (
        // ── Empty / Welcome state ──────────────────────────────────
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-5 py-10">
          <div className="text-[64px]">🤖</div>
          <h2 className="text-xl font-bold uppercase tracking-wide">How can I help you?</h2>
          <p className="text-sm font-medium">
            Ask me to read, search, or send emails.
            <br />I have full access to your Gmail.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-4">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                className="font-bold border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white px-4 py-2 text-xs uppercase cursor-pointer shadow-[3px_3px_0_0_#000] dark:shadow-[3px_3px_0_0_#fff] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#000] dark:hover:shadow-[4px_4px_0_0_#fff] active:translate-y-0.5 active:translate-x-0.5 active:shadow-[1px_1px_0_0_#000] dark:active:shadow-[1px_1px_0_0_#fff] transition-all"
                onClick={() => onSuggestionClick(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* ── Message bubbles ─────────────────────────────────── */}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-2.5 max-w-[90%] animate-fade-up ${
                msg.role === "user" ? "self-end flex-row-reverse" : "self-start"
              }`}
            >
              <div
                className={`w-9 h-9 border-2 border-black dark:border-white flex items-center justify-center text-sm shrink-0 mt-0.5 bg-white dark:bg-black ${
                  msg.role === "user"
                    ? "shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff]"
                    : "shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff]"
                }`}
              >
                {msg.role === "user" ? "👤" : "🤖"}
              </div>
              <div
                className={`px-[16px] py-[12px] text-sm font-medium leading-relaxed whitespace-pre-wrap break-words border-2 border-black dark:border-white bg-white dark:bg-black ${
                  msg.role === "user"
                    ? "shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]"
                    : "shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* ── Typing indicator ────────────────────────────────── */}
          {loading && (
            <div className="flex gap-3 max-w-[90%] animate-fade-up self-start">
              <div className="w-9 h-9 border-2 border-black dark:border-white bg-white dark:bg-black flex items-center justify-center text-sm shrink-0 mt-0.5 shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff]">
                🤖
              </div>
              <div className="px-[18px] py-[16px] border-2 border-black dark:border-white bg-white dark:bg-black shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] flex gap-2 items-center">
                <span className="w-2 h-2 bg-black dark:bg-white animate-bounce-delay" />
                <span className="w-2 h-2 bg-black dark:bg-white animate-bounce-delay animation-delay-200" />
                <span className="w-2 h-2 bg-black dark:bg-white animate-bounce-delay animation-delay-400" />
              </div>
            </div>
          )}
        </>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
