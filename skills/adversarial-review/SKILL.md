---
name: adversarial-review
description: "Adversarial multi-persona code review. Runs security-auditor and complexity-skeptic in parallel isolated subagents against a diff, gates findings on concrete evidence, and synthesizes a BLOCK/CONCERNS/CLEAN verdict. Use after implementation, when the user asks for an adversarial review, to attack changes, or to review from multiple angles."
---

Adversarial review of a set of changes. Two hostile personas attack the diff in parallel, each in an isolated subagent with its own lens. This exists to break self-review blindness: a model reviewing code from the session that wrote it shares the author's assumptions. The personas never see the implementation conversation — only the code.

You are the orchestrator. **You originate zero findings.** Every finding in the final report must come from a persona and survive the evidence gate. Your job is scope, dispatch, filtering, and synthesis.

## 1. Pin the scope

Determine what to review, in order of preference:

1. A range the user specified (commit, branch, `main...HEAD`, file list)
2. Uncommitted changes (`git diff` + `git diff --staged`), if any
3. Branch changes: `git diff $(git merge-base main HEAD)...HEAD`

Confirm the diff is non-empty before dispatching. Record the diff command and the list of changed files. If a spec/ticket for the work is available, note its location — the complexity-skeptic needs it.

## 2. Dispatch the personas in parallel

Send a single message spawning two subagents: **security-auditor** and **complexity-skeptic**.

Give each subagent:

- The exact diff command and the changed-file list — nothing from the current conversation. Cold context is the point: do not summarize the implementation, explain intent, or defend choices.
- Its own persona instructions are already defined in the agent; the prompt only needs scope plus: "Read every changed file in full. Report findings per your persona's evidence rule and output format."
- For the complexity-skeptic only: the spec/ticket location (or its pasted contents) so scope creep is judged against the actual requirement. If there is no spec, say so — it should then judge only against internal evidence of over-engineering.

## 3. Evidence gate

For each returned finding, verify it meets its persona's evidence rule:

- Cites `file:line` and the offending code
- Includes a concrete scenario (failure sequence, attack path, or simpler alternative)

**Drop any finding that fails the gate** — a hunch without a scenario is noise, and adversarial framing manufactures false positives. Note dropped findings in one line each.

For BLOCKER findings that are empirically checkable (a specific input breaks a function, a request bypasses a check), verify before accepting: run the test, script, or request yourself, or hand it to the **tester** agent. An adversarial claim that fails its own repro is dropped. Consensus is not proof — a finding endorsed by every persona can still be wrong, and only a repro settles it.

## 4. Synthesize

- **Deduplicate** findings reported by multiple personas; a finding independently raised by 2+ personas is promoted one severity level (CONCERN → BLOCKER) unless empirical verification failed.
- Group surviving findings by persona, each with severity, `file:line`, and scenario.
- Include each persona's per-category "hunted, found nothing" log — a clean report must show the hunt happened.
- Do not add, soften, or editorialize findings.

End with a single verdict:

- **BLOCK** — at least one surviving BLOCKER; list exactly what must change.
- **CONCERNS** — no blockers, but judgement calls the author should see.
- **CLEAN** — all personas hunted every category and found nothing that survived the gate.
