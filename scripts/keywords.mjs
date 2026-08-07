// Score a resume against one job posting on literal keyword overlap.
//
//   node scripts/keywords.mjs hook                  # reads postings/hook.txt
//   node scripts/keywords.mjs postings/hook.txt     # or an explicit path
//   node scripts/keywords.mjs hook --track engineering
//   node scripts/keywords.mjs hook --role "Associate Design Director"
//   node scripts/keywords.mjs hook --write         # scaffold tailored/hook.txt
//
// Run `npm run keywords -- <slug>`. Postings live in ./postings (gitignored,
// like the letters): paste the posting body into a .txt file named for the
// application slug.
//
// A cover letter for that slug is optional. When one exists its exact role
// title and track are used automatically; when it doesn't, the check still
// runs. You generally want to know whether a posting is worth pursuing
// before you sit down to write the letter.
//
// ── What this measures, and what it can't ──────────────────────────────
// Every number here is mechanical: literal string overlap between posting and
// resume, and how often the posting repeats a term. That is the entire model.
// It has no view on whether you can do the job, whether the seniority matches,
// or whether you know the domain. A posting you'd be excellent for can score
// badly; one you have no business applying to can score well. Read it as
// "would a keyword search surface me", never as "am I a fit".

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  loadResumeModule,
  tryLoadLetter,
  resumeCorpus,
  root,
} from "./lib/resume-data.mjs";
import { readPostingText, POSTING_FORMAT } from "./lib/postings.mjs";
import { parseFlags, failArgs } from "./lib/cli.mjs";
import {
  readTailoring,
  applyTailoring,
  writeStarter,
} from "./lib/tailoring.mjs";

// Words that carry no signal as keywords. Deliberately not exhaustive, since an
// aggressive list drops real terms like "design" or "brand". Postings are
// dense with hiring-prose verbs and filler that would otherwise top the list.
const STOP = new Set(
  `a an the and or but if then than that this these those with without within of
   in on at to for from by as is are was were be been being have has had do does
   did will would can could should may might must not no nor so such our your
   their its it we you they he she who whom which what when where why how all any
   both each few more most other some only own same too very just about across
   after before during into over under again further here there once because
   while up down out off above below between through against
   role team teams work working works job jobs position positions opportunity
   opportunities candidate candidates applicant experience experienced years year
   ability able strong excellent great good new help helping including include
   includes etc via using use used ensure ensuring drive driving own owning lead
   leading build building create creating support supporting deliver delivering
   manage managing partner partnering plus preferred required requirements
   responsibilities qualifications benefits company companies people looking join
   seeking demonstrate demonstrated demonstrating knowledge everyone everything
   anyone toward towards focus focused focusing well want wants wanted best
   better way ways enthusiasm passion passionate commitment committed driven
   ready established overall given every day days time times stage stages long
   important believe believes think thinks feel feels like make makes made bring
   brings take takes come comes get gets goes know knows need needs mission
   vision value values culture environment`
    .split(/\s+/)
    .filter(Boolean),
);

// Whole lines that are hiring boilerplate rather than role content.
const BOILERPLATE =
  /equal opportunity|without regard to|reasonable accommodation|salary range|compensation|benefits package|we are committed|protected veteran|disability status|background check|e-verify/i;

// Split on punctuation, but NOT on apostrophes. They are intra-word:
// splitting there turned "they're fundamentalists" into "re fundamentalists".
const SEGMENT_SPLIT = /[,;:.()[\]{}"|]+|\s+[-–—]\s+/;

const tokenize = (segment) =>
  segment
    .toLowerCase()
    .replace(/['’]s\b/g, "") // possessives: "client's" -> "client"
    .replace(/[^\p{L}\p{N}+#/&.'’-]+/gu, " ")
    .split(/\s+/)
    .map((word) => word.replace(/^[-.'’]+|[-.'’]+$/g, ""))
    .filter(Boolean);

const isStop = (word) =>
  STOP.has(word) || /^[\d.+%$]+$/.test(word) || word.length < 3;

/**
 * Crude singular. Only has to be good enough that "client" and "clients" stop
 * counting as two terms. That split the signal and doubled the list length.
 */
function singular(word) {
  if (/(ss|us|is)$/.test(word) || word.length < 4) return word;
  if (/ies$/.test(word)) return `${word.slice(0, -3)}y`;
  if (/(ch|sh|x|z|s)es$/.test(word)) return word.slice(0, -2);
  if (/s$/.test(word)) return word.slice(0, -1);
  return word;
}

/** Terms compare on their singular form; the surface form is kept for display. */
const canonical = (term) => term.split(" ").map(singular).join(" ");

/** Runs of consecutive non-stopwords. */
function chunk(words) {
  const out = [];
  let current = [];
  for (const word of words) {
    if (isStop(word)) {
      if (current.length) out.push(current);
      current = [];
    } else {
      current.push(word);
    }
  }
  if (current.length) out.push(current);
  return out;
}

/** Candidate terms, counted by how often the posting repeats them. */
function extractTerms(posting, exclude = []) {
  const skip = new Set(exclude.flatMap((name) => tokenize(name).map(singular)));
  const found = new Map(); // canonical -> { count, surfaces }
  for (const line of posting.split(/\r?\n/)) {
    if (BOILERPLATE.test(line)) continue;
    for (const segment of line.split(SEGMENT_SPLIT)) {
      for (const words of chunk(tokenize(segment))) {
        for (let n = 1; n <= Math.min(4, words.length); n++) {
          for (let i = 0; i + n <= words.length; i++) {
            const gram = words.slice(i, i + n);
            if (gram.every((word) => skip.has(singular(word)))) continue;
            const term = gram.join(" ");
            const key = canonical(term);
            const entry = found.get(key) ?? { count: 0, surfaces: new Map() };
            entry.count += 1;
            entry.surfaces.set(term, (entry.surfaces.get(term) ?? 0) + 1);
            found.set(key, entry);
          }
        }
      }
    }
  }

  const terms = [...found.entries()].map(([key, entry]) => ({
    key,
    count: entry.count,
    // Show whichever spelling the posting used most.
    term: [...entry.surfaces.entries()].sort((a, b) => b[1] - a[1])[0][0],
  }));

  // Drop a shorter phrase when a longer one contains it just as often:
  // "creative direction" beats a separate "creative" of equal weight.
  const subsumed = new Set();
  for (const a of terms) {
    for (const b of terms) {
      if (a.key === b.key || b.count < a.count) continue;
      if (
        b.key.includes(a.key) &&
        b.key.split(" ").length > a.key.split(" ").length
      ) {
        subsumed.add(a.key);
        break;
      }
    }
  }
  return terms
    .filter((entry) => !subsumed.has(entry.key))
    .sort((a, b) => b.count - a.count || b.term.length - a.term.length);
}

/** Literal matching, but tolerant of plurals in either direction. */
const inCorpus = (entry, corpus) =>
  corpus.includes(entry.term) || corpus.includes(entry.key);

function classify(terms, corpus) {
  const matched = [];
  const partial = [];
  const missing = [];
  for (const entry of terms) {
    if (inCorpus(entry, corpus)) {
      matched.push(entry);
      continue;
    }
    const words = entry.key.split(" ").filter((word) => !isStop(word));
    const present = words.filter((word) => corpus.includes(word)).length;
    if (words.length > 1 && present >= Math.ceil(words.length / 2)) {
      partial.push(entry);
    } else {
      missing.push(entry);
    }
  }
  return { matched, partial, missing };
}

const SPEC = {
  "--track": "value",
  "--role": "value",
  "--letter": "value",
  "--top": "value",
  "--write": "boolean",
};
const USAGE =
  'npm run keywords -- <slug|path> [--track <t>] [--role "Title"] [--write]';

function parseArgs(argv) {
  const { values, positionals, errors } = parseFlags(argv, SPEC);
  for (const extra of positionals.slice(1)) {
    errors.push(`unexpected argument "${extra}"`);
  }
  const target = values["--letter"] ?? positionals[0] ?? null;
  if (!target) errors.push("no posting given");
  return {
    target,
    track: values["--track"] ?? null,
    role: values["--role"] ?? null,
    top: values["--top"] ? Number(values["--top"]) : 12,
    write: Boolean(values["--write"]),
    errors,
  };
}

const bar = (n, total, width = 18) => {
  const filled = total ? Math.round((n / total) * width) : 0;
  return `${"█".repeat(filled)}${"░".repeat(Math.max(0, width - filled))}`;
};

const list = (rows, top) =>
  rows
    .slice(0, top)
    .map(({ term, count }) => `${term} (${count}x)`)
    .join(", ");

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.errors.length) failArgs(args.errors, USAGE);

  // A bare word is an application slug; anything path-shaped is used as given.
  const isPath = args.target.includes("/") || args.target.endsWith(".txt");
  const slug = isPath ? null : args.target;
  const file = isPath ? args.target : join(root, "postings", `${slug}.txt`);
  const raw = await readFile(file, "utf8").catch(() => null);
  if (raw === null) {
    console.error(`No posting at ${file}`);
    if (slug) console.error(`\nPaste the posting into postings/${slug}.txt\n`);
    console.error(POSTING_FORMAT);
    process.exit(1);
  }

  // One format, enforced. Everything downstream reads the title from line 1,
  // so a file that doesn't follow the rule fails here rather than quietly
  // scoring against the wrong thing.
  const parsed = readPostingText(raw);
  if (parsed.error) {
    console.error(`\n  ${file} isn't in the expected format:`);
    console.error(`  ${parsed.error}\n`);
    console.error(POSTING_FORMAT);
    console.error("");
    process.exit(1);
  }
  const { title } = parsed;
  const posting = raw;

  const { resume, resolveResume } = await loadResumeModule();
  const letter = slug ? await tryLoadLetter(slug) : null;
  const track = args.track ?? letter?.track ?? null;
  const resolved = resolveResume(resume, track ?? "creative");

  const tailoring = slug ? await readTailoring(slug) : null;
  const { resume: tailored, unmatched } = applyTailoring(resolved, tailoring);
  const explicitTitle = args.role ?? tailoring?.title ?? letter?.roleTitle ?? null;
  // Scored against the resume as it stands. An explicit --role or a letter's
  // roleTitle is a title you've decided to carry, so it counts; the posting's
  // own title never does just for being read.
  const corpus = resumeCorpus(tailored, explicitTitle ?? tailored.role);
  const titleMatch = corpus.includes(title.toLowerCase());

  // The employer's own name is never a keyword you need on your resume.
  const terms = extractTerms(posting, [letter?.company, slug].filter(Boolean));
  const { matched, partial, missing } = classify(terms, corpus);
  const total = terms.length;
  const pct = total ? Math.round((matched.length / total) * 100) : 0;

  // Coverage of the most-repeated terms is the more meaningful number: a long
  // posting yields hundreds of one-off terms that dilute the overall figure.
  const topTerms = terms.slice(0, 10);
  const topHit = topTerms.filter((entry) => inCorpus(entry, corpus)).length;
  const words = posting.trim().split(/\s+/).length;

  console.log(`\n  Keyword report: ${slug ?? file}`);
  console.log(`  ${"─".repeat(60)}`);
  console.log(`  posting    ${words} words → ${total} scoreable terms`);
  console.log(
    `  resume     ${resolved.track} track, titled "${explicitTitle ?? tailored.role}"` +
      `${explicitTitle ? "" : " (generic)"}`,
  );
  if (tailoring) {
    console.log(
      `  tailoring  tailored/${slug}.txt, ${tailoring.pairs.length} reword(s)` +
        `${tailoring.title ? ", title override" : ""}`,
    );
  }
  for (const error of tailoring?.errors ?? []) {
    console.log(`  ! tailored/${slug}.txt ${error}`);
  }
  for (const { from } of unmatched) {
    console.log(`  ! tailored/${slug}.txt: "${from}" is not in your resume`);
  }
  console.log("");
  console.log(`  Posting title     ${titleMatch ? "✓ on your resume" : "✗ not on your resume"}`);
  console.log(`                    "${title}"`);
  console.log(`  Top-10 terms      ${bar(topHit, 10)} ${topHit}/10`);
  console.log(
    `  All terms         ${bar(matched.length, total)} ${matched.length}/${total} (${pct}%)`,
  );
  console.log(`  Cheap rewrites    ${partial.length} partial matches`);

  console.log(`\n  DO THIS`);
  let step = 1;
  if (!titleMatch) {
    console.log(
      `   ${step++}. Optional. Carry the posting's exact title in your header.`,
    );
    console.log(
      `      Recruiters filter on titles, but a headline that doesn't match your`,
    );
    console.log(
      `      title of record can read as a stretch. Your call; Work Experience`,
    );
    console.log(`      keeps your real titles either way.`);
    console.log(
      `      npm run docx -- --role "${title}"${track ? ` --track ${track}` : ""}`,
    );
  }
  if (partial.length) {
    console.log(
      `   ${step++}. Reword for ${partial.length} partial matches. You have the substance;`,
    );
    console.log(`      the posting says it differently:`);
    console.log(`      ${list(partial, args.top)}`);
  }
  // The title is step 1's whole subject; listing it again here reads as a
  // second, separate thing to fix.
  const titleKey = title ? canonical(title.toLowerCase()) : null;
  const rest = missing.filter((entry) => entry.key !== titleKey);
  if (rest.length) {
    console.log(`   ${step++}. Add only what is true. Top missing by repetition:`);
    console.log(`      ${list(rest, args.top)}`);
    if (rest.length > args.top) {
      console.log(
        `      (+${rest.length - args.top} more, each rarer than the above)`,
      );
    }
  }
  if (step === 1) {
    console.log(`   Nothing mechanical left to fix. Go write the letter.`);
  }

  if (args.write) {
    if (!slug) {
      console.log(`\n  --write needs a slug, not a path.`);
    } else {
      const path = await writeStarter(slug, { title, partial, missing: rest });
      console.log(`\n  Wrote ${path.replace(`${process.cwd()}/`, "")}`);
      console.log(`  Everything in it is commented out. Uncomment what you want,`);
      console.log(`  fill in the "-" side with your current wording, then rerun`);
      console.log(`  this to see the new score. Delete the file to revert.`);
    }
  } else if (partial.length || !titleMatch) {
    console.log(`\n  To work through these in a file you can edit:`);
    console.log(`      npm run keywords -- ${slug ?? "<slug>"} --write`);
  }

  console.log(`\n  ${"─".repeat(60)}`);
  console.log(`  Scored on literal string overlap and repetition counts, and`);
  console.log(`  nothing else. This cannot judge seniority, domain fit, or`);
  console.log(`  whether you could do the job. A role you'd be great at can`);
  console.log(`  score badly. Use it to decide what to reword, not whether to`);
  console.log(`  apply, and never add a term you can't back in an interview.\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
