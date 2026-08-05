import { TRACKS, TRACK_LABELS, pdfHref, type Track } from "../tracks";
import { DownloadIcon } from "./icons";

/**
 * Shown instead of the resume below the width where an 8.5in page can be read.
 *
 * Deliberately not a dead end. "View on desktop" is a real cost when a
 * recruiter opens the link from their phone, so this hands them the PDF, which
 * reads fine in any mobile viewer, and keeps the track switch so they land on
 * the right positioning.
 *
 * Visibility is CSS-only (see .mobile-notice in styles/app.css), never a
 * window-width check in JS. scripts/publish.mjs prerenders through a headless
 * browser, so a JS gate would bake whichever state that viewport happened to
 * hit into the static HTML. As a media query, the resume stays in the markup
 * for crawlers no matter what size the snapshot renders at.
 */
export function MobileNotice({
  track,
  onChange,
  name,
  role,
  portfolioUrl,
}: {
  track: Track;
  onChange: (track: Track) => void;
  name: string;
  role: string;
  portfolioUrl: string;
}) {
  return (
    <div className="mobile-notice">
      <div className="mobile-notice__card">
        <p className="mobile-notice__name">{name}</p>
        <p className="mobile-notice__role">{role}</p>

        <p className="mobile-notice__body">
          This resume is laid out at US Letter, so it reads better on a wider
          screen. The PDF works anywhere.
        </p>

        <div
          className="mobile-notice__tracks"
          role="group"
          aria-label="Resume track"
        >
          {TRACKS.map((t) => (
            <button
              key={t}
              type="button"
              className="mobile-notice__track"
              aria-pressed={t === track}
              onClick={() => onChange(t)}
            >
              {TRACK_LABELS[t]}
            </button>
          ))}
        </div>

        <a className="mobile-notice__download" href={pdfHref(track)} download>
          <DownloadIcon />
          Download PDF
        </a>

        <a className="mobile-notice__link" href={portfolioUrl}>
          jessevaughan.com
        </a>
      </div>
    </div>
  );
}
