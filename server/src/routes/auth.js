import { Router } from "express";
import { getAuthUrl, handleCallback, checkAuth, logout } from "../../auth.js";
import { setGmailClient } from "../services/gmail.js";
import { FRONTEND_URL } from "../../env.js";

const router = Router();

// GET /api/auth/status
router.get("/status", async (req, res) => {
  try {
    const client = checkAuth();
    if (client) {
      setGmailClient(client);

      // Fetch user profile to get email ID
      const profile = await client.users.getProfile({ userId: "me" });
      res.json({ authenticated: true, email: profile.data.emailAddress });
    } else {
      res.json({ authenticated: false });
    }
  } catch (error) {
    console.error("Auth status error:", error);
    res.json({ authenticated: false });
  }
});

// GET /api/auth/login
router.get("/login", (req, res) => {
  const url = getAuthUrl();
  res.redirect(url);
});

// GET /api/auth/callback
router.get("/callback", async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) throw new Error("No code provided");

    const client = await handleCallback(code);
    setGmailClient(client);

    // Redirect back to frontend
    res.redirect(FRONTEND_URL);
  } catch (error) {
    console.error("Auth callback error:", error);
    res.redirect(`${FRONTEND_URL}?error=auth_failed`);
  }
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  logout();
  setGmailClient(null);
  res.json({ success: true });
});

export default router;
