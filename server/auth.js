import fs from "fs";
import { google } from "googleapis";

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
];

const TOKEN_PATH = "token.json";
const CREDENTIALS_PATH = "credentials.json";

function getOAuth2Client() {
  const credential = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf-8"));
  const { client_secret, client_id } = credential.installed;

  return new google.auth.OAuth2(
    client_id,
    client_secret,
    "http://localhost:5000/api/auth/callback"
  );
}

export function getAuthUrl() {
  const client = getOAuth2Client();
  return client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent select_account", // Forces account selection
  });
}

export async function handleCallback(code) {
  const client = getOAuth2Client();
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
  return getGmailClientFromToken(tokens);
}

export function checkAuth() {
  if (fs.existsSync(TOKEN_PATH)) {
    try {
      const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8"));
      return getGmailClientFromToken(token);
    } catch {
      return null;
    }
  }
  return null;
}

export function logout() {
  if (fs.existsSync(TOKEN_PATH)) {
    fs.unlinkSync(TOKEN_PATH);
  }
}

export function getGmailClientFromToken(token) {
  const client = getOAuth2Client();
  client.setCredentials(token);
  return google.gmail({ version: "v1", auth: client });
}
