# resume

A one-page resume that ships in two positionings (a **creative** track and
an **engineering** track) from a single content file. Built with Vite +
React + TypeScript. Each track is a linkable, printable URL, and one command
renders both to US Letter PDFs.

The hand-built HTML/CSS this grew out of lives in [`reference/`](reference/)
as the "before" snapshot; ~~the git history runs from that through this app.~~
History got messy so I did a re-init; snapshot is still accurate.

Adapting it for your own resume? See [TEMPLATE.md](TEMPLATE.md).

## quick start

```bash
npm install
npm run dev        # http://localhost:5173
```

- `http://localhost:5173/`: creative track (the default)
- `http://localhost:5173/?track=engineering`: engineering track

The track lives in the URL, so either positioning is a link you can drop
straight into an application. A small screen-only switcher (top-right) flips
between them; it never appears in print or the PDFs.

## editing content: the one file

All copy lives in [`src/data/resume.ts`](src/data/resume.ts). No need to touch a
component to change what the resume says.

Every field is authored once and is either **shared** across both tracks or
**split** per track with `perTrack(creative, engineering)`:

```ts
name: 'Jesse Vaughan',                                  // shared
role: perTrack('Creative & Brand Leader',              // creative
                'Design Engineer · Web Architect'),     // engineering
```

`resolveResume(data, track)` (in [`src/resume-schema.ts`](src/resume-schema.ts))
collapses that to a flat shape for one track; the components only ever see
resolved values. The schema bends to real content where it needs to: a role's
title can diverge, a note can share its text but move position per track, and a
role can be title-only on one track. See the schema file for the types and the
load-bearing copy guardrails carried over from the original.

To make it your own: fork, replace `src/data/resume.ts` (and
[`public/avatar.svg`](public/avatar.svg)), and adjust the tokens in
[`src/styles/resume.css`](src/styles/resume.css); the whole design system
(type scale, spacing, color) is the `:root` block at the top.

## fonts

Font files are **not** committed (licensed). Drop them in `public/fonts/` and
they load from `/fonts/…` at dev, build, and PDF time. The `@font-face`
declarations are at the top of `src/styles/resume.css`. Without the files the
site falls back to the system stack.

## PDFs

```bash
npm run pdf        # builds, renders both tracks, runs the ATS check
```

Outputs `pdfs/Jesse-Vaughan-Resume-Creative-Brand-Leader..pdf` and `-Engineer-Web-Architect.pdf` at
US Letter via headless Chrome. It then re-proves the ATS guarantee with
`pdftotext`: the text extracts in logical reading order (main column before
sidebar) and each track keeps its content guardrails. Install `poppler`
(`brew install poppler`) for the check; without it the PDFs still generate.

PDFs are gitignored (they embed the licensed fonts)

## deploy

```bash
npm run ship
rsync -avz --delete dist/ user@host:/home/user/resume.jessevaughan.com/
```

`npm run ship` runs three steps in an order that matters:

1. `npm run pdf` — builds with `INCLUDE_LETTERS=1` and renders the PDFs.
2. `npm run build` — rebuilds clean, so the cover letters are **not** in the
   deployed bundle. The PDF build's `dist/` is discarded here on purpose.
3. `scripts/publish.mjs` — copies the two track PDFs into `dist/pdfs/`.

Only the two resume PDFs are copied, by name. Cover letters are generated into
the same `pdfs/` directory and are never published, so the copy step is an
explicit list rather than a glob. Keep it that way.

The licensed fonts in `public/fonts/` get copied into `dist/` at build, so the
live site ships them as long as they're present locally.

## layout / ATS notes

- Markup order is header → summary → highlights → experience → skills →
  education, so a PDF text extractor reads it logically. The sidebar is placed
  left with CSS grid, not markup order. Keep it that way.
