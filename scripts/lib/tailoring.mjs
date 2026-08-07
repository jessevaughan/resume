// Per-application tailoring: a plain text file of overrides, layered onto the
// core resume at render time.
//
//   tailored/okta.txt
//
// The core resume in src/data/resume.ts stays canonical and is never edited by
// tailoring. Everything application-specific lives in one readable file you
// can hand-edit, and deleting that file reverts the application completely,
// which is the property that makes tailoring safe to do casually.
//
// Format:
//
//   # comments start with #
//   title: Digital Design Lead
//
//   - web design
//   + digital design
//
// `title:` replaces the header role for this application only. Each `-` / `+`
// pair is a literal find-and-replace across the resume's text. Nothing is
// fuzzy: if the `-` side no longer appears (because the core resume changed
// under it), that's reported rather than silently skipped.

import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { root } from "./resume-data.mjs";

const tailoredDir = join(root, "tailored");
const tailoredPath = (slug) => join(tailoredDir, `${slug}.txt`);

/** Slugs that have a tailoring file, so callers can spot orphaned ones. */
export async function tailoredSlugs() {
  const files = await readdir(tailoredDir).catch(() => []);
  return files
    .filter((file) => file.endsWith(".txt"))
    .map((file) => file.replace(/\.txt$/, ""))
    .sort();
}

/** `{ title, pairs: [{ from, to }], errors }` from a tailoring file's text. */
function parseTailoring(text) {
  const result = { title: null, pairs: [], errors: [] };
  let pending = null;

  text.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim();
    const at = `line ${i + 1}`;
    if (!line || line.startsWith("#")) return;

    if (/^title:/i.test(line)) {
      result.title = line.slice(line.indexOf(":") + 1).trim() || null;
      return;
    }
    if (line.startsWith("-")) {
      if (pending) result.errors.push(`${at}: "-" line without a "+" after it`);
      pending = line.slice(1).trim();
      if (!pending) result.errors.push(`${at}: "-" line is empty`);
      return;
    }
    if (line.startsWith("+")) {
      const to = line.slice(1).trim();
      if (pending === null) {
        result.errors.push(`${at}: "+" line without a "-" before it`);
        return;
      }
      result.pairs.push({ from: pending, to });
      pending = null;
      return;
    }
    result.errors.push(`${at}: expected "title:", "-", "+", or a # comment`);
  });

  if (pending) result.errors.push(`"-" line "${pending}" has no "+" after it`);
  return result;
}

/** parseTailoring() for a slug, or null when there's no file. */
export async function readTailoring(slug) {
  const text = await readFile(tailoredPath(slug), "utf8").catch(() => null);
  return text === null ? null : parseTailoring(text);
}

/** Rewrite every string in a resolved resume, leaving its shape alone. */
function mapStrings(value, fn) {
  if (typeof value === "string") return fn(value);
  if (Array.isArray(value)) return value.map((item) => mapStrings(item, fn));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [key, mapStrings(val, fn)]),
    );
  }
  return value;
}

/**
 * Layer a tailoring file onto a resolved resume.
 *
 * Returns the new resume plus which pairs actually landed, so callers can
 * report a pair whose `from` no longer exists. That's the failure mode that would
 * otherwise mean you shipped a docx believing an edit applied.
 */
export function applyTailoring(resolved, tailoring) {
  if (!tailoring) return { resume: resolved, applied: [], unmatched: [] };

  const applied = [];
  const unmatched = [];
  let resume = resolved;

  for (const pair of tailoring.pairs) {
    let hit = false;
    resume = mapStrings(resume, (text) => {
      if (!text.includes(pair.from)) return text;
      hit = true;
      return text.split(pair.from).join(pair.to);
    });
    (hit ? applied : unmatched).push(pair);
  }

  if (tailoring.title) resume = { ...resume, role: tailoring.title };
  return { resume, applied, unmatched };
}

/**
 * A starter file for one application: the title commented out, and one blank
 * pair per phrase worth considering. Deliberately inert: every suggestion
 * arrives commented, so generating the file never changes an artifact until a
 * human uncomments something.
 */
export async function writeStarter(slug, { title, partial, missing }) {
  const lines = [
    `# Tailoring for: ${slug}`,
    `#`,
    `# Delete this file and ${slug} goes back to your core resume.`,
    `# Nothing here applies until you uncomment it.`,
    ``,
    `# Carry the posting's title in your header for this application only.`,
    `# Work Experience keeps your real titles either way.`,
    `# title: ${title}`,
    ``,
    `# ── Rewordings ──────────────────────────────────────────────────────`,
    `# Put YOUR current wording after "-", the posting's wording after "+".`,
    `# Both sides are literal text, replaced everywhere it appears.`,
    `#`,
    `#   - web design`,
    `#   + digital design`,
    ``,
    `# Partial matches. You have the substance, the posting says it`,
    `# differently. These are the cheap ones.`,
  ];
  for (const { term, count } of partial.slice(0, 20)) {
    lines.push(``, `# ${term} (${count}x in the posting)`, `# -`, `# + ${term}`);
  }
  if (missing.length) {
    lines.push(
      ``,
      `# ── Missing entirely ────────────────────────────────────────────────`,
      `# Only use these if they are already true of the work described.`,
    );
    for (const { term, count } of missing.slice(0, 10)) {
      lines.push(``, `# ${term} (${count}x)`, `# -`, `# + ${term}`);
    }
  }
  lines.push(``);

  await mkdir(tailoredDir, { recursive: true });
  await writeFile(tailoredPath(slug), lines.join("\n"));
  return tailoredPath(slug);
}
