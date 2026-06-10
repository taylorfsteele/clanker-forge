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
