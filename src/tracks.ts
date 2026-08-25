// ── Tracks: the positionings the resume ships in ───────────────────────
// This is the single source for track identity. To rename, add, or remove a
// track, edit this file. TypeScript will then flag the spots that need to
// follow: the perTrack() calls in src/data/resume.ts. Also update the (not
// type-checked) check config in scripts/pdf.mjs by hand.
//
// One track is the normal case. Two positionings is a personal choice — mine —
// not something the app requires: set TRACKS to a single entry, trim the
// records below to match, and the switcher hides itself. perTrack() builds
// from TRACKS, so it keeps working at any count (a single-track resume can
// also just author plain values and never call it).

export const TRACKS = ["creative", "engineering"] as const;

export type Track = (typeof TRACKS)[number];

export const DEFAULT_TRACK: Track = "creative";

// Labels for the screen-only track switcher.
export const TRACK_LABELS: Record<Track, string> = {
  creative: "Creative",
  engineering: "Engineering",
};

// ── URLs ───────────────────────────────────────────────────────────────
// Each track is a path, so either positioning is a link you can drop into an
// application and a crawler can index separately. The default track keeps the
// bare root, because the short URL is the one that gets typed and pasted.
export const TRACK_PATHS: Record<Track, string> = {
  creative: "/",
  engineering: "/engineering",
};

// Every path that resolves to a track, including aliases the canonical map
// above doesn't cover. Keys are compared with the trailing slash stripped.
export const TRACK_BY_PATH: Record<string, Track> = {
  "/creative": "creative",
  "/engineering": "engineering",
};

// ── PDFs ───────────────────────────────────────────────────────────────
// KEEP IN SYNC with scripts/pdf.mjs, which derives the same filenames from
// its own NAME + per-track `name` config and is not type-checked. The two are
// hand-synced on purpose, matching the existing arrangement for the ATS check
// config; if they drift, the download button 404s.
const PDF_OWNER = "Jesse Vaughan";

const PDF_SUFFIX: Record<Track, string> = {
  creative: "Creative-Brand-Leader",
  engineering: "Creative-Technologist-Web-Architect",
};

/**
 * Public path to a track's PDF. scripts/publish.mjs (batch 3) copies exactly
 * these two files into dist/pdfs/. Cover letters are never copied.
 */
export function pdfHref(track: Track): string {
  return `/pdfs/${PDF_OWNER.replace(/\s+/g, "-")}-Resume-${PDF_SUFFIX[track]}.pdf`;
}

export const REPO_URL = "https://github.com/jessevaughan/resume";
export const SITE_URL = "https://resume.jessevaughan.com";
