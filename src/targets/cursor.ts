import { join } from "node:path";
import { parseFrontmatter, serializeFrontmatter } from "../lib/frontmatter.js";
import type { Assets, SyncContext, Target } from "../lib/types.js";

/**
 * Cursor's config is project-scoped. It reads root `AGENTS.md` plus `.cursor/rules/*.mdc`
 * (which need their own frontmatter), `.cursor/commands/*.md`, and `.cursor/mcp.json`.
 * In global mode only the user-level `~/.cursor` pieces (commands, MCP) are written.
 */
export const cursor: Target = {
  name: "cursor",
  write(assets: Assets, ctx: SyncContext) {
    const { writer } = ctx;

    if (ctx.mode === "project") {
      // Root AGENTS.md (cross-tool) + the Cursor-native always-on rule.
      const rules = parseFrontmatter(assets.projectRules).body;
      writer.write(join(ctx.projectDir, "AGENTS.md"), ensureNewline(rules));
      const mdc = serializeFrontmatter(
        { description: "Project working agreements", alwaysApply: "true" },
        rules,
      );
      writer.write(join(ctx.projectDir, ".cursor", "rules", "main.mdc"), mdc);
    } else {
      // Cursor's global "User Rules" live in the app settings, not a file on disk, so they
      // can't be written here. Paste assets/rules/global.md into Cursor → Settings → Rules.
      writer.skip(
        join(ctx.home, ".cursor", "rules"),
        "Cursor user rules are UI-only; copy assets/rules/global.md into Settings → Rules",
      );
    }

    const base = ctx.mode === "global" ? join(ctx.home, ".cursor") : join(ctx.projectDir, ".cursor");

    // Cursor commands are plain markdown — drop Claude-only frontmatter keys.
    for (const cmd of assets.commands) {
      writer.write(join(base, "commands", `${cmd.name}.md`), ensureNewline(cmd.body));
    }

    // Cursor has no first-class subagent concept.
    if (assets.subagents.length > 0) {
      writer.skip(join(base, "agents"), "Cursor has no subagent equivalent; skipped");
    }

    if (Object.keys(assets.mcpServers).length > 0) {
      writer.write(
        join(base, "mcp.json"),
        JSON.stringify({ mcpServers: assets.mcpServers }, null, 2) + "\n",
      );
    }
  },
};

function ensureNewline(text: string): string {
  return text.endsWith("\n") ? text : `${text}\n`;
}
