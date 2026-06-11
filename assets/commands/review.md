---
description: Review and fix common agent slop — flatten cyclomatic complexity, drop conditional let-mutation, prefer array methods, extract complex conditionals.
---

Review and fix code that exhibits common agent slop patterns. $ARGUMENTS

## Determine scope

If `$ARGUMENTS` contains file paths, review those files. Otherwise, review all uncommitted changed files by running `git diff --name-only` and `git diff --cached --name-only` to get the list. Only review files with code extensions (`.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`). If there are no changed files and no arguments were provided, tell the user and stop.

## Load project style rules

Check if `/rules/` exists in the current project. If it does, read all files in that directory. These are additional project-specific style rules — apply them alongside the core rules below.

## Read the files

Read every file in scope in full. You need complete context to review properly.

## Review and fix

Go through each file and fix violations of the following rules. Do not just report issues — fix them directly using the Edit tool. If a file has no violations, skip it silently.

### Rule 1: Flatten cyclomatic complexity

Nested if/else chains, nested try/catch blocks, and deeply indented conditional logic must be flattened. Apply these techniques:

- **Data-driven matching**: Replace chains of if/else-if that test conditions and map to values with a declarative matcher array. The function that consumes the array should be flat — a single `.find()` or loop with early return.

```typescript
// BAD: nested if/else chain
function classify(msg: string) {
  if (msg.includes("not found")) {
    if (msg.includes("404")) {
      return "NOT_FOUND";
    } else {
      return "MISSING";
    }
  } else if (msg.includes("timeout")) {
    return "TIMEOUT";
  } else {
    return "UNKNOWN";
  }
}

// GOOD: data-driven matching
const CLASSIFIERS = [
  { test: (m: string) => m.includes("not found") && m.includes("404"), code: "NOT_FOUND" },
  { test: (m: string) => m.includes("not found"), code: "MISSING" },
  { test: (m: string) => m.includes("timeout"), code: "TIMEOUT" },
] as const;

function classify(msg: string) {
  return CLASSIFIERS.find((c) => c.test(msg))?.code ?? "UNKNOWN";
}
```

- **Early returns**: Replace if/else blocks with guard clauses that return early. The main logic should be at the top level of indentation, not nested inside conditions.
- **Extract helpers**: When a try/catch or conditional block contains complex logic, extract it into a well-named function. The calling function should read as a sequence of high-level steps.

### Rule 2: No `let` with conditional mutation

Never declare a variable with `let` and then assign it inside an if/else or other block. Use `const` with a ternary, a function call, or an immediately-evaluated expression.

```typescript
// BAD
let result;
if (condition) {
  result = valueA;
} else {
  result = valueB;
}

// GOOD
const result = condition ? valueA : valueB;
```

For more complex cases, extract to a function:

```typescript
// BAD
let config;
if (env === "prod") {
  config = { url: PROD_URL, retries: 3 };
} else if (env === "staging") {
  config = { url: STAGING_URL, retries: 1 };
} else {
  config = { url: LOCAL_URL, retries: 0 };
}

// GOOD
const config = resolveConfig(env);
```

Also flag `let` with `++`, `+=`, or other reassignment inside `.map()`, `.forEach()`, or other callbacks. Use the callback's index parameter or array methods instead.

### Rule 3: Array methods over imperative loops

Replace `for` loops and `for...of` loops that build up arrays or values with `.map()`, `.filter()`, `.reduce()`, `.find()`, `.some()`, `.every()`, or `.flatMap()` where the intent is clearer. Do not force this when a loop is genuinely clearer (e.g., loops with complex control flow like `break`/`continue` on multiple conditions).

```typescript
// BAD
const names = [];
for (const user of users) {
  if (user.active) {
    names.push(user.name);
  }
}

// GOOD
const names = users.filter((u) => u.active).map((u) => u.name);
```

### Rule 4: Extract complex conditionals

When a conditional expression is long or combines multiple checks, extract it into a well-named function or const.

```typescript
// BAD
if (user.role === "admin" && user.permissions.includes("write") && !user.suspended) {
  // ...
}

// GOOD
const canWrite = user.role === "admin" && user.permissions.includes("write") && !user.suspended;
if (canWrite) {
  // ...
}
```

## After fixing

After making all edits, provide a brief summary of what you changed and why. Group by file. Keep it concise — one line per fix is enough.
