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

export async function markAsRead(emailId) {
  await gmailClient.users.messages.modify({
    userId: "me",
    id: emailId,
    requestBody: { removeLabelIds: ["UNREAD"] },
  });
  return `Email ${emailId} marked as read`;
}
export async function create_draft({ to, subject, body }) {
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

  await gmailClient.users.drafts.create({
    userId: "me",
    requestBody: { message: { raw } },
  });
  return `Draft created for ${to}`;
}
export async function delete_email(emailId) {
  await gmailClient.users.messages.delete({ userId: "me", id: emailId });
  return `Email ${emailId} deleted`;
}
export async function trash_email(emailId) {
  await gmailClient.users.messages.trash({ userId: "me", id: emailId });
  return `Email ${emailId} trashed`;
}

export async function star_email(emailId) {
  await gmailClient.users.messages.modify({
    userId: "me",
    id: emailId,
    requestBody: { addLabelIds: ["STARRED"] },
  });
  return `Email ${emailId} starred`;
}

export async function move_email_to_label(emailId, labelId) {
  await gmailClient.users.messages.modify({
    userId: "me",
    id: emailId,
    requestBody: { addLabelIds: [labelId] },
  });
  return `Email ${emailId} moved to label ${labelId}`;
}

export async function archive_email(emailId) {
  await gmailClient.users.messages.modify({
    userId: "me",
    id: emailId,
    requestBody: { removeLabelIds: ["INBOX"] },
  });
  return `Email ${emailId} archived`;
}
export async function unarchive_email(emailId) {
  await gmailClient.users.messages.modify({
    userId: "me",
    id: emailId,
    requestBody: { addLabelIds: ["INBOX"] },
  });
  return `Email ${emailId} unarchived`;
}

export async function get_archived_emails() {
  const res = await gmailClient.users.messages.list({
    userId: "me",
    q: "is:archived",
    maxResults: 5,
  });
  const messages = res.data.messages || [];
  if (!messages.length) return "No archived emails.";
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
