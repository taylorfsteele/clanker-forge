import type { TargetName } from "./types.js";

/**
 * Assets name a semantic tier (`model: fast`) instead of a tool-specific model, so the
 * per-tool model names live in one place rather than being hard-coded per asset. Any value
 * that is not a known tier (e.g. `inherit` or a concrete model ID) is passed through unchanged.
 */
export type ModelTier = "fast" | "default" | "powerful";

const TIERS = ["fast", "default", "powerful"] as const;

export function isModelTier(value: string): value is ModelTier {
  return (TIERS as readonly string[]).includes(value);
}

// The one place to edit when a tool renames its models. `undefined` emits no model,
// letting that tool fall back to its own default.
const TIER_MODELS: Record<TargetName, Record<ModelTier, string | undefined>> = {
  claude: { fast: "haiku", default: "sonnet", powerful: "opus" },
  cursor: { fast: "composer-2.5", default: "inherit", powerful: "inherit" },
  codex: { fast: "gpt-5.4-mini", default: "gpt-5.4", powerful: "gpt-5.4" },
};

export function resolveModel(target: TargetName, model: string | undefined): string | undefined {
  if (!model) return undefined;
  // Claude/Cursor take a literal `inherit`; Codex inherits by omitting the field entirely.
  if (model === "inherit") return target === "codex" ? undefined : "inherit";
  if (!isModelTier(model)) return model;
  return TIER_MODELS[target][model];
}
