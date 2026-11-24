import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LINE_1 =
  "A queue is a human train where every person is a carriage that has to wait for the carriage in front to move.";
const LINE_2 =
  "It maps the slow, single-file crawl, but leaves out that carriages never get bored, check their phones, or wish they were at the front.";

const ENTRY = LINE_1 + "\n" + LINE_2;

function main(): void {
  // Gate: UTF-8 text, 1 to 400 characters, not only whitespace.
  if (ENTRY.length < 1 || ENTRY.length > 400) {
    throw new Error(`entry is ${ENTRY.length} characters, must be 1 to 400`);
  }
  if (ENTRY.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
  const lines = ENTRY.split("\n");
  if (lines.length !== 2) {
    throw new Error(`entry must be exactly 2 lines, got ${lines.length}`);
  }
  for (const line of lines) {
    if (line.trim().length === 0) {
      throw new Error("each line must not be empty");
    }
    if (line !== line.trim()) {
      throw new Error("each line must have no leading or trailing whitespace");
    }
    // No control characters other than the newline joining the lines.
    if (/[\u0000-\u001f\u007f]/.test(line)) {
      throw new Error("entry must not contain control characters");
    }
    // Each line is exactly one sentence: one terminal period, no ". " inside.
    if (!line.endsWith(".")) {
      throw new Error("each line must end with a period");
    }
    if (line.slice(0, -1).includes(". ")) {
      throw new Error("each line must be a single sentence");
    }
  }

  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, ENTRY, "utf8");

  // Round-trip read-back check: what was written must be exactly the entry.
  const back = readFileSync(outPath, "utf8");
  if (back !== ENTRY) {
    throw new Error("read-back mismatch: written file differs from entry");
  }
  if (Buffer.byteLength(back, "utf8") !== Buffer.byteLength(ENTRY, "utf8")) {
    throw new Error("read-back byte length mismatch");
  }
}

main();
