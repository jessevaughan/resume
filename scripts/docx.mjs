// Render single-column .docx copies of the resume for ATS uploads.
//
//   node scripts/docx.mjs                 # sync: see below
//   node scripts/docx.mjs --letter faire  # one copy, titled from the letter
//   node scripts/docx.mjs --role "Senior Manager, Brand Design" --track creative
//
// Run bare it's a sync, not a one-off: the standing copies (one per track,
// generic titles) plus one copy per file in ./postings, and it deletes copies
// whose posting is gone. Targeted runs with --letter or --role write a single
// file and never prune. Output lands in ./docx (gitignored, like ./pdfs).
//
// Why a separate artifact instead of tuning the PDF: the two-column PDF is the
// portfolio piece and stays that way. A .docx has no paint order, no text runs,
// and no columns to interleave, so every parsing failure mode the PDF has to
// defend against simply doesn't exist here. This file is the one that gets
// uploaded to Greenhouse / Workday / Lever / iCIMS.
//
// ATS rules this file deliberately follows:
//   - single column, no tables, no text boxes, no images
//   - contact details in the body, never in a Word header/footer (most ATS
//     ignore header/footer content outright)
//   - standard section headings only: Summary / Work Experience / Skills /
//     Education / Awards and Recognition. "Career Highlights" folds under
//     Summary rather than becoming a heading no recruiter filters on, and
//     "Recognition" (the app's label) becomes "Awards and Recognition" here
//     for the same reason: parsers know the longer heading and don't reliably
//     know the shorter one.
//   - real Word bullet lists, not glyphs typed into the text
//   - comma separators, not middots: "·" carries no word-boundary meaning to a
//     parser, and extracted as "·GA4·GTM·CoreWebVitals·" in testing.

import { readdir, unlink } from "node:fs/promises";
import { join } from "node:path";
import { Paragraph, HeadingLevel, AlignmentType } from "docx";
import {
  loadResumeModule,
  tryLoadLetter,
  letterSlugs,
  root,
} from "./lib/resume-data.mjs";
import { postingSlugs, readPosting } from "./lib/postings.mjs";
import {
  readTailoring,
  applyTailoring,
  tailoredSlugs,
} from "./lib/tailoring.mjs";
import { parseFlags, failArgs } from "./lib/cli.mjs";
import {
  body,
  contactLine,
  makeDocument,
  slugify,
  text,
  writeDocx,
} from "./lib/docx-common.mjs";

const outDir = join(root, "docx");

// ── Config ─────────────────────────────────────────────────────────────
const NAME = "Jesse Vaughan";
const PDF_SUFFIX = {
  creative: "Creative-Brand-Leader",
  engineering: "Engineer-Web-Architect",
};

// ── Building blocks ────────────────────────────────────────────────────
/** Section heading. Standard names only. Recruiters filter on these. */
const heading = (label) =>
  new Paragraph({
    children: [text(label.toUpperCase(), { bold: true, size: 24 })],
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 260, after: 120 },
  });

/** A real Word bullet, so the list survives as a list. */
const bullet = (value) =>
  new Paragraph({
    children: [text(value, { size: 20 })],
    bullet: { level: 0 },
    spacing: { after: 60 },
  });

/**
 * The .docx stays flat: one "Title, Company" plus its own date range per role,
 * even though the PDF groups roles under an employer heading. Parsers hunt
 * for title/company/date triples; a company heading with roles nested beneath
 * asks them to infer the association, and inference is where they go wrong.
 * Repeating the company is redundant to a human and free to a machine.
 */
function roleParagraphs(job, company, formatRange) {
  const out = [
    new Paragraph({
      children: [
        text(job.title, { bold: true, size: 22 }),
        text(`, ${company}`, { size: 22 }),
      ],
      spacing: { before: 180, after: 20 },
      keepNext: true,
    }),
    new Paragraph({
      // Plain hyphen, not the design's en dash: "Mon YYYY - Mon YYYY" is the
      // range form ATS date parsers handle most reliably.
      children: [
        text(formatRange(job.start, job.end, "-"), {
          size: 20,
          italics: true,
        }),
      ],
      spacing: { after: 80 },
      keepNext: true,
    }),
  ];

  if (job.note?.placement === "top") {
    out.push(body([text(job.note.text, { size: 20, italics: true })]));
  }
  if (job.lede) out.push(body([text(job.lede, { size: 20 })]));
  for (const line of job.bullets ?? []) out.push(bullet(line));
  if (job.note?.placement === "bottom") {
    out.push(body([text(job.note.text, { size: 20, italics: true })]));
  }
  return out;
}

// ── Document ───────────────────────────────────────────────────────────
function buildDocument(resume, roleTitle, formatRange) {
  const children = [
    new Paragraph({
      children: [text(resume.name, { bold: true, size: 32 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
    }),
    new Paragraph({
      children: [text(roleTitle, { size: 24 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
    }),
    // Location on its own line. Appended to the contact line it pushed past
    // the measure and orphaned "CA" onto a line by itself.
    new Paragraph({
      children: [text(resume.contact.location, { size: 20 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
    }),
    new Paragraph({
      children: [text(contactLine(resume.contact), { size: 20 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
    }),

    heading("Summary"),
    body([text(resume.summary, { size: 20 })]),
    // Folded under Summary on purpose: "Career Highlights" is not a heading
    // recruiters search, and a non-standard heading sends its contents to a
    // miscellaneous field.
    ...resume.highlights.map(bullet),

    heading("Work Experience"),
    ...resume.experience.flatMap((employer) => [
      ...employer.roles.map((role) =>
        roleParagraphs(role, employer.company, formatRange),
      ),
      // Earlier titles get full entries here rather than the PDF's one
      // compressed line: they are what carry the 2009 start date, and the
      // experience arithmetic is the whole reason they're on the resume.
      ...(employer.earlier ?? []).map((role) =>
        roleParagraphs(role, employer.company, formatRange),
      ),
    ].flat()),

    heading("Skills"),
    ...resume.skills.groups.map((group) =>
      body([
        text(`${group.heading}: `, { bold: true, size: 20 }),
        text(group.items.join(", "), { size: 20 }),
      ]),
    ),

    heading("Education"),
    body([text(resume.education.degree, { bold: true, size: 20 })]),
    body([text(resume.education.focus, { size: 20 })]),
    body([text(resume.education.school, { size: 20 })]),

    // Last section, and only when there's something in it. The project name
    // rides along here because the .docx is flat: this sits several sections
    // below the bullet that describes the work, so the connection has to be
    // made in the line. The PDF sidebar sits beside that bullet and drops it.
    ...((resume.recognition ?? []).length
      ? [
          heading("Awards and Recognition"),
          ...resume.recognition.flatMap((item) => [
            body([text(item.program, { bold: true, size: 20 })]),
            body([
              text(
                item.project
                  ? `${item.level}, ${item.category} (${item.project})`
                  : `${item.level}, ${item.category}`,
                { size: 20 },
              ),
            ]),
          ]),
        ]
      : []),
  ];

  return makeDocument(children);
}

// ── CLI ────────────────────────────────────────────────────────────────
/** "new-relic" -> "New-Relic", so the filename reads as a company. */
const titleCase = (slug) =>
  slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("-");

const SPEC = { "--role": "value", "--track": "value", "--letter": "value" };
const USAGE =
  'npm run docx            (sync)\n' +
  '         npm run docx -- --letter <slug>\n' +
  '         npm run docx -- --role "Title" [--track <t>]';

function parseArgs(argv) {
  const { values, positionals, errors } = parseFlags(argv, SPEC);
  // A bare slug looks like it should target one posting, but the sync already
  // covers every posting. Say so rather than quietly rebuilding everything.
  for (const extra of positionals) {
    errors.push(
      `unexpected argument "${extra}". Run \`npm run docx\` bare to sync every` +
        ` posting, or --letter ${extra} to build just that one`,
    );
  }
  return {
    role: values["--role"] ?? null,
    track: values["--track"] ?? null,
    letter: values["--letter"] ?? null,
    errors,
  };
}


async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.errors.length) failArgs(args.errors, USAGE);
  const { resume, resolveResume, formatRange, TRACKS } =
    await loadResumeModule();
  const stem = `${NAME.replace(/\s+/g, "-")}-Resume`;
  const written = [];

  const render = async (track, roleTitle, suffix, tailoring = null) => {
    const base = resolveResume(resume, track);
    // Tailoring layers onto the resolved copy; the core resume is never edited.
    const { resume: resolved, applied, unmatched } = applyTailoring(base, tailoring);
    const title = roleTitle ?? tailoring?.title ?? resolved.role;
    const file = `${stem}-${suffix}.docx`;
    await writeDocx(buildDocument(resolved, title, formatRange), outDir, file);
    written.push({ file, track, title, applied, unmatched });
    return file;
  };

  // ── Targeted one-off: --letter / --role / --track ────────────────────
  // Never prunes. This is "build me this one thing", not a sync.
  if (args.letter || args.role || args.track) {
    let roleOverride = args.role;
    let trackOverride = args.track;
    let tag = null;
    if (args.letter) {
      // Unlike the keyword check, this one can't degrade: without the letter
      // there's no exact title and no company to name the file after.
      const letter = await tryLoadLetter(args.letter);
      if (!letter) {
        console.error(`No letter at src/data/letters/${args.letter}.ts`);
        const slugs = await letterSlugs();
        if (slugs.length) console.error(`Available: ${slugs.join(", ")}`);
        console.error(`Or pass --role "Exact Title" --track <track> instead.`);
        process.exit(1);
      }
      roleOverride = roleOverride ?? letter.roleTitle;
      trackOverride = trackOverride ?? letter.track;
      tag = slugify(letter.company);
    }
    for (const track of trackOverride ? [trackOverride] : TRACKS) {
      // A targeted copy must never land on the generic filename. That
      // silently overwrites the untargeted one you meant to keep.
      const suffix =
        tag ?? (args.role ? slugify(args.role) : (PDF_SUFFIX[track] ?? track));
      await render(track, roleOverride, suffix);
    }
    report(written, []);
    return;
  }

  // ── Full sync: the standing copies, plus one per posting ─────────────
  // The standing copies are the untailored, always-accurate resume: what a
  // "quick apply" gets, and what ships to the site alongside the PDFs.
  const generic = new Set();
  for (const track of TRACKS) {
    generic.add(await render(track, null, PDF_SUFFIX[track] ?? track));
  }

  // One copy per posting, always, even when its contents match the standing
  // copy exactly. The point is provenance: when you're twenty applications
  // deep, "which file did I send Okta" is a question you can answer by
  // looking, instead of reconstructing it from memory. Ignore ./postings
  // entirely and you're left with just the standing copies.
  //
  // The title still isn't inferred. A posting's copy carries its letter's
  // exact role title when there is one, and the generic role otherwise.
  // Putting a headline on your resume stays a decision you make, not one a
  // sync makes for you.
  const untitled = [];
  const skipped = [];
  const slugs = await postingSlugs();
  for (const slug of slugs) {
    const parsed = await readPosting(slug);
    if (parsed.error) {
      skipped.push({ slug, error: parsed.error });
      continue;
    }
    const letter = await tryLoadLetter(slug);
    const tailoring = await readTailoring(slug);
    const track = letter?.track ?? TRACKS[0];
    const suffix = `${PDF_SUFFIX[track] ?? track}-${titleCase(slug)}`;
    generic.add(
      await render(track, letter?.roleTitle ?? null, suffix, tailoring),
    );
    for (const error of tailoring?.errors ?? []) {
      console.log(`  ! tailored/${slug}.txt ${error}`);
    }
    if (!letter && !tailoring?.title) untitled.push({ slug, title: parsed.title });
  }

  // Remove tailored copies whose posting is gone, so ./docx mirrors ./postings
  // rather than accumulating every company you ever looked at.
  //
  // Scoped as narrowly as the rule allows: only files matching the auto-
  // generated "<stem>-<track>-<slug>" shape are eligible. A one-off from
  // `--letter` or `--role` is something you explicitly asked for, and a sync
  // has no business deleting it. Cover letters aren't touched at all; those
  // belong to scripts/letter.mjs.
  const live = new Set(slugs.map((slug) => slug.toLowerCase()));
  const trackSuffixes = TRACKS.map((track) => PDF_SUFFIX[track] ?? track);
  const stale = [];
  for (const file of await readdir(outDir).catch(() => [])) {
    if (!file.endsWith(".docx") || generic.has(file)) continue;
    for (const suffix of trackSuffixes) {
      const prefix = `${stem}-${suffix}-`;
      if (!file.startsWith(prefix)) continue;
      const slug = file.slice(prefix.length, -".docx".length).toLowerCase();
      if (!live.has(slug)) stale.push(file);
      break;
    }
  }
  for (const file of stale) await unlink(join(outDir, file));

  // A tailoring file with no posting behind it never gets applied. Saying so
  // beats letting someone wonder why their edits aren't showing up.
  const orphaned = (await tailoredSlugs()).filter((slug) => !live.has(slug));

  report(written, stale, untitled, skipped, orphaned);
}

function report(written, stale, untitled = [], skipped = [], orphaned = []) {
  console.log("\nDOCX (single column, ATS upload copy):");
  for (const { file, track, title, applied, unmatched } of written) {
    const hits = (applied ?? []).reduce((sum, pair) => sum + pair.count, 0);
    const note = applied?.length
      ? `  +${applied.length} reword(s), ${hits} replacement(s)`
      : "";
    console.log(`  ✓ ${file}  [${track}] "${title}"${note}`);
    for (const { from } of unmatched ?? []) {
      console.log(`      ! "${from}" is not in your resume, not applied`);
    }
    // A pair this broad is nearly always a phrase that was meant to be longer.
    for (const { from, count } of applied ?? []) {
      if (count >= 4) {
        console.log(
          `      ! "${from}" replaced ${count}x. Use a longer, more distinctive phrase`,
        );
      }
    }
  }
  for (const file of stale) {
    console.log(`  ✗ ${file}  removed (no matching posting)`);
  }
  for (const { slug, error } of skipped) {
    console.log(`  ! ${slug}: ${error}. No copy written`);
  }
  for (const { slug, title } of untitled) {
    console.log(
      `  · ${slug} carries your generic title. To use "${title}" instead:` +
        `\n      npm run docx -- --role "${title}" --track <track>`,
    );
  }
  for (const slug of orphaned) {
    console.log(
      `  ! tailored/${slug}.txt has no postings/${slug}.txt, so it never applies`,
    );
  }
  console.log(`\nWrote ${written.length} file(s) to ./docx`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
