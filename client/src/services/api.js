const BASE = import.meta.env.VITE_BACK_URL;

export async function sendChatMessage(messages) {
  const res = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  return res.json(); // { reply } or { error }
}
