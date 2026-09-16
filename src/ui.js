import readline from "node:readline";

function readKey() {
  return new Promise((resolve) => {
    const input = process.stdin;
    const onData = (buffer) => {
      input.off("data", onData);
      input.setRawMode(false);
      input.pause();
      resolve(buffer.toString());
    };
    input.setRawMode(true);
    input.resume();
    input.once("data", onData);
  });
}

function readLine() {
  return new Promise((resolve) => {
    const prompt = readline.createInterface({ input: process.stdin, output: process.stderr });
    prompt.question("New message: ", (answer) => {
      prompt.close();
      resolve(answer.trim());
    });
  });
}

export async function chooseMessage(suggestion) {
  if (!process.stdin.isTTY || !process.stderr.isTTY) return null;
  process.stderr.write(`\nSuggested: ${suggestion}\n[enter/a] accept  [e] edit  [r] reject\n`);
  const key = await readKey();
  if (key === "\r" || key === "\n" || key.toLowerCase() === "a") return suggestion;
  if (key.toLowerCase() !== "e") return null;
  const edited = await readLine();
  return edited || null;
}
