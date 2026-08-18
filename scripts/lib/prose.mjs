// Spelling, typography, and punctuation checks on the authored copy.
//
// This runs against the strings in src/data/resume.ts, not against the rendered
// PDF or .docx, for three reasons:
//
//   - Both artifacts render the same authored prose, so a typo caught here is
//     caught once instead of twice.
//   - pdftotext output is the wrong input. hyphenSafe wraps every hyphenated
//     word in a span, so extracted text carries fragments that are rendering
//     artifacts rather than misspellings, and a spell check would report them
//     forever.
//   - The .docx has no text assertion at all today (see the note in CLAUDE.md).
//     Checking the source covers the file an ATS actually parses without having
//     to unzip and walk its XML.
//
// What it does not cover, stated plainly: nothing here proves the rendered
// files contain these strings. Reading order and keywords in scripts/pdf.mjs
// are what prove that. This proves the words are spelled right before they get
// there.
//
// Coverage is the resume in both tracks, every cover letter present, and every
// per-application tailoring in ./tailored applied to the resume it rewrites.
// Letters, postings, and tailorings are all gitignored, so in CI this reduces
// to the two tracks. That is the intended behaviour, not a skip: the dictionary
// is a JS dependency, so unlike the poppler checks this can never quietly
// become a no-op on a machine that is missing a binary.

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import nspell from "nspell";
import dictionary from "dictionary-en";
import {
  loadResumeModule,
  tryLoadLetter,
  letterSlugs,
  root,
} from "./resume-data.mjs";
import { postingSlugs, readPosting } from "./postings.mjs";
import { readTailoring, applyTailoring, tailoredSlugs } from "./tailoring.mjs";

const wordsPath = join(root, "scripts", "words.txt");

// ── The wordlist ───────────────────────────────────────────────────────
// A resume is mostly proper nouns and jargon, so the dictionary alone reports
// about seventy "misspellings" that are all correct. The wordlist is what turns
// that noise into a guardrail: everything known is enumerated once, and after
// that an unknown word is either a typo or a deliberate one-line addition.
//
// Entries carry their canonical casing and it is enforced. "Adroll" and
// "Github" are misspellings of brands on a resume even though no dictionary
// would say so, and that class of error is the one this is most likely to
// catch in practice.
// A missing wordlist is not treated as an error and does not need to be: with
// an empty allowlist every jargon term becomes a finding and the check fails
// loudly, pointing at `--list`. There is no state in which this passes without
// having looked at the words.
async function loadWords() {
  const text = await readFile(wordsPath, "utf8").catch(() => "");
  const canon = new Map();
  for (const raw of text.split(/\r?\n/)) {
    const word = raw.replace(/#.*$/, "").trim();
    if (word) canon.set(word.toLowerCase(), word);
  }
  return canon;
}

// ── Tokenising ─────────────────────────────────────────────────────────
// Chunks that aren't prose. A URL, an email, a domain, or a filename is a
// string to be reproduced exactly, and splitting one into "adroll" + "com"
// only invents words to allowlist.
const NOT_PROSE =
  /^(?:https?:\/\/|www\.)|@|\.(?:com|org|net|io|dev|ai|co|txt|ts|tsx|js|mjs|css|json|md|pdf|docx)\b/i;

/** Words in a string, with case intact and non-prose chunks dropped. */
function words(text) {
  const out = [];
  for (const chunk of text.split(/\s+/)) {
    if (!chunk || NOT_PROSE.test(chunk)) continue;
    // Split on everything that isn't a letter, digit, or apostrophe. This is
    // what breaks "in-house", "CI/CD", and "Drupal/Pantheon" into their parts,
    // so ordinary hyphenated compounds need no wordlist entries.
    for (const piece of chunk.split(/[^\p{L}\p{N}'’]+/u)) {
      const word = piece.replace(/['’]s$/, "").replace(/^'+|'+$/g, "");
      // Anything with a digit in it is skipped: "GA4", "2015", "+23%", "$3,600".
      // A version or a metric is not a spelling question.
      if (word.length < 2 || /\p{N}/u.test(word)) continue;
      out.push(word);
    }
  }
  return out;
}

// ── Punctuation and typography ─────────────────────────────────────────
// Every rule here was run against the current copy before it was added, and
// every one is quiet on it. A rule that fires on prose you consider correct is
// a rule that teaches you to ignore this check, so the bar for adding one is
// that it stays silent until something actually changes.
//
// The negative lookaheads are not decoration. `,(?=\D)` on its own reported
// "$3,600" and `[.!?][A-Z]` on its own reported "B.A., Visual". Both were the
// check being wrong, not the copy.
const RULES = [
  [/ {2,}/, "two or more spaces"],
  [/\s[,.;:!?]/, "space before punctuation"],
  [/,(?=[^\s\d])/, "missing space after a comma"],
  [/[;:](?=[^\s\d])/, "missing space after a semicolon or colon"],
  [/\b(\p{L}+) \1\b/iu, "repeated word"],
  [/[‘’“”]/, "curly quote (house style is straight)"],
  [
    /\b(?:19|20)\d{2}\s*-\s*(?:(?:19|20)?\d{2})\b/,
    "hyphen in a year range (en dash?)",
  ],
  [/--/, "double hyphen"],
  [/\.\.\./, "three dots for an ellipsis"],
  [/^\s|\s$/, "leading or trailing whitespace"],
  // A capital straight after a sentence end, except following an initial:
  // "B.A." is not "B." plus a run-on sentence.
  [/(?<!\b\p{Lu})[.!?]\p{Lu}/u, "missing space after a sentence end"],
  // Invisible characters. A non-breaking space is not a space to pdftotext, and
  // a zero-width character is not anything at all to someone reading the file.
  [
    /[	   -‏  ⁠　﻿]/,
    "non-breaking or zero-width whitespace",
  ],
];

const PAIRS = [
  ["(", ")"],
  ["[", "]"],
];

function punctuation(text, report) {
  for (const [pattern, label] of RULES) {
    const at = text.search(pattern);
    if (at !== -1) report(label, text, at);
  }
  for (const [open, close] of PAIRS) {
    const opens = text.split(open).length - 1;
    const closes = text.split(close).length - 1;
    if (opens !== closes) report(`unbalanced ${open}${close}`, text, 0);
  }
  if ((text.split('"').length - 1) % 2 !== 0) {
    report("odd number of quotes", text, 0);
  }
}

// ── The fields a reader reads ──────────────────────────────────────────
// Contact details are deliberately absent: an email or a URL is not prose, and
// scripts/pdf.mjs already asserts the contact line by exact string.
function proseFields(resume) {
  const out = [];
  const add = (where, value) => {
    if (typeof value === "string" && value.trim()) {
      out.push({ where, text: value });
    }
  };

  add("name", resume.name);
  add("role", resume.role);
  add("summary", resume.summary);
  resume.highlights.forEach((line, i) => add(`highlights[${i}]`, line));

  for (const employer of resume.experience) {
    add(`experience/${employer.company}`, employer.company);
    for (const role of [...employer.roles, ...(employer.earlier ?? [])]) {
      const at = `${employer.company}/${role.title}`;
      add(at, role.title);
      add(`${at}/lede`, role.lede);
      add(`${at}/note`, role.note?.text);
      (role.bullets ?? []).forEach((line, i) =>
        add(`${at}/bullets[${i}]`, line),
      );
    }
  }

  for (const group of resume.skills.groups) {
    add(`skills/${group.heading}`, group.heading);
    group.items.forEach((item, i) => add(`skills/${group.heading}[${i}]`, item));
  }

  add("education/degree", resume.education.degree);
  add("education/focus", resume.education.focus);
  add("education/school", resume.education.school);

  (resume.recognition ?? []).forEach((item, i) => {
    add(`recognition[${i}]/program`, item.program);
    add(`recognition[${i}]/level`, item.level);
    add(`recognition[${i}]/category`, item.category);
    add(`recognition[${i}]/project`, item.project);
  });

  return out;
}

function letterFields(letter) {
  const out = [
    { where: "company", text: letter.company },
    { where: "roleTitle", text: letter.roleTitle },
    { where: "greeting", text: letter.greeting },
  ];
  letter.paragraphs.forEach((line, i) =>
    out.push({ where: `paragraphs[${i}]`, text: line }),
  );
  return out.filter(
    (field) => typeof field.text === "string" && field.text.trim(),
  );
}

/**
 * Bullet groups have to be internally consistent about ending in a period.
 *
 * Checked per group rather than across the document: skills items take no
 * periods and bullets do, and both are correct.
 */
function terminalPunctuation(fields, report) {
  const groups = new Map();
  for (const { where, text } of fields) {
    if (!/(?:bullets|highlights)\[\d+\]$/.test(where)) continue;
    const group = where.replace(/\[\d+\]$/, "");
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(text);
  }
  for (const [group, items] of groups) {
    if (items.length < 2) continue;
    const ends = items.map((text) => /[.!?]$/.test(text));
    if (new Set(ends).size > 1) {
      report(
        `mixed terminal punctuation (${ends.map((end) => (end ? "." : "-")).join("")})`,
        group,
        items.find((text) => !/[.!?]$/.test(text)),
      );
    }
  }
}

// ── Running it ─────────────────────────────────────────────────────────
const SNIPPET = 72;
const INVISIBLE = /[	   -‏  ⁠　﻿]/g;

/** The offending text with enough either side of it to be recognisable. */
function snippet(text, at) {
  if (!text) return "";
  const from = Math.max(0, at - 24);
  const cut = text.slice(from, from + SNIPPET);
  const lead = from > 0 ? "..." : "";
  const tail = from + SNIPPET < text.length ? "..." : "";
  // Invisible characters are the one thing a snippet can't show, so they get a
  // visible stand-in. Printing the raw character would make the finding and a
  // clean line look identical.
  return `${lead}${cut}${tail}`.replace(INVISIBLE, "␣").replace(/\n/g, " ");
}

/**
 * Check every scope and collect findings.
 *
 * A finding is keyed by rule plus the text it fired on, so copy shared across
 * both tracks reports once naming both rather than twice.
 */
async function collect() {
  const canon = await loadWords();
  const spell = nspell(dictionary);
  const { resume, resolveResume, TRACKS } = await loadResumeModule();

  const findings = new Map();
  const unknown = new Map();
  const scopes = [];
  let fieldCount = 0;

  const known = (word, extra) => {
    const lower = word.toLowerCase();
    if (canon.has(lower) || extra?.has(lower)) return true;
    if (spell.correct(word)) return true;
    // A lowercase entry capitalised at the start of a sentence is still that
    // word: "Martech" opening a bullet is not a second thing to allowlist.
    return word[0] !== lower[0] && spell.correct(lower);
  };

  const check = (scope, fields, extra) => {
    scopes.push(scope);
    fieldCount += fields.length;

    const report = (rule, text, at) => {
      const shown = snippet(text, typeof at === "number" ? at : 0);
      const key = `${rule} ${shown}`;
      if (!findings.has(key)) {
        findings.set(key, { rule, shown, scopes: new Set() });
      }
      findings.get(key).scopes.add(scope);
    };

    for (const { where, text } of fields) {
      punctuation(text, (rule, value, at) =>
        report(`${where}: ${rule}`, value, at),
      );

      for (const word of words(text)) {
        if (!known(word, extra)) {
          if (!unknown.has(word)) unknown.set(word, new Set());
          unknown.get(word).add(where);
          const guesses = spell.suggest(word).slice(0, 3);
          const hint = guesses.length
            ? ` (did you mean ${guesses.map((g) => `"${g}"`).join(", ")}?)`
            : "";
          report(
            `${where}: unknown word "${word}"${hint}`,
            text,
            Math.max(0, text.indexOf(word)),
          );
          continue;
        }
        // Brand casing, once the word itself is known.
        const canonical = canon.get(word.toLowerCase());
        if (canonical && canonical !== word) {
          const sentenceCase =
            canonical[0].toUpperCase() + canonical.slice(1);
          const lowercaseEntry = canonical === canonical.toLowerCase();
          if (!(lowercaseEntry && word === sentenceCase)) {
            report(
              `${where}: "${word}" is written "${canonical}" in scripts/words.txt`,
              text,
              Math.max(0, text.indexOf(word)),
            );
          }
        }
      }
    }

    terminalPunctuation(fields, (rule, group, text) =>
      report(`${group}: ${rule}`, text, 0),
    );
  };

  // The resume, once per track.
  for (const track of TRACKS) {
    check(track, proseFields(resolveResume(resume, track)));
  }

  // Cover letters. Absent in CI by design.
  for (const slug of await letterSlugs()) {
    const letter = await tryLoadLetter(slug);
    if (letter) check(`letter:${slug}`, letterFields(letter));
  }

  // Tailored copies, with the posting as the spelling authority: a term the
  // employer uses in their own posting is spelled the way they spell it, and
  // demanding a wordlist entry per application would make this check something
  // to switch off rather than something to trust.
  //
  // Only the fields the tailoring actually changed are checked. The untouched
  // ones are the core resume, already checked above as their own scope, and
  // reporting them again would attribute every core finding to every open
  // application.
  const live = new Set(await postingSlugs());
  for (const slug of await tailoredSlugs()) {
    if (!live.has(slug)) continue; // scripts/docx.mjs reports orphaned ones
    const tailoring = await readTailoring(slug);
    // A tailoring file that is still all comments rewrites nothing. Claiming a
    // scope for it would report a field count and a clean bill for copy that is
    // character-for-character the track already checked.
    if (!tailoring?.pairs.length && !tailoring?.title) continue;
    const posting = await readPosting(slug);
    const authority = new Set(
      posting.error
        ? []
        : words(`${posting.title}\n${posting.body}`).map((word) =>
            word.toLowerCase(),
          ),
    );
    // Same track the .docx sync would pick for this posting, so the copy
    // checked here is the copy that gets written.
    const letter = await tryLoadLetter(slug);
    const base = resolveResume(resume, letter?.track ?? TRACKS[0]);
    const { resume: applied } = applyTailoring(base, tailoring);
    const before = new Map(
      proseFields(base).map((field) => [field.where, field.text]),
    );
    const changed = proseFields(applied).filter(
      (field) => before.get(field.where) !== field.text,
    );
    if (changed.length) check(`tailored:${slug}`, changed, authority);
  }

  return { findings, unknown, scopes, fieldCount };
}

/** Every word the dictionary and wordlist don't know, for seeding words.txt. */
export async function listUnknown() {
  const { unknown } = await collect();
  return [...unknown.entries()]
    .map(([word, where]) => ({ word, where: [...where] }))
    .sort((a, b) => a.word.toLowerCase().localeCompare(b.word.toLowerCase()));
}

/**
 * Print the report. Returns false when anything was found, for the caller to
 * fold into its own exit status the way scripts/pdf.mjs does.
 */
export async function checkProse() {
  const { findings, unknown, scopes, fieldCount } = await collect();
  console.log("\nProse check (spelling + punctuation, from the authored copy):");

  const where = scopes.join(", ");
  if (findings.size === 0) {
    console.log(`  ✓ ${fieldCount} fields across ${where}: clean`);
    return true;
  }

  console.error(`  ✗ ${findings.size} finding(s) across ${where}:`);
  for (const { rule, shown, scopes: hit } of findings.values()) {
    console.error(`      - [${[...hit].join(", ")}] ${rule}`);
    if (shown) console.error(`          ${shown}`);
  }
  if (unknown.size) {
    console.error(
      "\n  Words that are spelled correctly belong in scripts/words.txt" +
        " (`npm run prose -- --list`):",
    );
    console.error(`      ${[...unknown.keys()].join("  ")}`);
  }
  return false;
}
