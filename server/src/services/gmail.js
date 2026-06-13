import { extractBody } from "../helper/getContent.js";

let gmailClient = null;

// ─── Init ──────────────────────────────────────────────────────────────────────
export function setGmailClient(client) {
  gmailClient = client;
}

export function getGmailClient() {
  return gmailClient;
}

// ─── Get Unread Emails ─────────────────────────────────────────────────────────
export async function getUnreadEmails(maxResults = 5) {
  const res = await gmailClient.users.messages.list({
    userId: "me",
    q: "is:unread",
    maxResults,
  });

  const messages = res.data.messages || [];
  if (!messages.length) return "No unread emails.";

  const details = await Promise.all(
    messages.map(async (msg) => {
      const d = await gmailClient.users.messages.get({
        userId: "me",
        id: msg.id,
        format: "full",
      });
      const h = d.data.payload.headers || [];
      const get = (name) => h.find((x) => x.name === name)?.value ?? "";
      const body = extractBody(d.data.payload);
      return `From: ${get("From")}\nSubject: ${get("Subject")}\nDate: ${get("Date")}\nPreview: ${body.trim().slice(0, 300)}`;
    }),
  );

  return details.join("\n\n---\n\n");
}

// ─── Send Email ────────────────────────────────────────────────────────────────
export async function sendEmail({ to, subject, body }) {
  const raw = Buffer.from(
    [
      `To: ${to}`,
      `Subject: ${subject}`,
      `Content-Type: text/plain; charset=utf-8`,
      ``,
      body,
    ].join("\n"),
  )
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  await gmailClient.users.messages.send({ userId: "me", requestBody: { raw } });
  return `Email sent to ${to}`;
}

// ─── Search Emails ─────────────────────────────────────────────────────────────
export async function searchEmails(query, maxResults = 5) {
  const res = await gmailClient.users.messages.list({
    userId: "me",
    q: query,
    maxResults,
  });

  const messages = res.data.messages || [];
  if (!messages.length) return `No emails found for: "${query}"`;

  const details = await Promise.all(
    messages.map(async (msg) => {
      const d = await gmailClient.users.messages.get({
        userId: "me",
        id: msg.id,
        format: "full",
      });
      const h = d.data.payload.headers || [];
      const get = (name) => h.find((x) => x.name === name)?.value ?? "";
      return `From: ${get("From")}\nSubject: ${get("Subject")}\nDate: ${get("Date")}`;
    }),
  );

  return details.join("\n\n---\n\n");
}
