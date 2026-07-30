# reference — archived pre-React source

The original hand-built resume: two static HTML files sharing one stylesheet,
printed to PDF from Chrome. This is the "before" snapshot the React app was
ported from; it is **not** live and is kept for history.

- `index.html` — Track A (creative)
- `index-b.html` — Track B (engineering)
- `styles.css` — shared stylesheet

Their font and avatar paths point at locations that moved under `public/`
during the port, so these files no longer render standalone. The content and
the copy guardrails they carried now live in `src/data/resume.ts`.
