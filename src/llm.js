import OpenAI from "openai";

const MAX_DIFF_LINES = 200;
const conventionalCommit = /^(build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)(\([a-z0-9][a-z0-9._/-]*\))?!?: .+$/i;

function limitedDiff(diff) {
  return diff.split("\n").slice(0, MAX_DIFF_LINES).join("\n");
}

function cleanSuggestion(text) {
  const suggestion = text.trim().replace(/^```(?:text)?\s*/i, "").replace(/\s*```$/, "").split("\n")[0].trim();
  return conventionalCommit.test(suggestion) ? suggestion : null;
}

export async function suggestCommitMessage({ diff, draft }) {
  if (!process.env.OPENAI_API_KEY || !diff.trim()) return null;

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 8_000, maxRetries: 0 });
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-5-mini",
    instructions: "You write Conventional Commit subjects. Return exactly one line and nothing else. Use type(scope): description when a scope is clear. Allowed types: build, chore, ci, docs, feat, fix, perf, refactor, revert, style, test. Keep it under 72 characters, imperative, and do not end with punctuation.",
    input: `Draft message:\n${draft || "(empty)"}\n\nStaged diff (first ${MAX_DIFF_LINES} lines at most):\n${limitedDiff(diff)}`,
    max_output_tokens: 60,
    store: false,
  });
  return cleanSuggestion(response.output_text || "");
}
