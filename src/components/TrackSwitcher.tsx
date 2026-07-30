import { TRACKS, TRACK_LABELS, type Track } from '../tracks'

/**
 * A screen-only control I use for flipping tracks. I position it fixed so
 * it never affects page geometry, and hide it in print (see .track-switcher
 * in the stylesheet). The URL is the real interface; this is just a
 * convenience.
 */
export function TrackSwitcher({
  track,
  onChange,
}: {
  track: Track
  onChange: (track: Track) => void
}) {
  return (
    <div className="track-switcher" role="group" aria-label="Resume track">
      {TRACKS.map((t) => (
        <button
          key={t}
          type="button"
          aria-pressed={t === track}
          onClick={() => onChange(t)}
        >
          {TRACK_LABELS[t]}
        </button>
      ))}
    </div>
  )
}
