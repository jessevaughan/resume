// ── Tracks: the positionings the resume ships in ───────────────────────
// This is the single source for track identity. To rename, add, or remove a
// track, edit this file. TypeScript will then flag the spots that need to
// follow: the perTrack() calls in src/data/resume.ts. Also update the (not
// type-checked) check config in scripts/pdf.mjs by hand.
//
// The whole app is built around two positionings, so the ergonomic
// perTrack(a, b) helper takes exactly two values; a third track would mean
// generalizing that helper.

export const TRACKS = ['creative', 'engineering'] as const

export type Track = (typeof TRACKS)[number]

export const DEFAULT_TRACK: Track = 'creative'

// Labels for the screen-only track switcher.
export const TRACK_LABELS: Record<Track, string> = {
  creative: 'Creative',
  engineering: 'Engineering',
}
