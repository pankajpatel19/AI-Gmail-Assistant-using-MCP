import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { checkAuth } from "./auth.js";
import {
  setGmailClient,
  getUnreadEmails,
  sendEmail,
  searchEmails,
} from "./src/services/gmail.js";
import { z } from "zod";

// Initialize the MCP server
const server = new McpServer({
  name: "gmail-mcp-server",
  version: "1.0.0",
});

async function initGmail() {
  try {
    const gmailClient = await checkAuth();
    setGmailClient(gmailClient);
    console.error("Gmail authenticated successfully in MCP Server");
  } catch (err) {
    console.error("Gmail auth failed in MCP Server:", err.message);
    process.exit(1);
  }
}

server.registerTool(
  "get_unread_emails",
  "Fetch unread emails from the Gmail inbox",
  {
    max_results: z
      .number()
      .optional()
      .describe("Number of emails to fetch (default 5)"),
  },
  async ({ max_results }) => {
    try {
      const result = await getUnreadEmails(max_results || 5);
      return { content: [{ type: "text", text: result }] };
    } catch (e) {
      return {
        content: [{ type: "text", text: `Error: ${e.message}` }],
        isError: true,
      };
    }
  },
);

server.registerTool(
  "send_email",
  "Send an email to someone",
  {
    to: z.string().describe("Recipient email address"),
    subject: z.string().describe("Email subject"),
    body: z.string().describe("Email body text"),
  },
  async ({ to, subject, body }) => {
    try {
      const result = await sendEmail({ to, subject, body });
      return { content: [{ type: "text", text: result }] };
    } catch (e) {
      return {
        content: [{ type: "text", text: `Error: ${e.message}` }],
        isError: true,
      };
    }
  },
);

server.registerTool(
  "search_emails",
  "Search emails by keyword, sender, subject etc.",
  {
    query: z
      .string()
      .describe("Gmail search query (e.g. 'from:boss@company.com')"),
    max_results: z
      .number()
      .optional()
      .describe("Number of results (default 5)"),
  },
  async ({ query, max_results }) => {
    try {
      const result = await searchEmails(query, max_results || 5);
      return { content: [{ type: "text", text: result }] };
    } catch (e) {
      return {
        content: [{ type: "text", text: `Error: ${e.message}` }],
        isError: true,
      };
    }
  },
);

// ─── Start the server ─────────────────────────────────────────────────────────
await initGmail();

const transport = new StdioServerTransport();
await server.connect(transport);
