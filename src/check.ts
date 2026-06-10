import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseFrontmatter } from "./lib/frontmatter.js";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const errors: string[] = [];

/** Walk a directory recursively, yielding files whose basename matches `match`. */
function* walk(dir: string, match: (name: string) => boolean): Generator<string> {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (entry === "node_modules") continue;
    if (statSync(full).isDirectory()) yield* walk(full, match);
    else if (match(entry)) yield full;
  }
}

function requireKeys(file: string, keys: string[]) {
  const { frontmatter } = parseFrontmatter(readFileSync(file, "utf8"));
  for (const key of keys) {
    if (!frontmatter[key]?.trim()) {
      errors.push(`${relative(repoRoot, file)}: missing required frontmatter "${key}"`);
    }
  }
}

// Skills: every SKILL.md needs name + description.
for (const file of walk(join(repoRoot, "skills"), (n) => n === "SKILL.md")) {
  requireKeys(file, ["name", "description"]);
}

// Commands: need a description so agents know when to use them.
for (const file of walk(join(repoRoot, "assets", "commands"), (n) => n.endsWith(".md"))) {
  requireKeys(file, ["description"]);
}

// Subagents: need name + description.
for (const file of walk(join(repoRoot, "assets", "subagents"), (n) => n.endsWith(".md"))) {
  requireKeys(file, ["name", "description"]);
}

if (errors.length > 0) {
  console.error("Frontmatter validation failed:\n");
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}

console.log("✓ Frontmatter valid for all skills, commands, and subagents.");
