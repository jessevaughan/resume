/**
 * Toolbar icons. Inline SVG rather than a dependency: three glyphs don't
 * justify a package, and inlining means no extra request and no flash of a
 * missing icon before it loads.
 *
 * All of them inherit currentColor and size to 1em, so the toolbar's color
 * and font-size rules drive them and nothing needs restating here.
 *
 * aria-hidden on every one. The links that wrap them carry the accessible
 * name via aria-label; announcing the icon too would double it up.
 */

const base = {
  width: "1em",
  height: "1em",
  viewBox: "0 0 16 16",
  fill: "none",
  "aria-hidden": true,
} as const;

/** Arrow into a tray. The universal download affordance. */
export function DownloadIcon() {
  return (
    <svg {...base} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8 1.5v8m0 0L4.75 6.25M8 9.5l3.25-3.25M2 11.5v1.75a1.25 1.25 0 0 0 1.25 1.25h9.5A1.25 1.25 0 0 0 14 13.25V11.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Angle brackets, for the source link. Deliberately NOT GitHub's official
 * mark: that glyph is a solid fill, and next to two 1.4-stroke line icons it
 * reads as a blob rather than a member of the set. It also sidesteps using
 * someone's trademark as UI furniture. "Source code" is the thing being
 * pointed at, and brackets say that without borrowing a logo.
 */
export function CodeIcon() {
  return (
    <svg {...base} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6 5 2.8 8 6 11M10 5l3.2 3L10 11M9.2 3.8 6.8 12.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * A browser window, for the portfolio link. A line icon rather than the site
 * favicon: the favicon is a filled accent-blue tile, which reads as a second
 * button next to the active track pill instead of as an icon. This inherits
 * currentColor like the other two, so the set hovers as one.
 */
export function PortfolioIcon() {
  return (
    <svg {...base} xmlns="http://www.w3.org/2000/svg">
      <rect
        x="1.6"
        y="2.6"
        width="12.8"
        height="10.8"
        rx="1.6"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M1.6 6.1h12.8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
