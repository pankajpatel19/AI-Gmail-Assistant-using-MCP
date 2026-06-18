import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { checkAuth } from "./auth.js";
import {
  setGmailClient,
  getUnreadEmails,
  sendEmail,
  searchEmails,
  create_draft,
  markAsRead,
  delete_email,
  trash_email,
  star_email,
  move_email_to_label,
  archive_email,
  unarchive_email,
  get_archived_emails,
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

server.registerTool(
  "mark_as_read",
  "Mark an email as read",
  {
    email_id: z.string().describe("Email ID to mark as read"),
  },
  async ({ email_id }) => {
    try {
      const result = await markAsRead(email_id);
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
  "create_draft",
  "Create a draft email",
  {
    to: z.string().describe("Recipient email address"),
    subject: z.string().describe("Email subject"),
    body: z.string().describe("Email body text"),
  },
  async ({ to, subject, body }) => {
    try {
      const result = await create_draft({ to, subject, body });
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
  "delete_email",
  "Delete an email",
  {
    email_id: z.string().describe("Email ID to delete"),
  },
  async ({ email_id }) => {
    try {
      const result = await delete_email(email_id);
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
  "trash_email",
  "Trash an email",
  {
    email_id: z.string().describe("Email ID to trash"),
  },
  async ({ email_id }) => {
    try {
      const result = await trash_email(email_id);
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
  "star_email",
  "Star an email",
  {
    email_id: z.string().describe("Email ID to star"),
  },
  async ({ email_id }) => {
    try {
      const result = await star_email(email_id);
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
  "move_email_to_label",
  "Move an email to a label",
  {
    email_id: z.string().describe("Email ID to move"),
    label_id: z.string().describe("Label ID to move to"),
  },
  async ({ email_id, label_id }) => {
    try {
      const result = await move_email_to_label(email_id, label_id);
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
  "archive_email",
  "Archive an email",
  {
    email_id: z.string().describe("Email ID to archive"),
  },
  async ({ email_id }) => {
    try {
      const result = await archive_email(email_id);
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
  "unarchive_email",
  "Unarchive an email",
  {
    email_id: z.string().describe("Email ID to unarchive"),
  },
  async ({ email_id }) => {
    try {
      const result = await unarchive_email(email_id);
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
  "get_archived_emails",
  "Get archived emails",
  {},
  async () => {
    try {
      const result = await get_archived_emails();
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
