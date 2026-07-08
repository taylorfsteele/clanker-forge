import type { McpServer } from "./types.js";

/**
 * Render MCP servers as Codex `config.toml` tables. Codex namespaces servers under
 * `[mcp_servers.<name>]` rather than the JSON `mcpServers` object the other tools use.
 *
 * This emits only the keys our `servers.json` schema uses (command/args/env/url/type),
 * which is all Codex needs — it is not a general-purpose TOML serializer.
 */
export function renderCodexMcp(servers: Record<string, McpServer>): string {
  const blocks: string[] = [];
  for (const [name, server] of Object.entries(servers)) {
    const lines = [`[mcp_servers.${tomlKey(name)}]`];
    if (server.command !== undefined) lines.push(`command = ${tomlString(server.command)}`);
    if (server.args !== undefined) lines.push(`args = ${tomlArray(server.args)}`);
    if (server.url !== undefined) lines.push(`url = ${tomlString(server.url)}`);
    if (server.type !== undefined) lines.push(`type = ${tomlString(server.type)}`);
    if (server.env && Object.keys(server.env).length > 0) {
      lines.push("");
      lines.push(`[mcp_servers.${tomlKey(name)}.env]`);
      for (const [k, v] of Object.entries(server.env)) {
        lines.push(`${tomlKey(k)} = ${tomlString(v)}`);
      }
    }
    blocks.push(lines.join("\n"));
  }
  return blocks.join("\n\n") + (blocks.length ? "\n" : "");
}

export interface CodexAgent {
  name: string;
  description: string;
  developerInstructions: string;
  model?: string;
  readonly?: boolean;
}

/**
 * Render a Codex custom agent (`.codex/agents/*.toml`). `developer_instructions` is the
 * agent's system prompt; omitted optional fields inherit from the parent session.
 */
export function renderCodexAgent(agent: CodexAgent): string {
  const lines = [
    `name = ${tomlString(agent.name)}`,
    `description = ${tomlString(agent.description)}`,
  ];
  if (agent.model) lines.push(`model = ${tomlString(agent.model)}`);
  if (agent.readonly) lines.push('sandbox_mode = "read-only"');
  lines.push(`developer_instructions = ${tomlMultiline(agent.developerInstructions)}`);
  return lines.join("\n") + "\n";
}

function tomlMultiline(value: string): string {
  // TOML strips the first newline after the opening delimiter, so this round-trips the
  // body verbatim. Literal (single-quote) strings avoid escaping the markdown content.
  const body = value.endsWith("\n") ? value : `${value}\n`;
  return `'''\n${body}'''`;
}

function tomlString(value: string): string {
  return JSON.stringify(value); // basic TOML strings share JSON's escaping/quoting
}

function tomlArray(values: string[]): string {
  return `[${values.map(tomlString).join(", ")}]`;
}

function tomlKey(key: string): string {
  return /^[A-Za-z0-9_-]+$/.test(key) ? key : tomlString(key);
}
