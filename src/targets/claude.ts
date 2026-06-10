import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseFrontmatter, serializeFrontmatter } from "../lib/frontmatter.js";
import type { Assets, SyncContext, Target } from "../lib/types.js";

/**
 * Claude Code is the only target that supports every asset type natively:
 * CLAUDE.md memory, `commands/`, `agents/` (subagents), and `mcpServers`.
 */
export const claude: Target = {
  name: "claude",
  write(assets: Assets, ctx: SyncContext) {
    const { writer } = ctx;
    const base = ctx.mode === "global" ? join(ctx.home, ".claude") : join(ctx.projectDir, ".claude");

    // Rules / memory → CLAUDE.md (global rules at user level, project rules in the repo)
    const rules = parseFrontmatter(ctx.mode === "global" ? assets.globalRules : assets.projectRules).body;
    if (rules.trim()) {
      const rulesPath = ctx.mode === "global"
        ? join(ctx.home, ".claude", "CLAUDE.md")
        : join(ctx.projectDir, "CLAUDE.md");
      writer.write(rulesPath, ensureNewline(rules));
    }

    // Slash commands → keep Claude-supported frontmatter keys.
    for (const cmd of assets.commands) {
      const fm = pick(cmd.frontmatter, ["description", "argument-hint", "allowed-tools", "model"]);
      writer.write(join(base, "commands", `${cmd.name}.md`), serializeFrontmatter(fm, cmd.body));
    }

    // Subagents → .claude/agents/*.md
    for (const agent of assets.subagents) {
      const fm = pick(agent.frontmatter, ["name", "description", "tools", "model"]);
      writer.write(join(base, "agents", `${agent.name}.md`), serializeFrontmatter(fm, agent.body));
    }

    // MCP servers
    if (Object.keys(assets.mcpServers).length > 0) {
      if (ctx.mode === "project") {
        writer.write(
          join(ctx.projectDir, ".mcp.json"),
          JSON.stringify({ mcpServers: assets.mcpServers }, null, 2) + "\n",
        );
      } else {
        // Merge into the existing ~/.claude.json without clobbering other state.
        const file = join(ctx.home, ".claude.json");
        const current = existsSync(file)
          ? (JSON.parse(readFileSync(file, "utf8")) as Record<string, unknown>)
          : {};
        const merged = {
          ...current,
          mcpServers: { ...(current.mcpServers as object | undefined), ...assets.mcpServers },
        };
        writer.write(file, JSON.stringify(merged, null, 2) + "\n");
      }
    }
  },
};

function pick(obj: Record<string, string>, keys: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of keys) if (obj[key] !== undefined) out[key] = obj[key]!;
  return out;
}

function ensureNewline(text: string): string {
  return text.endsWith("\n") ? text : `${text}\n`;
}
