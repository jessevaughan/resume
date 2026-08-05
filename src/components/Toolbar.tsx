import { REPO_URL, TRACKS, TRACK_LABELS, pdfHref, type Track } from "../tracks";
import { CodeIcon, DownloadIcon, PortfolioIcon } from "./icons";

/**
 * Screen-only chrome: the track switcher plus the things a reader wants once
 * they've picked a track. Fixed so it never affects page geometry, and hidden
 * in print (see .toolbar in styles/app.css) so it stays out of the PDFs.
 *
 * The URL is still the real interface. This is the convenience layer.
 *
 * The tracks read as buttons and the three actions as icons, because they are
 * different kinds of thing: switching track changes what you're reading, while
 * the actions take you elsewhere or hand you a file. Weighting them equally
 * made the toolbar a row of five things with no hierarchy.
 *
 * Every icon link carries an aria-label AND a title. The label is the
 * accessible name, without which the link announces as its URL; the title is
 * the hover tooltip, without which a sighted reader has to guess. Neither
 * covers for the other.
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
      <div className="toolbar__tracks" role="group" aria-label="Resume track">
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

      <div className="toolbar__actions">
        {/* download, not target=_blank: the point is to put a named file in
            the reader's downloads folder rather than open a viewer they then
            have to save out of. Same-origin, so the attribute is honoured. */}
        <a
          className="toolbar__icon"
          href={pdfHref(track)}
          download
          aria-label={`Download the ${TRACK_LABELS[track].toLowerCase()} resume as a PDF`}
          title="Download PDF"
        >
          <DownloadIcon />
        </a>
        <a
          className="toolbar__icon"
          href={REPO_URL}
          target="_blank"
          rel="noopener"
          aria-label="Source code on GitHub"
          title="Source on GitHub"
        >
          <CodeIcon />
        </a>
        <a
          className="toolbar__icon"
          href={portfolioUrl}
          aria-label="Jesse Vaughan's portfolio"
          title="Portfolio"
        >
          <PortfolioIcon />
        </a>
      </div>
    </div>
  );
}
