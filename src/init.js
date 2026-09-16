import { existsSync, mkdirSync, readFileSync, writeFileSync, chmodSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const MARKER = "# Installed by CommitCraft";

function shellQuote(value) {
  return `'${value.replaceAll("'", "'\\\"'\\\"'")}'`;
}

function gitPath(...args) {
  try {
    return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    throw new Error("run this command from inside a Git repository");
  }
}

export function installHook() {
  const hooksDirectory = resolve(gitPath("rev-parse", "--git-path", "hooks"));
  const hookPath = resolve(hooksDirectory, "prepare-commit-msg");
  mkdirSync(hooksDirectory, { recursive: true });

  if (existsSync(hookPath)) {
    const existing = readFileSync(hookPath, "utf8");
    if (!existing.includes(MARKER)) {
      throw new Error(`a prepare-commit-msg hook already exists at ${hookPath}; refusing to overwrite it`);
    }
  }

  const cliPath = resolve(process.argv[1]);
  const hook = `#!/bin/sh
${MARKER}
exec ${shellQuote(cliPath)} hook "$1" "$2" "$3"
`;
  writeFileSync(hookPath, hook, "utf8");
  chmodSync(hookPath, 0o755);
  console.log("CommitCraft is active for this repository.");
}
