import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { parseFrontmatter } from "./frontmatter.js";
import type { Assets, MarkdownAsset, McpServer } from "./types.js";

/** Load the canonical `assets/` directory into a structured object. */
export function loadAssets(assetsDir: string): Assets {
  return {
    globalRules: readIfExists(join(assetsDir, "rules", "global.md")) ?? "",
    projectRules: readIfExists(join(assetsDir, "rules", "project.md")) ?? "",
    commands: loadMarkdownDir(join(assetsDir, "commands")),
    subagents: loadMarkdownDir(join(assetsDir, "subagents")),
    mcpServers: loadMcp(join(assetsDir, "mcp", "servers.json")),
  };
}

function loadMarkdownDir(dir: string): MarkdownAsset[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((file) => {
      const { frontmatter, body } = parseFrontmatter(readFileSync(join(dir, file), "utf8"));
      return { name: basename(file, ".md"), frontmatter, body } satisfies MarkdownAsset;
    });
}

function loadMcp(file: string): Record<string, McpServer> {
  const raw = readIfExists(file);
  if (!raw) return {};
  const parsed = JSON.parse(raw) as { mcpServers?: Record<string, McpServer> };
  return parsed.mcpServers ?? {};
}

function readIfExists(file: string): string | undefined {
  return existsSync(file) ? readFileSync(file, "utf8") : undefined;
}
