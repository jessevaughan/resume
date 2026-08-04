import { useEffect } from "react";
import { SITE_URL, TRACK_PATHS, type Track } from "./tracks";

function upsert(kind: "name" | "property", key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[${kind}="${key}"]`,
  );
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(kind, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  );
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Title, description, canonical and OG tags, per track.
 *
 * Everything here derives from the resolved resume rather than a second copy
 * of the positioning: the title is documentTitle, which resume-schema.ts
 * already composes, and the description is the summary's opening sentences.
 * Change the copy in src/data/resume.ts and the metadata follows.
 *
 * This runs client-side, which covers the browser tab and the title embedded
 * in a printed PDF. It does NOT cover crawlers or link unfurls — those read
 * the HTML as served. scripts/publish.mjs snapshots each track after this
 * effect has run and writes the result as static HTML, which is what makes
 * the tags real.
 */
export function useDocumentMeta({
  track,
  documentTitle,
  summary,
}: {
  track: Track;
  documentTitle: string;
  summary: string;
}) {
  useEffect(() => {
    // First two sentences, so an unfurl gets whole thoughts rather than a hard
    // cut at whatever character limit the platform happens to use.
    const description = summary
      .split(/(?<=\.)\s+/)
      .slice(0, 2)
      .join(" ");
    const path = TRACK_PATHS[track];
    const url = path === "/" ? SITE_URL : `${SITE_URL}${path}`;

    document.title = documentTitle;
    upsert("name", "description", description);
    upsert("property", "og:title", documentTitle);
    upsert("property", "og:description", description);
    upsert("property", "og:url", url);
    upsert("property", "og:type", "profile");
    upsert("name", "twitter:card", "summary");
    upsertCanonical(url);
  }, [track, documentTitle, summary]);
}
