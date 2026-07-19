import { join } from "node:path";
import { parseFrontmatter, serializeFrontmatter } from "../lib/frontmatter.js";
import { resolveModel } from "../lib/models.js";
import { writeSkills } from "../lib/skills.js";
import type { Assets, SyncContext, Target } from "../lib/types.js";

/**
 * Cursor reads root `AGENTS.md` plus `.cursor/rules/*.mdc`, `.cursor/commands/*.md`,
 * `.cursor/agents/*.md`, and `.cursor/mcp.json`. In global mode the user-level `~/.cursor`
 * equivalents are written (commands, subagents, MCP). User rules remain UI-only.
 *
 * Skills use the cross-tool `~/.agents/skills` store (Cursor's global skill directory).
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

    // Subagents → .cursor/agents/*.md (Cursor frontmatter: name, description, model, readonly)
    for (const agent of assets.subagents) {
      const fm = cursorSubagentFrontmatter(agent.frontmatter);
      writer.write(join(base, "agents", `${agent.name}.md`), serializeFrontmatter(fm, agent.body));
    }

    if (Object.keys(assets.mcpServers).length > 0) {
      writer.write(
        join(base, "mcp.json"),
        JSON.stringify({ mcpServers: assets.mcpServers }, null, 2) + "\n",
      );
    }

    if (assets.skills.length === 0) return;
    if (ctx.mode === "project") {
      writer.skip(join(ctx.projectDir, ".agents", "skills"), "Skills are user-level; run with --global");
      return;
    }
    writeSkills(writer, assets.skills, join(ctx.home, ".agents", "skills"));
  },
};

function cursorSubagentFrontmatter(fm: Record<string, string>): Record<string, string> {
  const out = pick(fm, ["name", "description", "is_background"]);
  const model = resolveModel("cursor", fm.model);
  if (model) out.model = model;
  const disallowed = fm.disallowedTools ?? "";
  if (/\b(Write|Edit)\b/.test(disallowed)) out.readonly = "true";
  return out;
}

function pick(obj: Record<string, string>, keys: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of keys) if (obj[key] !== undefined) out[key] = obj[key]!;
  return out;
}

function ensureNewline(text: string): string {
  return text.endsWith("\n") ? text : `${text}\n`;
}
