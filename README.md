# CommitCraft

CommitCraft suggests a Conventional Commit message from your staged Git diff before a commit is created.

## Setup

```bash
npm install -g commitcraft
```

Create a `.env` file in the Git repository where you use CommitCraft:

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-5-mini
```

Install the hook in that repository:

```bash
commitcraft init
```

## Use

Stage changes, then start a regular commit:

```bash
git add .
git commit
```

CommitCraft displays a suggested Conventional Commit subject. Press Enter (or `a`) to accept it, `e` to edit it, or `r` to keep the original message. It skips merge and squash commits, and silently keeps the original message if there is no staged diff, no API key, or an API request fails.




hahha test 