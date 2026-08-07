// Preview a markdown file exactly as GitHub will render it.
//
//   npm run readme                  # README.md
//   npm run readme -- TEMPLATE.md
//
// Renders through GitHub's own /markdown API rather than a local markdown
// library, because the two disagree in ways that matter: heading anchors,
// tables, task lists, and the slugger that decides whether an in-page link
// like [#stripping-it-out] resolves. Local renderers approximate; this is the
// renderer the repo page uses.
//
// Needs `gh` installed and logged in (gh auth status). Relative links to files
// in the repo render but can't be followed here; they only resolve once
// pushed. To check those, open a draft PR.

import { spawnSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, basename } from "node:path";

const CSS_URL =
  "https://cdn.jsdelivr.net/npm/github-markdown-css@5/github-markdown.css";

const file = process.argv[2] ?? "README.md";

function gh(args, input) {
  const run = spawnSync("gh", args, { input, encoding: "utf8" });
  if (run.error?.code === "ENOENT") {
    console.error("gh is not installed. brew install gh && gh auth login");
    process.exit(1);
  }
  if (run.status !== 0) {
    console.error(run.stderr.trim() || "gh failed");
    process.exit(1);
  }
  return run.stdout;
}

const markdown = await readFile(file, "utf8").catch(() => null);
if (markdown === null) {
  console.error(`No such file: ${file}`);
  process.exit(1);
}

// `context` is what makes #123 and @mentions resolve the way they will in the
// repo, so the preview matches even for shorthand references.
const repo = gh(["repo", "view", "--json", "nameWithOwner", "-q", ".nameWithOwner"])
  .trim();

const body = gh(
  ["api", "--method", "POST", "/markdown", "--input", "-"],
  JSON.stringify({ text: markdown, mode: "gfm", context: repo }),
);

const css = await fetch(CSS_URL)
  .then((res) => res.text())
  .catch(() => "");

const out = join(tmpdir(), `${basename(file, ".md")}-preview.html`);
await writeFile(
  out,
  [
    `<!doctype html><meta charset="utf-8"><title>${basename(file)} preview</title>`,
    `<style>${css}`,
    `body{margin:0;background:#fff}`,
    `.markdown-body{box-sizing:border-box;max-width:1012px;margin:0 auto;padding:45px}`,
    `</style>`,
    `<article class="markdown-body">${body}</article>`,
  ].join("\n"),
);

console.log(`${file} → ${out}  (as ${repo})`);
spawnSync("open", [out]);
