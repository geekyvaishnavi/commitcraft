# PRD: commitmint — AI Conventional Commit Rewriter

## 1. Problem

Devs write messy commit messages (`fix stuff`, `wip`, `asdf`) even when they know Conventional Commits format. Teams using semantic-release / automated changelogs need clean commits, and manually formatting `type(scope): description` mid-flow breaks focus.

## 2. Solution

A CLI that hooks into `git commit`, reads the staged diff + draft message, sends both to an LLM, and shows a rewritten Conventional Commit message. One keypress accepts it; the commit proceeds with the clean message.

## 3. Target user

- Solo devs / small teams who want clean commit history without thinking about it
- Teams enforcing Conventional Commits for semantic-release, standard-version, or changelog automation
- npm-ecosystem devs (JS/TS primarily, but works on any repo since it only reads diffs)

## 4. Core user flow

1. Dev runs `git add .` then `git commit` (no `-m`, so editor/hook path triggers)
2. `prepare-commit-msg` hook fires → commitmint reads `git diff --staged` + existing draft message (if any)
3. commitmint calls LLM with diff + draft + few-shot Conventional Commit examples
4. Rewritten message printed to terminal:
    
    ```
    Suggested: feat(auth): add JWT refresh token rotation[enter/a] accept   [e] edit   [r] reject (keep original)
    ```
    
5. Keypress writes final message into the commit message file, git proceeds normally

## 5. Scope for 2-day build (MVP only — cut ruthlessly)

**IN scope:**

- `prepare-commit-msg` git hook, installed via `npx commitmint init` (writes hook into `.git/hooks/`)
- Single LLM provider (Claude Haiku via Anthropic API — fast, cheap, good enough for this)
- API key via env var (`COMMITMINT_API_KEY`) — no config file yet
- Diff truncation if >200 lines (just cut it, don't summarize recursively — that's a v2 problem)
- One-keypress accept/reject/edit loop in terminal (raw stdin read)
- Fallback: if diff is empty (e.g. `--amend` with no changes) or API call fails, keep original message and exit silently — never block a commit
- Published to npm as a real, installable package

**OUT of scope (explicitly, for v2):**

- Multi-provider support (OpenAI, Ollama, local models)
- `.commitmint.yml` per-repo custom types/scopes
- Config file / `~/.commitrc`
- Merge commit handling beyond "just skip and keep original"
- Tests, CI
- Windows-specific hook path edge cases (test on your machine, note "Linux/Mac tested" in README)
- Demo gif / polished README beyond basics

## 6. Success criteria for the 2-day version

- `npm install -g commitmint && commitmint init` works in a fresh repo
- Real commit on a real diff produces a correctly-formatted Conventional Commit message
- Keypress accept/reject/edit all work
- Broken API key / no network → commit still succeeds with original message (never blocks the dev)
- Package is live on npm, installable by a stranger

## 7. Day-by-day plan

**Day 1 — core engine (no polish)**

- AM: `package.json` + `bin` entry, project skeleton, npm account/name check
- AM: hook install logic — `commitmint init` writes a `prepare-commit-msg` script into `.git/hooks/` that shells out to your CLI
- Midday: diff reading (`git diff --staged`) + draft message reading from the file git passes in
- PM: Claude Haiku API call — prompt with diff + draft + Conventional Commit few-shot examples, parse response into a single clean message
- PM: hardcode a couple of test diffs, confirm output quality, tune prompt

**Day 2 — UX + ship**

- AM: raw terminal keypress handling (accept/edit/reject), write result back into commit message file
- AM: error handling — empty diff, oversized diff (truncate), API failure/timeout (fallback to original, never hang)
- Midday: test end-to-end in 2-3 real repos (your own projects), fix rough edges
- PM: README (install steps, prerequisite: Node + API key, example gif optional/skip if time-tight)
- PM: `npm login` + `npm publish`, verify fresh install works from a clean machine/container
- Evening: post on X with before/after example

## 8. Risks / things that'll eat time if you're not careful

- Prompt tuning for consistent, correctly-typed (`feat`/`fix`/`chore`/etc.) output — budget real time here, first few outputs will be inconsistent
- Terminal raw input handling has platform quirks (Mac vs Linux) — test early, don't leave for Day 2 PM
- Large diffs (a "wip" commit with 500 changed lines) — just truncate hard, don't try to be clever
- Don't touch multi-provider, config files, or hook-uninstall UX — every one of these is a v2 trap that eats your 2 days

## 9. Post-launch (not part of the 2-day scope, just noted)

- Watch npm install numbers + X engagement to see if anyone actually wants this
- If yes: add config file, multi-provider, per-repo custom types — in that order