import { useState, useEffect } from "react";
import "./index.css";
import ChatHeader from "./components/ChatHeader.jsx";
import ChatMessages from "./components/ChatMessages.jsx";
import ChatInput from "./components/ChatInput.jsx";
import { sendChatMessage } from "./services/api.js";

export default function App() {
  const [messages, setMessages] = useState([]); // { role, content }
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState({
    checking: true,
    authenticated: false,
    email: "",
  });
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // Check initial theme from localStorage or system
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }
  }, []);

  function toggleTheme() {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  }

  async function checkAuthStatus() {
    try {
      const res = await fetch("http://localhost:5000/api/auth/status");
      const data = await res.json();
      setAuthStatus({
        checking: false,
        authenticated: data.authenticated,
        email: data.email,
      });
    } catch {
      setAuthStatus({ checking: false, authenticated: false, email: "" });
    }
  }

  useEffect(() => {
    checkAuthStatus();
  }, []);

  async function handleLogin() {
    window.location.href = "http://localhost:5000/api/auth/login";
  }

  async function handleLogout() {
    try {
      await fetch("http://localhost:5000/api/auth/logout", { method: "POST" });
      setAuthStatus({ checking: false, authenticated: false, email: "" });
    } catch (e) {
      console.error(e);
    }
  }

  async function sendMessage(text) {
    const userText = (text || input).trim();
    if (!userText || loading) return;

    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const data = await sendChatMessage(newMessages);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply || data.error || "Something went wrong.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "❌ Could not connect to server. Is the backend running?",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (authStatus.checking) {
    return <div className="flex flex-col h-screen max-w-[780px] mx-auto justify-center items-center font-bold">Loading...</div>;
  }

  if (!authStatus.authenticated) {
    return (
      <div className="flex flex-col h-screen max-w-[780px] mx-auto justify-center items-center gap-6">
        <div className="text-7xl">✉️</div>
        <h1 className="text-3xl font-bold uppercase tracking-wide">AI Gmail Assistant</h1>
        <p className="text-center font-medium max-w-[300px]">
          Connect your Google account to manage your emails with AI.
        </p>
        <button
          onClick={handleLogin}
          className="px-8 py-3 text-lg font-bold border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white shadow-[6px_6px_0_0_#000] dark:shadow-[6px_6px_0_0_#fff] cursor-pointer hover:-translate-y-0.5 hover:shadow-[8px_8px_0_0_#000] dark:hover:shadow-[8px_8px_0_0_#fff] active:translate-y-1 active:translate-x-1 active:shadow-[2px_2px_0_0_#000] dark:active:shadow-[2px_2px_0_0_#fff] transition-all"
        >
          LOGIN WITH GOOGLE
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-[780px] mx-auto border-x-2 border-black dark:border-white">
      <div className="flex justify-between items-center border-b-2 border-black dark:border-white bg-white dark:bg-black">
        <ChatHeader theme={theme} toggleTheme={toggleTheme} />
        <div className="px-6 flex items-center gap-4">
          <span className="text-sm font-bold">
            {authStatus.email}
          </span>
          <button
            onClick={handleLogout}
            className="px-3 py-1 font-bold text-xs uppercase border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] cursor-pointer hover:-translate-y-0.5 active:translate-y-0.5 active:translate-x-0.5 active:shadow-[0_0_0_0_#000] dark:active:shadow-[0_0_0_0_#fff] transition-all"
          >
            LOGOUT
          </button>
        </div>
      </div>

      <ChatMessages
        messages={messages}
        loading={loading}
        onSuggestionClick={sendMessage}
      />

      <ChatInput
        input={input}
        loading={loading}
        onChange={setInput}
        onSend={() => sendMessage()}
      />
    </div>
  );
}
