---
name: prefactor
description: Preparatory refactoring before implementing a change — "make the change easy, then make the easy change" (Kent Beck). Use when about to add a feature or fix that fights the current code structure; invoke deliberately to restructure first (behavior-preserving, verified in isolation, separate commits) so the real change lands as a small, obvious diff.
---

# Prefactor

> "For each desired change, make the change easy (warning: this may be hard), then make the easy change."

This skill is **preparatory refactoring**: when a feature or fix fights the existing structure, reshape the structure *first* so the feature drops in as a near-trivial change. It's like driving 20 miles north to reach the highway so you can then go 100 miles east at triple the speed, instead of crawling straight through the woods.

Refactor only for the change in front of you, never for an imagined future shape — each prefactor you pick should make *this* change easier.

## The one rule everything hangs on

Split every edit into two kinds, and they must not mix:

- **Structural (S)** — change how code is arranged, *never what it does*. The "tidyings" below. Low-risk, reversible, tests stay green throughout.
- **Behavioral (B)** — change what the system does. The actual feature or fix. This carries the real risk.

This is the **"two hats"** rule: you are *either* restructuring *or* changing behavior, never both in the same breath — and you stay conscious of which hat is on. Keep S and B in **separate commits** (ideally separate PRs), and do **S first** so the behavioral change lands as the last edit on a line. The payoff is concrete:

- The feature commit's diff shows *only* the substantive change — far easier to review.
- Every commit builds and passes tests, so `git bisect` and `git revert` stay usable.
- If something breaks, you know whether it was the restructuring or the new behavior.

If you find yourself altering output inside a "refactor" step, you've lost the safety net — split it.

## Workflow

### 1. Define the destination first

Name the change concretely, and make the target executable where you can:

- **Write the failing test** for the new behavior, or
- **Programming by wishful thinking** — write the call site you *wish* existed (call functions at the abstraction level that would make this trivial), then go make those real. This designs the API from the caller's need, not from what's easy to implement.

You can't tell which refactors are "enabling" until you know where you're going.

### 2. Understand the ground, find the seam

Go to where the change lands and read it until you genuinely understand it. As you build that understanding, **move it out of your head and into the code** (rename, extract, regroup) so the next reader doesn't rebuild it from scratch — this is *comprehension refactoring*, and it's often half the prep.

Look for the **seam**: the place where you can alter behavior *without editing in that place* — an injection point, an override, a boundary. In legacy code the seam is usually where your real change will plug in, and writing new code is the *last* thing you do.

### 3. Make the change easy — behavior-preserving, verified, isolated

Pick the smallest structural moves that remove the friction you felt. Run tests / typecheck after *each* one, and commit it on its own. A menu of named, proven moves:

**Tidyings** (small, local):
- **Guard clauses** — early-return on preconditions so the main logic isn't buried in nesting.
- **Extract helper** — pull a coherent block into a named function (creates the seam your change needs).
- **Explaining variable / constant** — name a sub-expression or magic literal after its intent.
- **Explicit parameters** — replace an implicit options bag with named parameters that line up with what you need to pass through.
- **New interface, old implementation** — write the interface you wish you had; have it delegate to the existing code for now.
- **Normalize symmetries** — make code that does the same thing look the same, so divergence signals real difference.
- **Cohesion order / reading order** — move things that change together adjacent, in the order a reader needs them.
- **Dead code** — delete it; version control remembers.

**For larger changes** (when a clean swap isn't a few lines):
- **Parallel change** (expand → migrate → contract) — add the new form alongside the old, migrate callers incrementally, then remove the old. Releasable after every phase.
- **Branch by abstraction** — introduce an abstraction over the part you're replacing, build the new implementation behind it, swap callers over, delete the old. Trunk stays releasable throughout.

Every move here keeps behavior identical. If you can complete *"doing this first makes the change easier because ___"*, keep it. If the blank is "the code is nicer," cut it — that's cleanup for another task (see bounding, below).

### 4. Make the easy change

The ground is prepared; the feature or fix should now be small and almost boring. Make it, verify, commit separately. If it still feels hard, you missed a prefactor — back to step 2.

## Keeping it bounded (the rabbit hole is real)

The rabbit hole is real: you fix one thing, spot another, and before long you're deep in yak hair. Guardrails:

- **Anchor to the feature.** A clear goal makes it easy to resist refactoring easy-but-irrelevant code. The litmus test is always: does this make *this* change easier?
- **Better, not perfect.** Leave the code better than you found it; it can wait for the next visit. Under-doing it is fine — frequently-touched code gets revisited and improves by compounding.
- **Time-box** the prep and treat the box as a hard stop.
- **A structural barrier is a smell, not a license.** If prep balloons, that's a signal to surface a conversation about the design — not to silently expand scope.

### Mid-stream discoveries: stash, don't detour

If you're mid-feature and notice a worthwhile cleanup, don't tangle it in. `git stash` the feature work, do the refactor completely, commit it, then `git stash pop` and resume. You stay focused on one thing at a time, and the refactor lands as its own clean commit.
