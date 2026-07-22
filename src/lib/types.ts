export type TargetName = "claude" | "cursor" | "codex";

export type Mode = "global" | "project";

/** A markdown asset (command or subagent) with parsed frontmatter. */
export interface MarkdownAsset {
  /** Filename without the `.md` extension. */
  name: string;
  /** Parsed flat frontmatter key/value pairs. */
  frontmatter: Record<string, string>;
  /** Markdown body after the frontmatter block. */
  body: string;
}

/** A skill directory (`skills/<name>/` containing a `SKILL.md` plus support files). */
export interface Skill {
  /** Directory name (kebab-case, matches SKILL.md `name`). */
  name: string;
  /** Absolute path to the skill's source directory. */
  dir: string;
  /** Every file in the skill, as paths relative to `dir` (posix separators). */
  files: string[];
}

/** Per-repo skill config (`repo-config/<owner>--<repo>/`), synced to `~/.agents/repo-config`. */
export interface RepoConfig {
  /** Slug directory name (`<owner>--<repo>`). */
  slug: string;
  /** Absolute path to the config's source directory. */
  dir: string;
  /** Every file in the config dir, as paths relative to `dir` (posix separators). */
  files: string[];
}

/** A single MCP server definition (stdio or remote). */
export interface McpServer {
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  url?: string;
  type?: string;
}

/** Everything loaded from `assets/`, ready to render to any target. */
export interface Assets {
  /** Personal user-level rules (`assets/rules/global.md`); synced in --global mode. */
  globalRules: string;
  /** Per-project rules (`assets/rules/project.md`); synced in --project mode. */
  projectRules: string;
  commands: MarkdownAsset[];
  subagents: MarkdownAsset[];
  mcpServers: Record<string, McpServer>;
  /** Portable skills loaded from `skills/` (synced in --global mode). */
  skills: Skill[];
  /** Per-repo skill config loaded from `repo-config/` (synced in --global mode). */
  repoConfigs: RepoConfig[];
}

/** Context handed to each target's `write` function. */
export interface SyncContext {
  mode: Mode;
  /** User home directory. */
  home: string;
  /** Project root (used in project mode). */
  projectDir: string;
  writer: import("./writer.js").Writer;
}

export interface Target {
  name: TargetName;
  write(assets: Assets, ctx: SyncContext): void;
}
