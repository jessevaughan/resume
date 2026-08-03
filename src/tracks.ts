// ── Tracks: the positionings the resume ships in ───────────────────────
// This is the single source for track identity. To rename, add, or remove a
// track, edit this file. TypeScript will then flag the spots that need to
// follow: the perTrack() calls in src/data/resume.ts. Also update the (not
// type-checked) check config in scripts/pdf.mjs by hand.
//
// The whole app is built around two positionings, so the ergonomic
// perTrack(a, b) helper takes exactly two values; a third track would mean
// generalizing that helper.

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
