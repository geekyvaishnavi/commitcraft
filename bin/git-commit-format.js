#!/usr/bin/env node

import "dotenv/config";
import { installHook } from "../src/init.js";
import { runHook } from "../src/hook.js";

const [command, ...args] = process.argv.slice(2);

try {
  if (command === "init") {
    installHook();
  } else if (command === "hook") {
    await runHook(args);
  } else {
    console.error("Usage: git-commit-format <init>");
    process.exitCode = 1;
  }
} catch (error) {
  console.error(`git-commit-format: ${error.message}`);
  process.exitCode = 1;
}
