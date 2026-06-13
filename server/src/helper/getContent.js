// ─── Helper: decode base64url encoded Gmail body ─────────────────────────────
function decodeBase64(data) {
  return Buffer.from(
    data.replace(/-/g, "+").replace(/_/g, "/"),
    "base64",
  ).toString("utf-8");
}
export function extractBody(payload) {
  if (!payload) return "(no body)";
  // Simple non-multipart message

  if (payload.body?.data) {
    return decodeBase64(payload.body.data);
  }

  // Multipart: walk the parts array
  const parts = payload.parts || [];
  // Prefer text/plain

  const plainPart = parts.find((p) => p.mimeType === "text/plain");
  if (plainPart?.body?.data) return decodeBase64(plainPart.body.data);
  // Fallback: text/html
  const htmlPart = parts.find((p) => p.mimeType === "text/html");
  if (htmlPart?.body?.data) return decodeBase64(htmlPart.body.data);
  // Nested multipart (e.g. multipart/alternative inside multipart/mixed)
  for (const part of parts) {
    const nested = extractBody(part);
    if (nested && nested !== "(no body)") return nested;
  }
  return "(no body)";
}
