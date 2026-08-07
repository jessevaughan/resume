// Pasted job postings: where they live, and pulling the role title out of one.

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { root } from "./resume-data.mjs";

const postingsDir = join(root, "postings");
const postingPath = (slug) => join(postingsDir, `${slug}.txt`);

/** Application slugs, one per pasted posting. */
export async function postingSlugs() {
  const files = await readdir(postingsDir).catch(() => []);
  return files
    .filter((file) => file.endsWith(".txt"))
    .map((file) => file.replace(/\.txt$/, ""))
    .sort();
}

/**
 * The required posting format, quoted back whenever a file doesn't meet it.
 *
 * Line 1 is the title by contract rather than by inference. Guessing was
 * whack-a-mole. LinkedIn leads with "About the job", other boards with
 * "You Will", and a wrong guess ends up printed on a resume. One rule the
 * author controls beats a heuristic nobody can predict.
 */
export const POSTING_FORMAT = `  Line 1 must be the exact job title, on its own:

      Digital Design Lead

  Then a blank line, then the descriptive body of the posting: what the role
  does, responsibilities, and qualifications.

  Paste only that. Leave out legal boilerplate, EEO statements, benefits and
  salary tables, and "about the company" marketing. Those add hundreds of
  terms the scorer has to weigh, crowding out the vocabulary that describes
  the actual job.`;

// A title names a role. Only used to catch a body paragraph pasted into line
// 1 by mistake, not to go hunting for the title elsewhere in the file.
const ROLE_NOUN =
  /\b(designer|design|engineer|developer|manager|director|lead|head|architect|specialist|analyst|producer|writer|strategist|coordinator|principal|staff|senior|associate|chief|officer|vp|president|consultant|scientist|researcher|marketer|editor|artist|illustrator|animator|copywriter|creative|marketing|product|brand)\b/i;

/**
 * `{ title, body }` for a posting's text, or `{ error }` explaining what's
 * wrong with line 1. Never guesses past line 1.
 */
export function readPostingText(text) {
  const lines = text.split(/\r?\n/);
  const first = (lines.find((line) => line.trim()) ?? "").trim();
  if (!first) return { error: "the file is empty" };
  if (first.length > 60) {
    return { error: `line 1 is ${first.length} characters. That's a paragraph, not a title` };
  }
  if (/[.!?]$/.test(first)) {
    return { error: "line 1 ends in punctuation. That's a sentence, not a title" };
  }
  if (!ROLE_NOUN.test(first)) {
    return { error: `line 1 doesn't name a role: "${first}"` };
  }
  const start = lines.indexOf(lines.find((line) => line.trim()));
  return { title: first, body: lines.slice(start + 1).join("\n") };
}

/** readPostingText() for a slug, reading the file. */
export async function readPosting(slug) {
  const text = await readFile(postingPath(slug), "utf8").catch(() => null);
  if (text === null) return { error: `no file at postings/${slug}.txt` };
  return readPostingText(text);
}
