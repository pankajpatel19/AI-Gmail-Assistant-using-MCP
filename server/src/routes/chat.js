import { Router } from "express";
import groq from "../config/groq.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const router = Router();

// ─── MCP Client Setup ──────────────────────────────────────────────────────────
let mcpClient = null;
let groqTools = [];

async function initMcp() {
  if (mcpClient) return;

  console.log("Starting MCP Server process...");
  const transport = new StdioClientTransport({
    command: "node",
    args: ["index.js"], // Starts the local MCP server defined in index.js
  });

  mcpClient = new Client(
    { name: "express-backend", version: "1.0.0" },
    { capabilities: { tools: {} } },
  );

  await mcpClient.connect(transport);

  const toolsResponse = await mcpClient.listTools();

  // Convert MCP tools schema to Groq/OpenAI JSON Schema
  groqTools = toolsResponse.tools.map((t) => ({
    type: "function",
    function: {
      name: t.name,
      description: t.description,
      parameters: t.inputSchema,
    },
  }));

  console.log(
    "MCP Client connected and tools loaded:",
    groqTools.map((t) => t.function.name),
  );
}

const SYSTEM_PROMPT = `You are an AI Gmail assistant. Help the user manage their Gmail inbox.
You can read unread emails, search emails, and send emails using the tools provided.
Always be concise and helpful. When showing emails, format them clearly. and one main thing do not share any details of tools`;

// POST /api/chat
router.post("/", async (req, res) => {
  try {
    await initMcp();

    const { messages } = req.body; // [{ role, content }]

    const allMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages,
    ];

    // First Groq call
    let response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: allMessages,
      tools: groqTools,
      tool_choice: "auto",
      parallel_tool_calls: false,
    });

    let message = response.choices[0].message;

    // Agentic loop — keep calling tools until no more tool_calls
    while (message.tool_calls && message.tool_calls.length > 0) {
      allMessages.push(message);

      const toolResults = await Promise.all(
        message.tool_calls.map(async (call) => {
          let args = {};
          try {
            args = JSON.parse(call.function.arguments || "{}") || {};
          } catch (e) {
            args = {};
          }

          try {
            const result = await mcpClient.callTool({
              name: call.function.name,
              arguments: args,
            });

            // Extract text content from the MCP result format
            const textContent = result.content.map((c) => c.text).join("\n");

            return {
              role: "tool",
              tool_call_id: call.id,
              content: textContent,
            };
          } catch (e) {
            console.error(`MCP Tool error (${call.function.name}):`, e);
            return {
              role: "tool",
              tool_call_id: call.id,
              content: `Error executing tool: ${e.message}`,
            };
          }
        }),
      );

      allMessages.push(...toolResults);

      // Follow-up Groq call
      response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: allMessages,
        tools: groqTools,
        tool_choice: "auto",
        parallel_tool_calls: false,
      });

      message = response.choices[0].message;
    }

    res.json({ reply: message.content });
  } catch (err) {
    console.error("Chat error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
