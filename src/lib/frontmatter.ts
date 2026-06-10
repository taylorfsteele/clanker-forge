/**
 * Minimal frontmatter handling for our own assets. We control the input, so this
 * deliberately supports only flat `key: value` pairs (the shape every command,
 * subagent, and skill here uses) rather than pulling in a full YAML dependency.
 */

export interface ParsedFrontmatter {
  frontmatter: Record<string, string>;
  body: string;
}

const FENCE = "---";

export function parseFrontmatter(raw: string): ParsedFrontmatter {
  const text = raw.replace(/^﻿/, "");
  const lines = text.split("\n");
  if (lines[0]?.trim() !== FENCE) {
    return { frontmatter: {}, body: text };
  }

  const frontmatter: Record<string, string> = {};
  let i = 1;
  for (; i < lines.length; i++) {
    const line = lines[i]!;
    if (line.trim() === FENCE) {
      i++;
      break;
    }
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    if (!key) continue;
    frontmatter[key] = stripQuotes(line.slice(idx + 1).trim());
  }

  // Skip a single blank line after the closing fence for clean bodies.
  if (lines[i]?.trim() === "") i++;
  return { frontmatter, body: lines.slice(i).join("\n") };
}

/** Serialize flat frontmatter + body back into a markdown document. */
export function serializeFrontmatter(
  frontmatter: Record<string, string | undefined>,
  body: string,
): string {
  const entries = Object.entries(frontmatter).filter(
    (entry): entry is [string, string] => entry[1] !== undefined,
  );
  if (entries.length === 0) return ensureTrailingNewline(body);

  const lines = entries.map(([key, value]) => `${key}: ${quoteIfNeeded(value)}`);
  return `${FENCE}\n${lines.join("\n")}\n${FENCE}\n\n${ensureTrailingNewline(body).trimStart()}`;
}

function stripQuotes(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function quoteIfNeeded(value: string): string {
  // Quote when the value would otherwise confuse a YAML reader.
  if (/^[\s]|[\s]$|:\s|^[>|&*!#%@`]|^\[|^\{/.test(value) || value === "") {
    return JSON.stringify(value);
  }
  return value;
}

function ensureTrailingNewline(text: string): string {
  return text.endsWith("\n") ? text : `${text}\n`;
}
