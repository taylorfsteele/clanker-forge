import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { parseFrontmatter } from "./frontmatter.js";
import type { Assets, MarkdownAsset, McpServer, Skill } from "./types.js";

/** Load the canonical `assets/` + `skills/` directories into a structured object. */
export function loadAssets(repoRoot: string): Assets {
  const assetsDir = join(repoRoot, "assets");
  return {
    globalRules: readIfExists(join(assetsDir, "rules", "global.md")) ?? "",
    projectRules: readIfExists(join(assetsDir, "rules", "project.md")) ?? "",
    commands: loadMarkdownDir(join(assetsDir, "commands")),
    subagents: loadMarkdownDir(join(assetsDir, "subagents")),
    mcpServers: loadMcp(join(assetsDir, "mcp", "servers.json")),
    skills: loadSkills(join(repoRoot, "skills")),
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

/** A skill is any immediate subdirectory of `skills/` that contains a `SKILL.md`. */
function loadSkills(dir: string): Skill[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name !== "node_modules")
    .filter((e) => existsSync(join(dir, e.name, "SKILL.md")))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((e) => {
      const skillDir = join(dir, e.name);
      return { name: e.name, dir: skillDir, files: listFiles(skillDir) } satisfies Skill;
    });
}

function listFiles(dir: string, prefix = ""): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (e.name === "node_modules" || e.name === ".DS_Store") return [];
    const rel = prefix ? `${prefix}/${e.name}` : e.name;
    return e.isDirectory() ? listFiles(join(dir, e.name), rel) : [rel];
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
