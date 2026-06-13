import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";
import { fileURLToPath } from "url";

// Resolve the absolute path to index.js (the MCP server entry point)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverPath = path.resolve(__dirname, "../../index.js"); // src/config -> server/index.js

const client = new Client({
  name: "gmail-mcp-client",
  version: "1.0.0",
});

const transport = new StdioClientTransport({
  command: "node",
  args: [serverPath],
});

try {
  await client.connect(transport);
  console.log("✅ Client connected to Gmail MCP server");

  // List available tools
  // const { tools } = await client.listTools();

  // Call the getUnreadEmail tool
  console.log("\n📬 Fetching unread emails...");
  const result = await client.callTool({
    name: "getUnreadEmail",
    arguments: {},
  });
} catch (err) {
  console.error("❌ Client error:", err.message);
} finally {
  await client.close();
}
