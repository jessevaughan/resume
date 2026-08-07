# make it your own

The step-by-step version of [README.md](README.md), ordered the way you'd actually do it: your content first, a real `.docx` in your hands by step 3, and the design work after that.
The README explains what each command does and why; this is the checklist.

Everything is local and one-command.
No accounts, no CI, and nothing hosted unless you decide you want that.

```bash
npm install
```

## your content

**1. Every line of copy** lives in [`src/data/resume.ts`](src/data/resume.ts).
You never touch a component to change what the resume says.

Each field is either shared or split per positioning:

```ts
name: 'Your Name',                              // shared
role: perTrack('Design Lead', 'Staff Engineer') // one per track
```

One positioning is the normal case: author plain values and skip `perTrack()` entirely.
See [the rest](#the-rest) if you want more than one.

**2. Your work history** is the `experience` array, which groups roles under an employer:

```ts
{
  company: 'Acme',
  roles: [
    {
      title: 'Head of Design',
      start: { year: 2022, month: 2 },
      end: 'present',              // or { year: 2026, month: 6 }
      bullets: ['...'],
    },
  ],
  // Optional: titles that only establish tenure. They count toward the
  // employer's date span but render as one compressed line.
  earlier: [{ title: 'Intern', start: {...}, end: {...} }],
}
```

Dates are structural, never free text.
One formatter renders them everywhere, which keeps them out of the mixed formats ("Jan 2019", "2019-01", "January '19") that make an ATS miscalculate your total years.
The employer's span is derived from its roles, which keeps a company's dates from ever disagreeing with what's inside it.

Grouping roles under an employer also means internal promotions read as tenure rather than as four separate jobs.

## generate something

**3. Write your first upload copy:**

```bash
npm run docx
```

That's it.
`docx/` now holds a single-column, ATS-shaped version of your resume: no columns, no tables, no images, contact details in the body rather than a Word header, standard section headings, real Word bullet lists.
This is the file you upload.

Set `NAME` and `FONT` at the top of [`scripts/docx.mjs`](scripts/docx.mjs).
Keep `FONT` a ubiquitous face like Calibri or Arial rather than your brand font, since a font the ATS host doesn't have is a needless variable.

## the per-application loop

**4. Score yourself against a posting.**
Paste it into `postings/<slug>.txt` with the exact job title alone on line 1, a blank line, then the body:

```
Senior Product Designer

Own end-to-end design for our core product...
```

Paste only the descriptive part: responsibilities and qualifications.
Leave out legal boilerplate, EEO statements, and benefits tables, which add hundreds of terms that crowd out the real vocabulary.
A file that doesn't start with a title fails with instructions rather than guessing.

```bash
npm run keywords -- your-slug
```

It prints what the posting asks for that your resume doesn't say, split into **missing** (absent entirely) and **partial**, where you have the words but not the posting's phrasing, like "Adobe CC" against "Adobe Creative Cloud".
Read partial first; it's usually one word of editing.

No cover letter needed for this step.
Check whether a posting is worth pursuing before you write one.

It reports rather than gates.
Add only what's true, because a term you can't back in an interview is worse than a term you don't have.

**5. Tailor the wording** for one application without touching your core resume:

```bash
npm run keywords -- your-slug --write
```

That scaffolds `tailored/<slug>.txt`, a plain text file holding a `title:` line and `-`/`+` reword pairs, all commented out until you uncomment them.
It layers onto the core resume at render time, which leaves [`src/data/resume.ts`](src/data/resume.ts) untouched.
Deleting the file reverts that application completely.

[RESUME-TAILOR.md](RESUME-TAILOR.md) is a checklist you can hand to a coding agent, any of them, to fill that file in with you, proposing one before/after edit at a time.
It rewords existing bullets and never adds claims.

Carrying the posting's exact title is opt-in and never automatic.
Recruiters do filter by title, but a header that doesn't match your title of record can read as a stretch.
Nothing puts one there unless you ask.
Work Experience shows your real titles either way.

**6. Cover letters (optional)** live one file per application in `src/data/letters/`, gitignored like the rest.
The slug comes from the filename, so `letters/acme.ts` renders at `?letter=acme`.
A letter carries the exact role title and track, which `--letter` then picks up:

```bash
npm run keywords -- acme             # reads postings/acme.txt
npm run docx -- --letter acme        # titled from the letter
npm run letter -- acme               # letter as .docx and paste-ready .txt
```

`npm run letter` writes both because forms ask two ways: the `.docx` for file-upload fields, the `.txt` (greeting, body, sign-off only) for textareas.
Set `NAME` at the top of [`scripts/letter.mjs`](scripts/letter.mjs).
Run it with no slug to list the letters you have.

## the look

**7. Type, spacing, and color** are the `:root` token block at the top of [`src/styles/resume.css`](src/styles/resume.css).
Change values there, not in individual rules.
`npm run dev` gives you a live preview at `localhost:5173`.

Two rules are easy to break and hard to notice, because they decide whether the PDF's text extracts in the right order.
Don't put `position: relative` or `absolute` on anything containing text; `#root` is the one positioning context.
And don't split prose into per-word elements.
Both look perfectly fine on screen while pushing text out of reading order in the PDF.

**8. Fonts** are declared with `@font-face` at the top of the same file and loaded from `public/fonts/`.
Drop your own files there and update those blocks, or point `--font-sans` and `--playful` at system fonts and delete the blocks entirely.
A fresh clone falls back to the system stack until you add fonts.

Instance a variable font to static cuts before using it.
Chrome can't embed a live variable instance as real TrueType in a PDF, falling back to Type 3 glyphs, whose text loses its word spaces when extracted.
`pdffonts yourfile.pdf` should show CID TrueType for every face.

Two smaller things: your name in the `<title>` of [`index.html`](index.html) (the live title comes from your data, so this is only the pre-load fallback), and the avatar at [`public/avatar-plated.png`](public/avatar-plated.png).
Replace it, or delete it along with the `<img className="avatar">` in [`Masthead.tsx`](src/components/Masthead.tsx).

## the rest

**9. Tracks (optional).**
A track is one positioning of the resume, and one is the usual answer.
The two ids and their switcher labels live in [`src/tracks.ts`](src/tracks.ts).
To rename them, edit that file and TypeScript will flag the `perTrack()` calls to update.
Also update the ids in the `scripts/pdf.mjs` config block.

**10. The designed PDF (optional).**

```bash
npm run pdf
```

This builds the app and screenshots it through headless Chrome into `pdfs/`, all locally.
Nothing is served or deployed.
Edit the config block at the top of [`scripts/pdf.mjs`](scripts/pdf.mjs): set `NAME`, and per track the `order` (text that must extract in reading order) plus optional `mustContain` / `mustNotContain` checks.
**Leave the keyword arrays empty to skip them**; the reading-order check still runs.
Install `poppler` (`brew install poppler`) to run it locally.

Keep your name and email as the first two `order` anchors.
Section headings alone can't catch a masthead that has slipped down the text stream, because they all move together.

**11. Putting it on the web (optional).**
`npm run build` outputs static files to `dist/`, which you can upload anywhere.
Most people forking this won't bother, and nothing above needs it.
See "the public site" in [README.md](README.md) for how this copy deploys, including the prerender step and the CI workflow.

## only want one resume?

This is the common case, and it's a config change rather than a code change.
In [`src/tracks.ts`](src/tracks.ts):

```ts
export const TRACKS = ["creative"] as const;
```

Then trim `TRACK_LABELS`, `TRACK_PATHS`, `TRACK_BY_PATH`, and `PDF_SUFFIX` to that one key, and drop the extra entry from the `TRACKS` config block in [`scripts/pdf.mjs`](scripts/pdf.mjs).
That one isn't type-checked, so nothing will warn you.

The track switcher hides itself when there's only one track, in both the toolbar and the mobile card.
`perTrack()` builds from `TRACKS`, so any calls you leave behind keep working and take the first value.
Delete them at your leisure and author plain values instead, which `resolve()` passes straight through.
