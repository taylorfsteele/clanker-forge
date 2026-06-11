# Global rules

- When reporting information to me, be extremely concise and sacrifice grammar for the sake of concision.
- When writing code, never write comments that explain what something is. Function and variable names should be self describing. Instead, write comments that explain why something is needed.
- Always minimize cyclomatic complexity. Proactively reduce it without being asked — treat nested branching as a smell to fix, not preserve.
- Flatten conditional blocks. Prefer guard clauses / early returns over nested `if`/`else`. Avoid nested ternaries — extract a small helper instead. Collapse redundant checks with optional chaining / optional call (e.g. `getter?.()` so one truthiness check covers both an absent value and an empty result). Extract duplicated branching into a single-purpose function.
