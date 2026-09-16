import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { chooseMessage } from "./ui.js";
import { suggestCommitMessage } from "./llm.js";

function stagedDiff() {
  return execFileSync("git", ["diff", "--cached", "--no-ext-diff", "--unified=3"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
}

function draftMessage(contents) {
  return contents.split("\n").filter((line) => !line.trimStart().startsWith("#")).join("\n").trim();
}

function writeMessage(messageFile, message) {
  const comments = readFileSync(messageFile, "utf8").split("\n").filter((line) => line.trimStart().startsWith("#"));
  writeFileSync(messageFile, `${message}\n${comments.join("\n")}${comments.length ? "\n" : ""}`, "utf8");
}

export async function runHook([messageFile, source]) {
  if (!messageFile || source === "merge" || source === "squash") return;
  try {
    const contents = readFileSync(messageFile, "utf8");
    const diff = stagedDiff();
    if (!diff.trim()) return;
    const suggestion = await suggestCommitMessage({ diff, draft: draftMessage(contents) });
    if (!suggestion) return;
    const selected = await chooseMessage(suggestion);
    if (selected) writeMessage(messageFile, selected);
  } catch {
    // A hook must never stop a commit because CommitMint is unavailable.
  }
}
