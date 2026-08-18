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
import { checkProse } from "./lib/prose.mjs";

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
//                  Lead with the name and the contact line: section headings
//                  alone can't catch a masthead that has slipped down the
//                  stream, because they all move together. See the note on
//                  #root in resume.css for how that happens.
//   mustContain    keywords the track must include. Optional; [] to skip.
//   mustNotContain keywords the track must NOT include, e.g. content you
//                  deliberately keep off this track. Optional; [] to skip.
const TRACKS = [
  {
    id: "creative",
    name: "Creative-Brand-Leader",
    order: [
      "Jesse Vaughan",
      "hello@jessevaughan.com",
      "Summary",
      "Career Highlights",
      "Experience",
      "Skills",
      "Education",
    ],
    mustContain: [
      "Jesse Vaughan",
      "Creative & Brand Leader",
      "AdRoll",
      "Head of Creative",
      "Senior Manager, Creative",
      "Creative Leadership",
      "creative direction",
      "design systems",
      "CMS architecture and migration",
    ],
    mustNotContain: ["Statamic", "Laravel"], // creative stays generic on the named stack
  },
  {
    id: "engineering",
    name: "Creative-Technologist-Web-Architect",
    order: [
      "Jesse Vaughan",
      "hello@jessevaughan.com",
      "Summary",
      "Career Highlights",
      "Experience",
      "Skills",
      "Education",
    ],
    mustContain: [
      "Jesse Vaughan",
      "Creative Technologist",
      "Web Architect",
      "AdRoll",
      "Statamic",
      "Laravel",
      "React",
      "GitHub Actions",
      "Cloudflare",
      "Fastly",
      "localization",
      "incident response",
      "DDoS",
      "JavaScript",
    ],
    // #DareToGrow came off this list Aug 2026: the campaign now earns a Track B
    // highlight on its measured outcome. brand-confusion stays in the case study.
    mustNotContain: ["brand-confusion"],
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

// Widths of every non-breaking run, measured against the line box it sits in.
// A nowrap run wider than its column can't wrap, so it overflows the column
// edge instead. Nothing else in the build sees that: reading order, keywords,
// and page count all stay green while text hangs off the side of the sidebar.
//
// What it covers today is hyphenSafe's per-word spans, which is a live risk: a
// hyphenated term wider than its column would hang off the edge.
//
// The case it was built for is dormant. Marking two skills items nowrap was
// tried on August 13, 2026 and reverted the same day. Forcing an item whole
// does not remove the bad break in a column this narrow, it relocates it to the
// adjacent lines: Infrastructure & Ops went three lines to four with a ragged
// right edge, and Web Architecture & Development gained a one-word line ending
// in a separator, which is the defect two earlier passes had just removed. This
// stays wired up so that decision can be revisited with the measurement already
// in place rather than rebuilt from scratch.
async function measureNowrap(page) {
  await page.emulateMediaType("print");
  const runs = await page.evaluate(() =>
    [...document.querySelectorAll(".nowrap")].map((el) => {
      const block = el.closest("p, li, h1, h2, h3");
      const cs = getComputedStyle(block);
      const avail =
        block.clientWidth -
        parseFloat(cs.paddingLeft) -
        parseFloat(cs.paddingRight);
      return {
        text: el.textContent,
        column: el.closest(".sidebar") ? "sidebar" : "main",
        width: +el.getBoundingClientRect().width.toFixed(1),
        avail: +avail.toFixed(1),
      };
    }),
  );
  await page.emulateMediaType(null);
  return runs;
}

// Fails on any overflow. Multi-word runs are reported by name because those
// would be hand-maintained exceptions rather than hyphenSafe's single words;
// with the skills exceptions reverted there are none, so that line stays quiet
// until someone adds one.
function checkNowrap(measured) {
  console.log("\nNon-breaking runs (must fit their column):");
  let ok = true;
  for (const { track, runs } of measured) {
    const over = runs.filter((r) => r.width > r.avail);
    for (const r of runs.filter((r) => r.text.includes(" "))) {
      const pct = ((r.width / r.avail) * 100).toFixed(0);
      console.log(
        `  ${track}/${r.column}: "${r.text}" ${r.width}px of ${r.avail}px (${pct}%)`,
      );
    }
    if (over.length === 0) {
      console.log(`  ✓ ${track}: ${runs.length} runs, all inside the column`);
    } else {
      ok = false;
      console.error(`  ✗ ${track}:`);
      for (const r of over) {
        console.error(
          `      - "${r.text}" is ${r.width}px in a ${r.avail}px column; it will overflow the edge`,
        );
      }
    }
  }
  return ok;
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
      nowrapRuns.push({ track: id, runs: await measureNowrap(page) });
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
      console.error(`  ✗ ${file}: ${pages} pages. Cut copy, don't shrink type`);
    }
  }
  return ok;
}

// Same rule as the letters, and the one the ATS check can't see: reading order
// and keywords both stay green on a two-page build, so page count needs its own
// assertion. Past one page, cut copy — the type sizes are already at the floor.
function checkResumes() {
  console.log("\nResumes (one page per track):");
  let ok = true;
  for (const { name } of TRACKS) {
    const file = fileFor(name);
    const pages = pageCount(join(outDir, file));
    if (pages === null) {
      console.log(`  – ${file}: install poppler to verify page count`);
    } else if (pages === 1) {
      console.log(`  ✓ ${file}: one page`);
    } else {
      ok = false;
      console.error(`  ✗ ${file}: ${pages} pages. Cut copy, don't shrink type`);
    }
  }
  return ok;
}

function checkAts() {
  if (!hasPdftotext()) {
    console.warn(
      "\n⚠ pdftotext not found. Skipping the ATS text check. PDFs were still generated.\n" +
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
    // Collapse whitespace to single spaces; don't remove it. raw output wraps
    // lines, so a phrase can span a break and the runs need flattening — but
    // the spaces themselves have to survive the comparison. Stripping them
    // made every assertion below blind to word boundaries, which is how a PDF
    // whose text layer read "JesseVaughan" passed this check for months. The
    // dropped spaces it was working around were the bug now fixed by
    // word-spacing in resume.css, not something to normalise away.
    const norm = (s) => s.replace(/\s+/g, " ").trim();
    const text = norm(stdout);
    const problems = [];

    // logical reading order: each anchor appears after the previous one
    let last = -1;
    for (const anchor of order) {
      const at = text.indexOf(norm(anchor));
      if (at === -1) problems.push(`missing section "${anchor}"`);
      else if (at < last) problems.push(`section "${anchor}" out of order`);
      else last = at;
    }
    for (const kw of mustContain) {
      if (!text.includes(norm(kw))) problems.push(`missing keyword "${kw}"`);
    }
    for (const kw of mustNotContain) {
      if (text.includes(norm(kw)))
        problems.push(`leaked keyword "${kw}" (guardrail)`);
    }

    // Every bullet marker must extract on the same line as its text. A marker
    // stranded on its own line means the gap to the text passed pdftotext's
    // 1em run-splitting threshold — see --fs-bullet-min in resume.css.
    const { stdout: laidOut } = spawnSync("pdftotext", [pdfPath, "-"], {
      encoding: "utf8",
    });
    const orphans = laidOut
      .split("\n")
      .filter((line) => line.trim() === "•").length;
    if (orphans > 0) {
      problems.push(`${orphans} bullet markers split from their text`);
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
const nowrapRuns = [];
try {
  letterFiles = await renderPdfs(port);
} finally {
  server.close();
}
// Evaluate every check before deciding, so one failure doesn't hide another.
const atsOk = checkAts();
const resumesOk = checkResumes();
const lettersOk = checkLetters(letterFiles);
const nowrapOk = checkNowrap(nowrapRuns);
// Spelling and punctuation, read from the authored copy rather than from these
// PDFs: hyphenSafe's per-word spans make extracted text the wrong input for a
// spell check. See scripts/lib/prose.mjs.
const proseOk = await checkProse();
const ok = atsOk && resumesOk && lettersOk && nowrapOk && proseOk;
console.log(ok ? "\nDone." : "\nFAILED. See problems above.");
process.exit(ok ? 0 : 1);
