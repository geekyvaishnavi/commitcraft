# git-commit-format

[![npm version](https://img.shields.io/npm/v/git-commit-format)](https://www.npmjs.com/package/git-commit-format)
[![npm downloads](https://img.shields.io/npm/dw/git-commit-format)](https://www.npmjs.com/package/git-commit-format)
[![license](https://img.shields.io/npm/l/git-commit-format)](LICENSE)

Stop writing `wip` and `fix stuff`. `git-commit-format` reads your staged changes when you run `git commit` and suggests a clean [Conventional Commit](https://www.conventionalcommits.org/) message. Accept it with one keypress.

```
$ git commit -m "wip"

Suggested: feat(auth): add refresh token rotation
[enter/a] accept  [e] edit  [r] reject
```

It never blocks a commit. If anything goes wrong (no API key, no network, API error), your original message is kept.

## Quick start

```bash
npm install -g git-commit-format
export OPENAI_API_KEY="sk-..."
cd your-repo
git commit-format init
```

Then commit as usual. Details for each step are below.

## Example suggestions

| What you staged | Suggested message |
|---|---|
| A new `rotateRefreshToken` function in `src/auth/` | `feat(auth): add rotateRefreshToken to rotate refresh tokens` |
| A loop that read past the end of an array | `fix(utils): prevent out-of-bounds access in paginate loop` |
| An in-memory cache for a database lookup | `perf(users): add in-memory cache to findUser to reduce DB queries` |
| A dependency version bump in `package.json` | `chore(deps): bump express to ^5.1.0` |
| A new troubleshooting section in `README.md` | `docs: add troubleshooting note about OPENAI_API_KEY in README` |

## Requirements

- Node.js 18 or newer
- Git
- An [OpenAI API key](https://platform.openai.com/api-keys)
- macOS or Linux (Windows is not supported yet)

## Install

```bash
npm install -g git-commit-format
```

Install it globally with `-g`. Running it through `npx` or adding it as a project dependency doesn't work, because the Git hook needs a permanent command to call.

## Set your API key

**Option 1: for all repositories (recommended).** Add this to your `~/.zshrc` or `~/.bashrc`, then open a new terminal:

```bash
export OPENAI_API_KEY="sk-..."
```

**Option 2: for one repository.** Create a `.env` file in the repository root:

```env
OPENAI_API_KEY=sk-...
```

Add `.env` to that repository's `.gitignore` so the key is never committed.

## Enable it in a repository

Run this inside each repository where you want suggestions:

```bash
git-commit-format init
# or, as a Git subcommand:
git commit-format init
```

This adds a `prepare-commit-msg` hook to the repository's hooks folder (usually `.git/hooks`). If the repository already has a `prepare-commit-msg` hook (for example from Husky), `git-commit-format` does not overwrite it.

## Use

Stage your changes and commit as usual:

```bash
git add .
git commit            # or: git commit -m "wip"
```

| Key | Action |
|---|---|
| `Enter` or `a` | Use the suggestion |
| `e` | Type your own message |
| `r` (or any other key) | Keep your original message |

Your original message is used as a hint, so `git commit -m "fix login crash"` steers the suggestion toward a fix.

`git-commit-format` does nothing for:

- merge and squash commits
- commits with nothing staged
- commits made without a terminal (for example, from a GUI Git client or CI)

## How it works

1. `init` adds a `prepare-commit-msg` hook, which Git runs before every commit.
2. The hook reads your staged diff (`git diff --cached`) and your draft message.
3. It sends the first 200 lines of the diff and the draft to OpenAI, asking for one Conventional Commit line.
4. It checks the reply is a valid `type(scope): description` line, then shows it and waits for a keypress.
5. The message you choose is written to the commit message file, and Git continues as normal.

If any step fails, the hook exits quietly and Git uses your original message.

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `OPENAI_API_KEY` | none | Required. Your OpenAI API key |
| `OPENAI_MODEL` | `gpt-5-mini` | OpenAI model used for suggestions |

## Privacy and cost

- The first 200 lines of your staged diff and your draft message are sent to OpenAI. Requests use `store: false`, so OpenAI does not keep them for later retrieval.
- Don't use `git-commit-format` in repositories whose code must not be sent to a third party.
- With `gpt-5-mini`, a suggestion costs roughly $0.0002 for a small commit and about $0.001 for a large one, billed to your OpenAI account.
- Each request times out after 8 seconds, so a slow network never holds up a commit for long.

## Uninstall

Remove the hook from a repository:

```bash
rm "$(git rev-parse --git-path hooks)/prepare-commit-msg"
```

Remove the command:

```bash
npm uninstall -g git-commit-format
```

## Troubleshooting

**No suggestion appears.**

- Check that `OPENAI_API_KEY` is set: `echo $OPENAI_API_KEY`, or check your `.env` file.
- Check that the hook is installed: `cat "$(git rev-parse --git-path hooks)/prepare-commit-msg"`.
- If you installed `git-commit-format` before updating, run `git-commit-format init` again to refresh the hook.

**`a prepare-commit-msg hook already exists`.** Another tool owns the hook. Add this line to that hook instead:

```bash
git-commit-format hook "$1" "$2" "$3" < /dev/tty || true
```

**`command not found: git-commit-format`.** The package isn't installed globally. Run `npm install -g git-commit-format`, then `git commit-format init` again.

## Development

```bash
git clone https://github.com/geekyvaishnavi/git-commit-format.git
cd git-commit-format
npm install
npm link                 # makes your local copy the global git-commit-format command
git commit-format init   # in a test repository
```

Run `npm unlink -g git-commit-format` to switch back to the published version.

## Links

- [npm package](https://www.npmjs.com/package/git-commit-format)
- [Releases and changelog](https://github.com/geekyvaishnavi/git-commit-format/releases)
- [Report an issue](https://github.com/geekyvaishnavi/git-commit-format/issues)
- [Conventional Commits specification](https://www.conventionalcommits.org/)

## License

MIT
