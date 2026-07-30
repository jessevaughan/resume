# make it your own

This resume is set up so you can fork it and swap in your own content. It's
built around **two positionings** (called "tracks") that share one layout; if
you only want one resume, see the note at the bottom.

Everything below is a local, one-command workflow. No accounts or CI required.

```bash
npm install
npm run dev        # http://localhost:5173
```

## the checklist

1. **Your content** → [`src/data/resume.ts`](src/data/resume.ts). This is the
   one file that holds every line of copy. Each field is either **shared**
   across both tracks or **split** with `perTrack(a, b)`:

   ```ts
   name: 'Your Name',                              // shared
   role: perTrack('Design Lead', 'Staff Engineer') // per track
   ```

   `resolveResume()` in [`src/resume-schema.ts`](src/resume-schema.ts) flattens
   it to one track; you never touch a component to change what the resume says.

2. **Your name in the tab title** → the `<title>` in
   [`index.html`](index.html) (the live title is set from your data at runtime;
   this is just the pre-load fallback).

3. **Avatar** → replace [`public/avatar.svg`](public/avatar.svg), or delete it
   and remove the `<img className="avatar">` in
   [`src/components/Masthead.tsx`](src/components/Masthead.tsx).

4. **Fonts** → the two typefaces are declared with `@font-face` at the top of
   [`src/styles/resume.css`](src/styles/resume.css) and loaded from
   `public/fonts/`. Either drop your own files there and update those blocks,
   or point `--font-sans` / `--playful` at system fonts and delete the
   `@font-face` blocks. (The repo's own fonts are licensed and gitignored, so a
   fresh clone falls back to the system stack until you add fonts.)

5. **Look and feel** → the whole design system (type scale, spacing, color) is
   the `:root` token block at the top of `resume.css`. Change values there, not
   in individual rules.

6. **Tracks** → the two track ids and their switcher labels live in
   [`src/tracks.ts`](src/tracks.ts). To rename them (say to `ic` / `manager`),
   edit that file; TypeScript will then flag the `perTrack()` calls to update.
   Also update the ids in the `scripts/pdf.mjs` config block (step 7).

7. **PDFs** → `npm run pdf` renders both tracks to US-Letter PDFs. Edit the
   config block at the top of [`scripts/pdf.mjs`](scripts/pdf.mjs): set `NAME`
   (drives the filenames) and, per track, the `order` (section headings that
   must extract in reading order, the ATS guarantee) and the optional
   `mustContain` / `mustNotContain` keyword checks. **Leave the keyword arrays
   empty to skip them**; the reading-order check still runs. Install `poppler`
   (`brew install poppler`) to run the check locally.

8. **Deploy** → `npm run build` outputs static files to `dist/`; upload that
   folder anywhere. See the deploy section in [`README.md`](README.md) for an
   rsync example.

## Only want one resume?

The app assumes two tracks. The simplest path is to keep both and just fill
them with the same content, or set both `perTrack(a, b)` values equal. To truly
collapse to one, you'd remove the `TrackSwitcher`, drop `useTrack`, and render a
single track in [`src/App.tsx`](src/App.tsx): a small edit, but more than a
config change.
