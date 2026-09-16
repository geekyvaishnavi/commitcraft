import OpenAI from "openai";

const MAX_DIFF_LINES = 200;

const INSTRUCTIONS = `You write a Conventional Commit subject line for a staged Git diff.

Reading the diff:
- Lines starting with "+" are being ADDED. Lines starting with "-" are being REMOVED. Lines starting with a space are unchanged context.
- Describe what this commit does: if lines are only added, say "add", never "remove" or "clean up".

Choosing the type (pick the first that fits):
- fix: corrects a bug, crash, or wrong behavior
- perf: same behavior, but faster or fewer resources. Adding a cache or memoization is perf, not feat
- feat: new user-facing or API-visible capability
- refactor: restructures code without changing behavior
- test: only adds or changes tests
- docs: only documentation, README, or code comments
- style: only formatting, whitespace, quotes, or semicolons
- ci: CI configuration such as .github/workflows
- build: build tooling or packaging config
- chore: dependency bumps, maintenance, anything else
- revert: reverts an earlier commit

Choosing the scope:
- Use one short lowercase word for the area of the code, usually the folder or module (src/auth/login.js -> auth). Use "deps" for dependency changes.
- Omit the scope if changes span unrelated areas or no clear area exists.
- Never use generic names like src, lib, app, .github, or a file extension as the scope, and never repeat the type (no "ci(ci)"). Omit the scope instead.

Writing the description:
- Imperative mood, lowercase first word, no trailing period, under 72 characters for the whole line.
- Say what changed and, if short, why. Be specific; avoid vague words like "update" or "changes".
- The developer's draft message shows their intent. Use it when it agrees with the diff, but trust the diff over the draft.

Return exactly one line: type(scope): description

Examples:
Diff adds a sendResetEmail function in src/mail/reset.js
feat(mail): add password reset email

Diff changes "if (user.age > 18)" to "if (user.age >= 18)" in src/signup/validate.js
fix(signup): allow users who are exactly 18

Diff replaces a nested loop with a Set lookup in src/search/match.js, same results
perf(search): use a set for tag matching

Diff deletes an unused formatDate helper from src/utils/date.js
refactor(utils): remove unused formatDate helper

Diff bumps "axios" from ^1.6.0 to ^1.7.2 in package.json
chore(deps): bump axios to 1.7.2`;
const conventionalCommit = /^(build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)(\(([^)]*)\))?(!?): (.+)$/i;
const validScope = /^[a-z0-9][a-z0-9._/-]*$/;

function limitedDiff(diff) {
  return diff.split("\n").slice(0, MAX_DIFF_LINES).join("\n");
}

function cleanSuggestion(text) {
  const suggestion = text.trim().replace(/^```(?:text)?\s*/i, "").replace(/\s*```$/, "").split("\n")[0].trim();
  const match = suggestion.match(conventionalCommit);
  if (!match) return null;
  const [, type, , rawScope, breaking, description] = match;
  // Keep a good message even if the model picked an odd scope like ".github".
  const scope = rawScope?.trim().toLowerCase().replace(/^[^a-z0-9]+/, "");
  return `${type.toLowerCase()}${scope && validScope.test(scope) ? `(${scope})` : ""}${breaking}: ${description.trim()}`;
}

export async function suggestCommitMessage({ diff, draft }) {
  if (!process.env.OPENAI_API_KEY || !diff.trim()) return null;

  const model = process.env.OPENAI_MODEL || "gpt-5-mini";
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 8_000, maxRetries: 0 });
  const response = await client.responses.create({
    model,
    // Reasoning tokens count toward max_output_tokens; keep them minimal so the answer fits.
    ...(/^(gpt-5|o\d)/.test(model) && { reasoning: { effort: "minimal" } }),
    instructions: INSTRUCTIONS,
    input: `Draft message:\n${draft || "(empty)"}\n\nStaged diff (first ${MAX_DIFF_LINES} lines at most):\n${limitedDiff(diff)}`,
    max_output_tokens: 200,
    store: false,
  });
  return cleanSuggestion(response.output_text || "");
}
