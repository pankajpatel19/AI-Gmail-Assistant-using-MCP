import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { checkAuth } from "./auth.js";
import { setGmailClient } from "./src/services/gmail.js";
import chatRouter from "./src/routes/chat.js";
import authRouter from "./src/routes/auth.js";
import { PORT } from "./env.js";

dotenv.config();

const app = express();
const AVAILBALE_PORT = PORT || 5000;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/chat", chatRouter);

// ─── Start ────────────────────────────────────────────────────────────────────
const client = checkAuth();
if (client) {
  setGmailClient(client);
  console.log("✅ Gmail ready (loaded from token)");
} else {
  console.log("⚠️ Not authenticated. Please login via frontend.");
}

app.listen(AVAILBALE_PORT, () => {
  console.log(`🚀 Server running at http://localhost:${AVAILBALE_PORT}`);
});

export default app;
