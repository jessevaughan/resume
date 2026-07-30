// Render both resume tracks to US-Letter PDFs, then re-prove the ATS
// guarantee with pdftotext: logical reading order (main column before
// sidebar) and the per-track content guardrails.
//
//   node scripts/pdf.mjs            # generate + check (expects ./dist)
//
// Run `npm run pdf` to build first. This embeds the real licensed fonts from
// public/fonts (they're gitignored but present locally); without them the
// PDFs fall back to the system stack.

import { createServer } from "node:http";
import { readFile, mkdir, stat, readdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { join, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");
const distDir = join(root, "dist");
const outDir = join(root, "pdfs");
// Per-application cover letters (gitignored). Rendered only when the build
// included them, i.e. INCLUDE_LETTERS=1, which `npm run pdf` sets.
const lettersDir = join(root, "src", "data", "letters");

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".json": "application/json",
};

// ── Config: edit this block for your own resume ────────────────────────
// Name used for the PDF filenames.
const NAME = "Jesse Vaughan";

// One entry per track (ids must match those in src/tracks.ts):
//   id             the ?track= value; must match src/tracks.ts.
//   name           PDF filename suffix, e.g. "Creative-Brand-Leader" ->
//                  Jesse-Vaughan-Resume-Creative-Brand-Leader.pdf.
//   order          section labels that must appear in this sequence in the
//                  extracted text. This is the ATS reading-order guarantee
//                  (main column before the sidebar). Edit to your headings.
//   mustContain    keywords the track must include. Optional; [] to skip.
//   mustNotContain keywords the track must NOT include, e.g. content you
//                  deliberately keep off this track. Optional; [] to skip.
const TRACKS = [
  {
    id: "creative",
    name: "Creative-Brand-Leader",
    order: [
      "Summary",
      "Career Highlights",
      "Experience",
      "Skills",
      "Education",
    ],
    mustContain: [
      "Creative & Brand Leader",
      "#DareToGrow",
      "zero brand-confusion tickets",
    ],
    mustNotContain: ["Statamic", "Laravel"], // creative stays generic on the named stack
  },
  {
    id: "engineering",
    name: "Engineer-Web-Architect",
    order: [
      "Summary",
      "Career Highlights",
      "Experience",
      "Core Skills",
      "Education",
    ],
    mustContain: [
      "Design Engineer",
      "Statamic",
      "Super Bowl traffic surge and DDoS",
      "$3,600",
    ],
    mustNotContain: ["#DareToGrow", "brand-confusion"], // DareToGrow never on engineering
  },
];
// ───────────────────────────────────────────────────────────────────────

// e.g. Jesse-Vaughan-Resume-Creative-Brand-Leader.pdf (from each track's `name`)
const fileFor = (name) => `${NAME.replace(/\s+/g, "-")}-Resume-${name}.pdf`;

async function ensureDist() {
  try {
    await stat(join(distDir, "index.html"));
  } catch {
    console.error(
      "No dist/index.html found. Run `npm run build` first (or `npm run pdf`).",
    );
    process.exit(1);
  }
}

function startServer() {
  const server = createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
      const rel =
        pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
      const filePath = join(distDir, rel);
      if (!filePath.startsWith(distDir)) {
        res.writeHead(403).end();
        return;
      }
      const body = await readFile(filePath);
      res.writeHead(200, {
        "content-type": MIME[extname(filePath)] ?? "application/octet-stream",
      });
      res.end(body);
    } catch {
      res.writeHead(404).end("Not found");
    }
  });
  return new Promise((res) => {
    server.listen(0, "127.0.0.1", () =>
      res({ server, port: server.address().port }),
    );
  });
}

async function letterSlugs() {
  try {
    const files = await readdir(lettersDir);
    return files
      .filter((f) => f.endsWith(".ts"))
      .map((f) => f.replace(/\.ts$/, ""))
      .sort();
  } catch {
    return []; // no letters written yet
  }
}

async function snapshot(page, url, path) {
  await page.goto(url, { waitUntil: "networkidle0" });
  // Make sure web fonts have loaded before I snapshot the page.
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.pdf({
    path,
    format: "Letter",
    printBackground: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
  });
}

async function renderPdfs(port) {
  await mkdir(outDir, { recursive: true });
  const base = `http://127.0.0.1:${port}`;
  const letterFiles = [];
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();

    for (const { id, name } of TRACKS) {
      const file = fileFor(name);
      await snapshot(page, `${base}/?track=${id}`, join(outDir, file));
      console.log(`  ✓ ${file}`);
    }

    // Cover letters: the company comes from the rendered page, so the export
    // is named per application (Jesse-Vaughan-Cover-Letter-Headway.pdf).
    for (const slug of await letterSlugs()) {
      await page.goto(`${base}/?letter=${slug}`, { waitUntil: "networkidle0" });
      const company = await page.evaluate(
        () => document.body.dataset.company ?? "",
      );
      if (!company) {
        console.warn(`  ! ${slug}: letter not in this build, skipped`);
        continue;
      }
      const file = `${NAME.replace(/\s+/g, "-")}-Cover-Letter-${company.replace(/\s+/g, "-")}.pdf`;
      await snapshot(page, `${base}/?letter=${slug}`, join(outDir, file));
      letterFiles.push(file);
      console.log(`  ✓ ${file}`);
    }
  } finally {
    await browser.close();
  }
  return letterFiles;
}

function hasPdftotext() {
  return spawnSync("pdftotext", ["-v"]).error === undefined;
}

function pageCount(pdfPath) {
  const { stdout, status } = spawnSync("pdfinfo", [pdfPath], {
    encoding: "utf8",
  });
  if (status !== 0) return null;
  const m = stdout.match(/^Pages:\s+(\d+)/m);
  return m ? Number(m[1]) : null;
}

// "One page, always. Past that, cut, don't shrink."
function checkLetters(files) {
  if (files.length === 0) return true;
  console.log("\nCover letters (one page, always):");
  let ok = true;
  for (const file of files) {
    const pages = pageCount(join(outDir, file));
    if (pages === null) {
      console.log(`  – ${file}: install poppler to verify page count`);
    } else if (pages === 1) {
      console.log(`  ✓ ${file}: one page`);
    } else {
      ok = false;
      console.error(`  ✗ ${file}: ${pages} pages — cut copy, don't shrink type`);
    }
  }
  return ok;
}

function checkAts() {
  if (!hasPdftotext()) {
    console.warn(
      "\n⚠ pdftotext not found — skipping the ATS text check. PDFs were still generated.\n" +
        "  Install poppler (brew install poppler) to re-prove reading order and keywords.",
    );
    return true;
  }

  console.log("\nATS check (pdftotext reading order + guardrails):");
  let ok = true;
  for (const { name, order, mustContain, mustNotContain } of TRACKS) {
    const file = fileFor(name);
    const pdfPath = join(outDir, file);
    // -raw reads the content stream (= DOM order), which is what the
    // markup-first design controls. Default mode reads by visual position
    // and would interleave the left sidebar with the main column.
    const { stdout, status } = spawnSync("pdftotext", ["-raw", pdfPath, "-"], {
      encoding: "utf8",
    });
    if (status !== 0) {
      console.error(`  ✗ ${file}: pdftotext failed`);
      ok = false;
      continue;
    }
    // Strip ALL whitespace from both the text and the search terms. raw
    // output wraps lines and sometimes drops inter-word spaces (e.g.
    // "Super Bowl" -> "SuperBowl"), so anything less is brittle. Order and
    // substring semantics are preserved.
    const strip = (s) => s.replace(/\s+/g, "");
    const text = strip(stdout);
    const problems = [];

    // logical reading order: each anchor appears after the previous one
    let last = -1;
    for (const anchor of order) {
      const at = text.indexOf(strip(anchor));
      if (at === -1) problems.push(`missing section "${anchor}"`);
      else if (at < last) problems.push(`section "${anchor}" out of order`);
      else last = at;
    }
    for (const kw of mustContain) {
      if (!text.includes(strip(kw))) problems.push(`missing keyword "${kw}"`);
    }
    for (const kw of mustNotContain) {
      if (text.includes(strip(kw)))
        problems.push(`leaked keyword "${kw}" (guardrail)`);
    }

    if (problems.length === 0) {
      console.log(`  ✓ ${file}: reading order + keywords intact`);
    } else {
      ok = false;
      console.error(`  ✗ ${file}:`);
      for (const p of problems) console.error(`      - ${p}`);
    }
  }
  return ok;
}

await ensureDist();
console.log("Rendering PDFs:");
const { server, port } = await startServer();
let letterFiles = [];
try {
  letterFiles = await renderPdfs(port);
} finally {
  server.close();
}
// Evaluate both before deciding, so one failure doesn't hide the other.
const atsOk = checkAts();
const lettersOk = checkLetters(letterFiles);
const ok = atsOk && lettersOk;
console.log(ok ? "\nDone." : "\nFAILED — see problems above.");
process.exit(ok ? 0 : 1);
