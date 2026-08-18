# resume

A resume builder for people who want the thing to look right and still survive an applicant tracking system.
One content file, four artifacts:

| artifact | audience | command |
| --- | --- | --- |
| a single-column **.docx** | the ATS you're uploading into | `npm run docx` |
| a **keyword report** scored against a posting | you, before you hit submit | `npm run keywords -- <slug>` |
| a designed **PDF** | recruiters, hiring managers, your portfolio | `npm run pdf` |
| a **cover letter**, as .docx and paste-ready .txt | whichever the form asks for | `npm run letter -- <slug>` |

Vite + React + TypeScript, but you can ignore all of that.
The generators run from the terminal against one data file.

> Everything down to [this copy: my setup](#this-copy-my-setup) is general.
> After that heading it's scaffolding for one specific deployment, including the public site, with notes on tearing it out.

## why it's split this way

Most resume advice collapses into "your layout is too fancy, make it plain."
That's true of the file you upload and wrong about the file you hand someone.
This builds both from the same data instead of making you choose.

An ATS mostly isn't auto-rejecting you.
Recruiters query it like a database: keyword, job title, date range.
A resume that parses badly doesn't earn a rejection, it just never appears in the result set.
Everything here aims at being **findable**, not at beating a filter.

That's why the .docx exists.
A two-column PDF reads well to a person and badly to a parser rebuilding lines by vertical position; measured here, 12 to 18 of about 60 lines came out with the sidebar interleaved into the main column.
A .docx has no paint order, no text runs, and no columns to interleave, which lets the design survive where it belongs while the upload copy stays boring on purpose.

---

## 1. set up

```bash
npm install
npm run docx        # writes docx/ from src/data/resume.ts
```

That's the whole ATS side.
No build step, no dev server, nothing hosted.
The generators bundle the data file directly and never load the web app.

If you want to change how the resume looks, `npm run dev` opens a live preview at `localhost:5173`.
That preview is also what the PDF renderer screenshots, which earns its keep even if you never put the site anywhere.

## 2. make it yours

All copy lives in **[`src/data/resume.ts`](src/data/resume.ts)**.
No need to touch a component to change what the resume says.
[TEMPLATE.md](TEMPLATE.md) is the step-by-step checklist; the short version:

| what | where |
| --- | --- |
| every line of copy | [`src/data/resume.ts`](src/data/resume.ts) |
| type scale, spacing, color | the `:root` block in [`src/styles/resume.css`](src/styles/resume.css) |
| fonts | `@font-face` at the top of the same file |
| avatar, or delete it | `public/` and [`Masthead.tsx`](src/components/Masthead.tsx) |
| .docx name and font | the config block in [`scripts/docx.mjs`](scripts/docx.mjs) |
| PDF filenames and checks | the config block in [`scripts/pdf.mjs`](scripts/pdf.mjs) |

### how the content model works

Dates are structural, never free text:

```ts
start: { year: 2022, month: 2 },
end:   { year: 2026, month: 6 },   // or 'present'
```

One formatter renders them everywhere: an en dash for the PDF, a plain hyphen for the .docx, which is the range form date parsers handle most reliably.
Mixed formats ("Jan 2019", "2019-01", "January '19") make an ATS miscalculate total experience.
Free-text dates drift the moment you add a role.

Roles group under an **employer**, which lets internal promotions read as tenure rather than as separate jobs.
The employer's span is derived from its roles, which keeps a company's dates from disagreeing with what's inside it.
An employer can also carry `earlier` titles.
Those render as one compressed line but still count toward the span, which matters when an early role is what makes your years-of-experience arithmetic come out right.

### tracks

A **track** is one positioning of the resume.
One is the normal case: author plain values and skip `perTrack()`.
Set `TRACKS` in [`src/tracks.ts`](src/tracks.ts) to a single entry and the switcher hides itself.
Nothing else assumes a count.
Two or more tracks share one layout and diverge field by field through `perTrack()`, which is what this copy does.

## 3. the commands

| command | what it does |
| --- | --- |
| `npm run docx` | sync `docx/`: standing copies plus one per posting |
| `npm run docx -- --role "Title" --track <t>` | a one-off titled copy |
| `npm run keywords -- <slug>` | score the resume against `postings/<slug>.txt` |
| `npm run keywords -- <slug> --write` | scaffold `tailored/<slug>.txt` |
| `npm run letter -- <slug>` | cover letter as `.docx` and paste-ready `.txt` |
| `npm run pdf` | designed PDFs plus the reading-order check |
| `npm run prose` | spell and punctuation check the authored copy |
| `npm run prose -- --list` | unknown words, for seeding `scripts/words.txt` |
| `npm run dev` | live design preview at :5173 |
| `npm run readme` | preview a markdown file as GitHub renders it |
| `npm run lint` | oxlint |
| [RESUME-TAILOR.md](RESUME-TAILOR.md) | agent instructions for the tailoring pass |

Four directories stay gitignored, because they're per-application and none of it belongs in a public repo:

| directory | what |
| --- | --- |
| `postings/` | pasted job postings, `<slug>.txt` |
| `tailored/` | per-application wording overrides, `<slug>.txt` |
| `src/data/letters/` | one cover letter per application, `<slug>.ts` |
| `docx/`, `pdfs/` | generated output |

## 4. the per-application loop

### drop in the posting

Paste it into `postings/<slug>.txt`, in one required format:

```
Digital Design Lead

<the descriptive body: what the role does, responsibilities, qualifications>
```

Line 1 is the exact job title, alone.
Everything downstream reads it from there.
A file that doesn't follow the rule **fails loudly** instead of quietly scoring against the wrong thing.
An earlier version guessed at it, and once titled a resume "About the job".

**Paste only the descriptive body.**
Leave out legal boilerplate, EEO statements, salary and benefits tables, and "about the company" marketing.
They add hundreds of terms the scorer has to weigh, crowding out the vocabulary that describes the job.

### score it

```bash
npm run keywords -- okta
```

```
  Keyword report: okta
  ────────────────────────────────────────────────────────────
  posting    1195 words → 258 scoreable terms
  resume     creative track, titled "Creative & Brand Leader" (generic)

  Posting title     ✗ not on your resume
                    "Digital Design Lead"
  Top-10 terms      ███████████░░░░░░░ 6/10
  All terms         ██░░░░░░░░░░░░░░░░ 34/258 (13%)
  Cheap rewrites    46 partial matches
```

Read Top-10 first.
Long postings dilute the overall figure, which is why 13% of 258 terms isn't a grade.
**Partial** is the bucket worth acting on: you have the substance and the posting uses different words, like your "Adobe CC" against its "Adobe Creative Cloud".
Different strings to a parser, one word of editing to fix.

No cover letter needed at this stage.
You want to know whether a posting is worth pursuing before you write one.
If a letter for that slug exists, its exact title and track get picked up automatically.

Every number is mechanical: literal string overlap and repetition counts.
It can't judge seniority, domain, or whether you'd be good at the job.
A role you'd be excellent for can score badly.
The widely repeated "25 to 35 keywords" figure isn't worth engineering to.
Padding to hit a number is what AI-assisted screening now penalises.

### tailor the wording

The core resume is canonical and nothing tailoring-related ever edits it.
Per-application changes live in one plain text file:

```bash
npm run keywords -- okta --write     # scaffolds tailored/okta.txt
```

```
# Tailoring for: okta
# Delete this file and okta goes back to your core resume.

title: Digital Design Lead

- design systems
+ digital design systems
```

`title:` carries the posting's title in the header for that application only.
Each `-` / `+` pair is a literal find-and-replace across the resume's text, applied at render time.
Pairs match longest first in a single pass, which lets a specific phrase beat a general one that contains it and stops any replacement from chewing through another's output.
The scaffold arrives entirely commented out; generating it never changes an artifact until you uncomment something.

Tailoring reaches the `.docx` and the keyword score.
Nothing else: your PDF, the site, and your cover letters always render the core resume.
There is no way to get a tailored PDF out of this pipeline, which is [covered below](#6-the-designed-pdf-optional).

Hand-edit it, or hand [RESUME-TAILOR.md](RESUME-TAILOR.md) to a coding agent to fill it in with approval on each pair.
Delete the file and the application reverts completely, which is the property that makes tailoring safe to do casually.

A pair whose `-` side isn't in your resume gets **reported, not silently skipped**.
That's the failure that would otherwise mean shipping a docx believing an edit landed:

```
✓ …-Okta.docx  [creative] "Digital Design Lead"  +1 reword(s), 2 replacement(s)
    ! "a phrase that is not in my resume" is not in your resume, not applied
```

`npm run keywords` scores against the tailored version when a file exists, which makes the report reflect what the docx will actually contain.

#### filling in the `-` side

The scaffold writes the `+` side from the posting and leaves `-` blank, because only you know which of your words it should replace.
Search the resume for the concept:

```bash
grep -o '"[^"]*design[^"]*"' src/data/resume.ts
```

Then paste your own wording after the `-`.
It has to match character for character.
Anything that doesn't gets reported rather than skipped.

**Use the longest distinctive phrase you can.**
Replacement is global, so a bare `design` hits every instance on the resume.
The run reports how many times each pair fired and flags any that fired four or more times:

```
✓ …-Okta.docx  [creative] "Digital Design Lead"  +2 reword(s), 9 replacement(s)
    ! "design" replaced 7x. Use a longer, more distinctive phrase
```

Two replacements from one pair reads right.
Seven usually means the phrase was meant to be longer.

The **missing** list stays manual on purpose, because those are claims rather than phrasings.

[RESUME-TAILOR.md](RESUME-TAILOR.md) is a plain markdown checklist for a coding agent: filter the partials to terms that actually repeat and are concrete, find the phrase each belongs in, propose one before/after at a time, then verify the coverage delta.
It rewords; it never adds claims.
Nothing about it is tied to a particular tool, so point your agent at the file, paste it into a chat, or install it as a reusable command.
The file explains how, and you can work the checklist by hand instead.

### on carrying the posting's title

Recruiters do filter by title, where "Head of Creative" and "Creative Lead" don't match each other.
But a header that doesn't match your title of record can read as a stretch, and the jury is out on whether that trade is worth making.

So it's **opt-in, never automatic**.
Nothing infers a title onto your resume; it takes a `title:` line, a letter that names the role, or an explicit `--role`.
Work Experience shows your real titles either way.
The header is a positioning line, not a claim about a job you held.

### generate the upload copy

```bash
npm run docx
```

A sync, not a one-off.
It writes the **standing copies**, one per track with your generic titles, which is the always-accurate untailored resume.
Then **one copy per posting**, named `…-Resume-<Track>-<Company>.docx`.

Per-posting copies exist even when identical to the standing copy.
That's the point: twenty applications deep, "which file did I send Okta" is a question you answer by looking.
Ignore `postings/` entirely and you get just the standing copies.

The sync also deletes copies whose posting is gone, mirroring `postings/`.
Each deletion is printed.
Pruning only touches the auto-generated `…-<Track>-<slug>.docx` shape, which leaves anything you built deliberately with `--role` or `--letter` alone.
Cover letters aren't touched at all.

### cover letters

```bash
npm run letter -- faire
```

One file per application in `src/data/letters/`, carrying the company, the exact role title, and the track.
It writes two artifacts, because forms ask two different ways.
A file-upload field gets the `.docx`: full business-letter header, single column, nothing in a Word header or footer.
A textarea gets the `.txt`, which is greeting, body, and sign-off only, since the form already collected your contact details.
The command prints a `pbcopy` line for that one.

Unlike the resume, this isn't about being extractable.
Nothing parses a cover letter into fields, which means there's no schema to get wrong.

## 5. what the .docx does differently

It isn't the PDF converted.
It's rebuilt from the same data under different rules:

- single column, no tables, no text boxes, no images
- US Letter, one-inch margins. The library defaults to A4, which quietly hands a US applicant a European page size
- contact details in the **body**, never a Word header or footer, which most ATS ignore outright. That's how people end up in a system with no name attached
- standard headings only: Summary, Work Experience, Skills, Education. Non-standard headings get folded or renamed, because a heading nobody filters on sends its contents to a miscellaneous field
- real Word bullet lists, not bullet glyphs typed into text
- comma separators instead of `·`, which carries no word-boundary meaning
- every role repeats its company, even though the PDF groups them. Parsers hunt for title/company/date triples. A company heading with roles nested under it asks them to infer the association. Inference is where they get it wrong

There's deliberately no page-count check.
A .docx has no pages until something lays it out.
Each renderer paginates differently, which makes any number here one renderer's guess.
Two pages is fine: page count is a human convention, not an ATS constraint.

### spelling and punctuation

Both `npm run docx` and `npm run pdf` end with a check on the copy itself, and a finding fails the run.
`npm run prose` is the same check on its own.

It reads the authored strings in [`src/data/resume.ts`](src/data/resume.ts), not the rendered files.
Both artifacts come from the same prose, so a typo is caught once instead of twice, and extracted PDF text is the wrong input anyway: `hyphenSafe` splits hyphenated words across spans, so a spell check reading it would report rendering artifacts forever.
Coverage is both tracks, every cover letter, and every tailoring applied to the resume it rewrites.

Spelling comes from a bundled dictionary, so unlike the `pdftotext` checks it can't quietly skip on a machine that's missing a binary.
A resume is mostly proper nouns, so the words that dictionary doesn't know live in [`scripts/words.txt`](scripts/words.txt), one per line, and their casing is enforced: with `AdRoll` on the list, `Adroll` is a finding.
Tailored copy is checked against the posting as well, so a term the employer uses in their own posting needs no entry.

Read `--list` output before pasting it in. A typo that lands in the wordlist is invisible from then on, which is the one way this check can be defeated.

The punctuation rules cover double spaces, space before punctuation, missing space after a comma, repeated words, curly quotes, hyphens in year ranges, unbalanced brackets, invisible characters, and a bullet group where some items end in a period and others don't.
Every rule was run against the current copy before it was added and every one is silent on it, because a rule that fires on prose you consider correct is a rule that teaches you to ignore the check.

## 6. the designed PDF (optional)

```bash
npm run pdf
```

This builds the app and screenshots it through headless Chrome into `pdfs/`, all locally.
Nothing is served or deployed; the site is the PDF's rendering engine, not a destination.

**The PDF always renders the core resume.**
Per-application tailoring never reaches it, because the PDF comes from the web app and the app has no idea `tailored/` exists.
If a posting wants a tailored resume as a PDF, send the `.docx` instead, which is the better upload anyway.
If the reword is genuinely a better way to describe the work, promote it into [`src/data/resume.ts`](src/data/resume.ts) and every artifact picks it up.

It then re-proves the reading guarantee with `pdftotext`: text extracts in logical order, name and contact first.
Install `poppler` (`brew install poppler`) for the check.
Without it the PDFs still generate.

Two constraints are easy to break and hard to notice, because both look fine on screen:

- **Nothing containing text may be CSS-positioned.** Chrome writes PDF text in paint order. A positioned box paints after every in-flow box. Putting `position: relative` on the masthead once buried the name and contact line about 200 items into the text stream, leaving parsers that read straight through to take "Summary" as the name. `#root` is the one positioning context.
- **Keep prose in one DOM text node.** Chrome emits one text run per node, and any parser re-inferring word breaks from x-gaps drops the whitespace-only ones. A helper returning one node per word turned the summary into "Sixteenyearsacrossbrand".

Both are guarded by the check in [`scripts/pdf.mjs`](scripts/pdf.mjs), whose `order` anchors lead with the name and email.
Section headings alone can't catch a slipped masthead, because they all move together.

## 7. fonts

Archivo is open source and committed: four static cuts in `public/fonts/`.
Set `--fw-body` in [`src/styles/resume.css`](src/styles/resume.css) and the browser picks the matching file.
Or point `--font-sans` and `--playful` at system fonts and delete the `@font-face` blocks.

Instance a variable font to static cuts before using it.
Chrome can't embed a live variable instance as real TrueType in a PDF, falling back to Type 3 glyphs, whose text loses its word spaces when extracted.
`pdffonts yourfile.pdf` should read CID TrueType for every face.

---

# this copy: my setup

Everything below supports one specific deployment.
None of it is required to use the tool; [stripping it out](#stripping-it-out) is a short list.

## two tracks

This resume ships two positionings, `creative` and `engineering`, sharing one layout and diverging bullet by bullet.
Each is a real URL I can paste into an application.
That's a personal choice, not a requirement; see [tracks](#tracks).

## licensed fonts

The Serrif faces are **not** in the repo.
Drop them in `public/fonts/` and they load at dev, build, and PDF time.
Without them the site falls back to the system stack.
Nothing in the pipeline will say so: `pdftotext` reads the content stream rather than the glyphs.

CI restores them from base64 repository secrets, split across parts because each runs about 75KB encoded against GitHub's 48KB cap.
The step checks the `wOF2` magic bytes after reassembly, since a truncated secret still decodes cleanly into garbage.

## the public site

Most people forking this will never build a site, and nothing above needs one.
This copy deploys to [resume.jessevaughan.com](https://resume.jessevaughan.com), which is what the rest of this section covers.

`npm run build` outputs static files to `dist/`; upload that folder anywhere.
Push to `main` and `.github/workflows/deploy.yaml` restores the fonts, installs poppler, lints, runs `npm run ship`, and rsyncs to DreamHost in about 45 seconds.

`npm run ship` runs three steps in an order that matters:

1. `npm run pdf` builds with `INCLUDE_LETTERS=1` and renders the PDFs.
2. `npm run build` rebuilds clean. Cover letters stay **out** of the deployed bundle. The PDF build's `dist/` is discarded on purpose.
3. `scripts/publish.mjs` strips `.DS_Store`, copies the track PDFs in, prerenders each track, and verifies both.

Local and CI builds produce byte-identical `dist/`.

Cover letters never reach the public site.
The registry is only bundled when `INCLUDE_LETTERS=1`; the deploy build aliases it to an empty stub.
`publish.mjs` fails if a letter slug appears in the bundle or an unexpected file turns up in `dist/pdfs/`.

**Why prerender:** being a Vite SPA, this ships `dist/index.html` as an empty shell.
A human never notices.
A recruiter pasting the URL into Slack gets an unfurl with no preview.
Anything fetching without running JS gets a blank page.
`publish.mjs` loads each track in the headless Chrome already installed for the PDFs and writes real markup with the meta tags resolved.

One non-obvious CI step: `sudo sysctl -w kernel.apparmor_restrict_unprivileged_userns=0`.
`ubuntu-latest` is 24.04, which blocks the unprivileged user namespaces Chrome's sandbox needs.
Preferred over `--no-sandbox` so the scripts behave identically in CI and locally.

## layout notes

- Markup order is header → summary → highlights → experience → skills → education, so a PDF text extractor reads it logically. The sidebar is placed left with CSS grid, not markup order. Keep it that way.
- The toolbar and the mobile gate are scoped to `@media screen`. `pdf.mjs` renders at puppeteer's 800x600 default, so an unscoped 900px breakpoint would put the mobile card into the PDFs.
- The mobile gate is CSS, never a JS width check. `publish.mjs` prerenders through headless Chrome, so a JS gate would bake one viewport's state into the static HTML and drop the resume text from what a crawler reads.
- Below 900px the resume is replaced by a card with the track switcher and a download, since an 8.5in page has no honest small-screen layout.

The hand-built HTML/CSS this grew out of lives in [`reference/`](reference/) as the "before" snapshot.

## stripping it out

If you only want the resume and the generators:

| to drop | do this |
| --- | --- |
| the second track | `TRACKS = ["creative"]` in [`src/tracks.ts`](src/tracks.ts), trim the records below it, drop the extra entry in `scripts/pdf.mjs` |
| deploying a site | delete `.github/workflows/`, `scripts/publish.mjs`, and the `ship` and `publish:dist` scripts. Keep `build`: `npm run pdf` calls it to render |
| licensed fonts | already absent. Point `--font-sans` and `--playful` at system fonts and delete the `@font-face` blocks |
| the avatar | delete the `<img className="avatar">` in [`Masthead.tsx`](src/components/Masthead.tsx) and the `.avatar` rule |
| cover letters | leave `src/data/letters/` empty and skip `npm run letter`. Nothing else depends on it |
| the whole web and PDF side | keep `npm run docx` and `npm run keywords`. They read `src/data/resume.ts` directly and never touch the app |

That last row is the short path.
The generators bundle the data with rolldown and don't need the site to exist at all.
