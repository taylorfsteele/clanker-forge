---
name: implement
description: "Implement a piece of work based on a spec or set of tickets."
disable-model-invocation: true
---

Implement the work described by the user in the spec or tickets.

Use /tdd where possible, at pre-agreed seams.

When writing React code, always invoke the /react-composition-patterns and /react-no-use-effect skills.

Run typechecking regularly, single test files regularly, and the full test suite and full build once at the end.

Once done, run the code-simplifier agent in a subagent to refine the implementation, then use /code-review to review the work.

Then, in separate subagents run the rule-reviewer agent, the /adversarial-review skill, and the /review-bugbot skill and fix any findings.

Commit your work to the current branch using the /git-master skill.