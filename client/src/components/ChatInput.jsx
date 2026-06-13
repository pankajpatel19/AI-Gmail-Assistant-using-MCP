import { useRef } from "react";

export default function ChatInput({ input, loading, onChange, onSend }) {
  const textareaRef = useRef(null);

  function handleChange(e) {
    onChange(e.target.value);
    // Auto-resize
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      onSend();
    }
  }

  return (
    <div className="pt-4 pb-6 px-6 border-t-2 border-black dark:border-white bg-white dark:bg-black">
      <div className="flex gap-3 items-end bg-white dark:bg-black border-2 border-black dark:border-white p-2 shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] focus-within:shadow-[6px_6px_0_0_#000] dark:focus-within:shadow-[6px_6px_0_0_#fff] transition-all">
        <textarea
          ref={textareaRef}
          className="flex-1 bg-transparent text-black dark:text-white font-medium text-sm resize-none max-h-[120px] leading-relaxed outline-none placeholder:text-black/50 dark:placeholder:text-white/50 p-2"
          placeholder="Ask about your emails… (Enter to send, Shift+Enter for newline)"
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button
          className="w-10 h-10 border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white text-base cursor-pointer flex items-center justify-center shrink-0 shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] hover:-translate-y-0.5 active:translate-y-0.5 active:translate-x-0.5 active:shadow-[0_0_0_0_#000] dark:active:shadow-[0_0_0_0_#fff] transition-all disabled:opacity-50 disabled:shadow-none disabled:translate-y-0.5 disabled:translate-x-0.5 disabled:cursor-not-allowed"
          onClick={onSend}
          disabled={!input.trim() || loading}
        >
          ➤
        </button>
      </div>
      <div className="text-xs font-bold uppercase tracking-wide text-center mt-4 opacity-70">
        Shift + Enter for new line · Enter to send
      </div>
    </div>
  );
}
