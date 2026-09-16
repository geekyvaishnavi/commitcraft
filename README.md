# CommitCraft

Stop writing `wip` and `fix stuff`. CommitCraft reads your staged changes when you run `git commit` and suggests a clean [Conventional Commit](https://www.conventionalcommits.org/) message. Accept it with one keypress.

```
$ git commit -m "wip"

Suggested: feat(auth): add refresh token rotation
[enter/a] accept  [e] edit  [r] reject
```

It never blocks a commit. If anything goes wrong (no API key, no network, API error), your original message is kept.

## Requirements

- Node.js 18 or newer
- Git
- An [OpenAI API key](https://platform.openai.com/api-keys)
- macOS or Linux (Windows is not supported yet)

## Install

```bash
npm install -g commitcraft
```

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
commitcraft init
```

This adds a `prepare-commit-msg` hook to the repository's hooks folder (usually `.git/hooks`). If the repository already has a `prepare-commit-msg` hook (for example from Husky), CommitCraft does not overwrite it.

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

CommitCraft does nothing for:

- merge and squash commits
- commits with nothing staged
- commits made without a terminal (for example, from a GUI Git client or CI)

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `OPENAI_API_KEY` | none | Required. Your OpenAI API key |
| `OPENAI_MODEL` | `gpt-5-mini` | OpenAI model used for suggestions |

## Privacy and cost

- The first 200 lines of your staged diff and your draft message are sent to OpenAI. Requests use `store: false`, so OpenAI does not keep them for later retrieval.
- Don't use CommitCraft in repositories whose code must not be sent to a third party.
- With `gpt-5-mini`, a suggestion costs roughly $0.0002 for a small commit and about $0.001 for a large one, billed to your OpenAI account.
- Each request times out after 8 seconds, so a slow network never holds up a commit for long.

## Uninstall

Remove the hook from a repository:

```bash
rm "$(git rev-parse --git-path hooks)/prepare-commit-msg"
```

Remove the command:

```bash
npm uninstall -g commitcraft
```

## Troubleshooting

**No suggestion appears.**

- Check that `OPENAI_API_KEY` is set: `echo $OPENAI_API_KEY`, or check your `.env` file.
- Check that the hook is installed: `cat "$(git rev-parse --git-path hooks)/prepare-commit-msg"`.
- If you installed CommitCraft before updating, run `commitcraft init` again to refresh the hook.

**`a prepare-commit-msg hook already exists`.** Another tool owns the hook. Add this line to that hook instead:

```bash
commitcraft hook "$1" "$2" "$3" < /dev/tty || true
```

## License

MIT
