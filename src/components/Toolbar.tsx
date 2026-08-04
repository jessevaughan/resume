import { REPO_URL, TRACKS, TRACK_LABELS, pdfHref, type Track } from "../tracks";

/**
 * Screen-only chrome: the track switcher plus the things a reader wants once
 * they've picked a track. Fixed so it never affects page geometry, and hidden
 * in print (see .toolbar in styles/app.css) so it stays out of the PDFs.
 *
 * The URL is still the real interface. This is the convenience layer.
 *
 * portfolioUrl comes in as a prop rather than living here as a constant,
 * because the resume's contact block already carries it. One source.
 */
export function Toolbar({
  track,
  onChange,
  portfolioUrl,
}: {
  track: Track;
  onChange: (track: Track) => void;
  portfolioUrl: string;
}) {
  return (
    <div className="toolbar">
      <div className="toolbar__group" role="group" aria-label="Resume track">
        {TRACKS.map((t) => (
          <button
            key={t}
            type="button"
            className="toolbar__track"
            aria-pressed={t === track}
            onClick={() => onChange(t)}
          >
            {TRACK_LABELS[t]}
          </button>
        ))}
      </div>

      <span className="toolbar__rule" aria-hidden="true" />

      <div className="toolbar__group">
        {/* download, not target=_blank: the point is to put a named file in
            the reader's downloads folder rather than open a viewer they then
            have to save out of. Same-origin, so the attribute is honoured. */}
        <a className="toolbar__action" href={pdfHref(track)} download>
          Save PDF
        </a>
        <a
          className="toolbar__action"
          href={REPO_URL}
          target="_blank"
          rel="noopener"
        >
          GitHub
        </a>
        <a className="toolbar__action" href={portfolioUrl}>
          Portfolio
        </a>
      </div>
    </div>
  );
}
