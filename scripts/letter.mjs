// Render one cover letter to a .docx for upload and a .txt for pasting.
//
//   node scripts/letter.mjs faire          # both, into ./docx
//   node scripts/letter.mjs faire --print  # also echo the paste text
//
// Run `npm run letter -- <slug>`. The slug is the letter's filename, so
// src/data/letters/faire.ts is `faire`.
//
// Two artifacts because application forms ask for the letter two different
// ways. A file-upload field wants a document: the .docx carries the full
// business-letter header, and like the resume copy it is single column with no
// images, no tables, and nothing in a Word header/footer.
//
// A textarea wants prose. The .txt is the letter only: greeting, body,
// sign-off, with no contact block or date line, because the form has already
// collected all of that and pasting it again reads like a mail merge. Nothing
// parses a cover letter into fields, so unlike the resume this is about being
// readable, not about being extractable.

import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { AlignmentType } from "docx";
import {
  loadResumeModule,
  tryLoadLetter,
  letterSlugs,
  root,
} from "./lib/resume-data.mjs";
import {
  body,
  contactLine,
  makeDocument,
  slugify,
  text,
  writeDocx,
} from "./lib/docx-common.mjs";
import { parseFlags, failArgs } from "./lib/cli.mjs";

const outDir = join(root, "docx");
const NAME = "Jesse Vaughan";
const META_SEP = " · ";

/** Greeting, body, sign-off. What goes in a textarea. */
function plainText(letter, name) {
  return [letter.greeting, "", ...letter.paragraphs.flatMap((p) => [p, ""]), name].join(
    "\n",
  );
}

function buildDocument(letter, name, role, contact) {
  return makeDocument([
    body([text(name, { bold: true, size: 32 })], { spacing: { after: 40 } }),
    body([text(role, { size: 22 })], { spacing: { after: 40 } }),
    body([text(contactLine(contact, { email: letter.email }), { size: 20 })], {
      spacing: { after: 320 },
    }),

    body(
      [
        text(
          [letter.date, letter.company, letter.roleTitle].join(META_SEP),
          { size: 20 },
        ),
      ],
      { spacing: { after: 280 } },
    ),

    body([text(letter.greeting, { size: 22 })], { spacing: { after: 200 } }),
    ...letter.paragraphs.map((paragraph) =>
      body([text(paragraph, { size: 22 })], {
        spacing: { after: 200, line: 276 },
        alignment: AlignmentType.LEFT,
      }),
    ),
    body([text(name, { size: 22 })], { spacing: { before: 160 } }),
  ]);
}

const SPEC = { "--print": "boolean" };
const USAGE = "npm run letter -- <slug> [--print]";

function parseArgs(argv) {
  const { values, positionals, errors } = parseFlags(argv, SPEC);
  for (const extra of positionals.slice(1)) {
    errors.push(`unexpected argument "${extra}"`);
  }
  if (!positionals[0]) errors.push("no letter slug given");
  return { slug: positionals[0] ?? null, print: Boolean(values["--print"]), errors };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.errors.length) failArgs(args.errors, USAGE);

  const letter = await tryLoadLetter(args.slug);
  if (!letter) {
    console.error(`No letter at src/data/letters/${args.slug}.ts`);
    const slugs = await letterSlugs();
    if (slugs.length) console.error(`Available: ${slugs.join(", ")}`);
    process.exit(1);
  }
  const { resume, resolveResume } = await loadResumeModule();
  // The masthead carries the track's positioning, matching the web and PDF
  // versions; the posting's exact title rides in the meta line below it.
  const role = resolveResume(resume, letter.track).role;

  const stem = `${NAME.replace(/\s+/g, "-")}-Cover-Letter-${slugify(letter.company)}`;
  const paste = plainText(letter, NAME);

  await mkdir(outDir, { recursive: true });
  await writeDocx(
    buildDocument(letter, NAME, role, resume.contact),
    outDir,
    `${stem}.docx`,
  );
  await writeFile(join(outDir, `${stem}.txt`), `${paste}\n`);

  console.log(`\nCover letter: ${letter.company} · ${letter.roleTitle}`);
  console.log(`  ✓ ${stem}.docx   upload copy`);
  console.log(`  ✓ ${stem}.txt    paste copy (greeting, body, sign-off)`);
  console.log(`\n  Copy the paste version:`);
  console.log(`    pbcopy < docx/${stem}.txt\n`);

  if (args.print) console.log(`${paste}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
