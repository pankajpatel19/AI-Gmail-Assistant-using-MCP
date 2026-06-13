export default function ChatHeader({ theme, toggleTheme }) {
  return (
    <header className="px-6 py-5 flex items-center gap-4">
      <div className="w-10 h-10 border-2 border-black dark:border-white bg-white dark:bg-black flex items-center justify-center text-xl shrink-0 shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff]">
        ✉️
      </div>
      <div className="flex-1">
        <h1 className="text-lg font-bold uppercase tracking-wide">AI Gmail Assistant</h1>
        <p className="text-xs font-semibold mt-0.5 opacity-70">Powered by Pankaj</p>
      </div>
      <button 
        onClick={toggleTheme}
        className="w-10 h-10 border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white flex items-center justify-center text-xl cursor-pointer shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] hover:-translate-y-0.5 active:translate-y-0.5 active:translate-x-0.5 active:shadow-[0_0_0_0_#000] dark:active:shadow-[0_0_0_0_#fff] transition-all"
        title="Toggle Theme"
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
    </header>
  );
}
