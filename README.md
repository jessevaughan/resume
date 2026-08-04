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
- `http://localhost:5173/engineering`: engineering track

Each track is a path, so either positioning is a link you can drop straight
into an application and a crawler can index separately. The default track
keeps the bare root, because the short URL is the one that gets typed.

`/creative` and the older `?track=engineering` both still resolve, and get
rewritten to the canonical URL on arrival, so links shared before this change
still land somewhere real.

A screen-only toolbar (top-right) carries the track switcher plus Save PDF,
GitHub, and Portfolio. It never appears in print or the PDFs.

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

`Archivo-Thin.woff2` is open source and committed. The licensed Serrif faces
are **not** in the repo: drop them in `public/fonts/` and they load from
`/fonts/…` at dev, build, and PDF time. Without them the site falls back to
the system stack, and nothing in the pipeline will tell you — `pdftotext`
reads the PDF content stream, not the glyphs, so the ATS check passes either
way. Check `pdffonts` on a rendered PDF if you're unsure.

woff2 only. Vite ships an ES-module bundle, so every browser that can run this
app supports woff2 and the `.woff` fallbacks were unreachable.

CI restores the licensed faces from base64 repository secrets, split across
parts because each runs ~75KB encoded against GitHub's ~48KB cap. The step
checks the `wOF2` magic bytes after reassembly, since a truncated secret still
decodes cleanly into garbage.

## PDFs

```bash
npm run pdf        # builds, renders both tracks, runs the ATS check
```

Outputs `pdfs/Jesse-Vaughan-Resume-Creative-Brand-Leader.pdf` and `-Engineer-Web-Architect.pdf` at
US Letter via headless Chrome. It then re-proves the ATS guarantee with
`pdftotext`: the text extracts in logical reading order (main column before
sidebar) and each track keeps its content guardrails. Install `poppler`
(`brew install poppler`) for the check; without it the PDFs still generate.

PDFs are gitignored (they embed the licensed fonts). `npm run ship` copies the
two track PDFs into `dist/pdfs/` so the toolbar's Save PDF button has a target.
Cover letters land in the same directory and are never published — the copy
step is an explicit allowlist, and `publish.mjs` fails the build if anything
else appears in `dist/pdfs/` or if a letter slug turns up in the bundle.

## deploy

Push to `main`. `.github/workflows/deploy.yml` restores the licensed fonts
from secrets, installs poppler, lints, runs `npm run ship`, and rsyncs `dist/`
to DreamHost. Roughly 45 seconds.

The rsync uses `--delete` with excludes for `.dh-diag` (a DreamHost symlink),
`.well-known/` (ACME challenges, so cert renewal can't be blocked), and
`.DS_Store`.

One non-obvious step: `sudo sysctl -w kernel.apparmor_restrict_unprivileged_userns=0`.
`ubuntu-latest` is now 24.04, which blocks the unprivileged user namespaces
Chrome's sandbox needs, and puppeteer dies with "No usable sandbox!" without
it. Preferred over `--no-sandbox` so the scripts behave identically here and
locally.

To deploy by hand:

```bash
npm run ship
rsync -avz --delete \
  --exclude='.dh-diag' --exclude='.well-known/***' --exclude='.DS_Store' \
  -e "ssh -i ~/.ssh/resume_deploy -o IdentitiesOnly=yes" \
  dist/ USER@HOST:/home/USER/resume.jessevaughan.com/
```

`npm run ship` runs three steps in an order that matters:

1. `npm run pdf` — builds with `INCLUDE_LETTERS=1` and renders the PDFs.
2. `npm run build` — rebuilds clean, so the cover letters are **not** in the
   deployed bundle. The PDF build's `dist/` is discarded here on purpose.
3. `scripts/publish.mjs` — strips `.DS_Store`, copies the track PDFs in,
   prerenders each track, and verifies both.

Note; Local and CI builds produce byte-identical `dist/`. That's deliberate, and it's
why `.DS_Store` gets stripped in the publish step rather than only excluded
from the rsync.

### why prerender

This is a Vite SPA, so `dist/index.html` ships as an empty shell. A human with
a browser never notices. What does: a recruiter pasting the URL into Slack to
send to a hiring manager gets an unfurl with no preview, and anything fetching
without running JS gets a blank page.

`publish.mjs` loads each track in the headless Chrome already installed for the
PDFs, waits for the app to set its own title, description, canonical and OG
tags from the resolved resume data, then writes `index.html`, `creative.html`,
and `engineering.html`. `.htaccess` maps `/engineering` onto its file without a
trailing slash, guarded by `-f` so a plain `npm run build` deploy falls through
to the SPA fallback instead of 404ing.

The snapshot is markup, not a hydration payload — React replaces it on mount.
Its only job is to be readable by things that never run the script, so the
check is that the text and the meta tags are actually in the HTML.

## layout / ATS notes

- Markup order is header → summary → highlights → experience → skills →
  education, so a PDF text extractor reads it logically. The sidebar is placed
  left with CSS grid, not markup order. Keep it that way.
