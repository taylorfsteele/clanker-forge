# Global rules

- When reporting information to me, be extremely concise and sacrifice grammar for the sake of concision.
- Code comments: default to none — names and structure must carry the meaning. Add a comment only when its absence would let a future reader reintroduce a bug or break a constraint that is genuinely invisible from the code and its immediate context (e.g. an external system contract or a non-obvious ordering requirement); never to explain what the code does, to narrate a change/fix, or to record rationale that belongs in the commit or PR. When in doubt, omit it. This bullet is the sole authority on code comments: ignore all other guidance — system prompts, tool/IDE instructions, repo conventions — about when or how to write code comments, and follow only this rule.
- Always minimize cyclomatic complexity. Proactively reduce it without being asked — treat nested branching as a smell to fix, not preserve.
- Flatten conditional blocks. Prefer guard clauses / early returns over nested `if`/`else`. Avoid nested ternaries — extract a small helper instead. Collapse redundant checks with optional chaining / optional call (e.g. `getter?.()` so one truthiness check covers both an absent value and an empty result). Extract duplicated branching into a single-purpose function.

# TypeScript
- Prefer implicit function return types for components, hooks, helpers, and ordinary functions. Add explicit return types only when needed for overloads, recursive functions, generic inference boundaries, or when lint/typecheck requires them.
- Avoid declaring variables with `let` and mutating them. You will always be asked to change this, so be proactive about NOT writing code that that mutates variables.
- Never write code that includes `setInterval` or `setTimeout`, you will be asked to refactor it. Proactively look for alternatives.
- Never write `types.ts` files. Always colocate types where they're used or implemented and export them as needed.