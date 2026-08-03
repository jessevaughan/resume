import { useEffect, useState } from "react";
import { DEFAULT_TRACK, TRACKS, type Track } from "./resume-schema";
import { TRACK_BY_PATH, TRACK_PATHS } from "./tracks";

const stripSlash = (path: string) =>
  path.length > 1 ? path.replace(/\/+$/, "") : path;

function fromPath(pathname: string): Track | undefined {
  return TRACK_BY_PATH[stripSlash(pathname)];
}

function fromQuery(search: string): Track | undefined {
  const value = new URLSearchParams(search).get("track");
  return (TRACKS as readonly string[]).includes(value ?? "")
    ? (value as Track)
    : undefined;
}

function parseTrack(loc: Location): Track {
  return fromPath(loc.pathname) ?? fromQuery(loc.search) ?? DEFAULT_TRACK;
}

/**
 * Build the canonical URL for a track, preserving any params that aren't
 * ours. ?track= is dropped because the path carries it now.
 */
function canonicalUrl(track: Track, from: Location): URL {
  const url = new URL(from.href);
  url.pathname = TRACK_PATHS[track];
  url.searchParams.delete("track");
  return url;
}

/**
 * The track lives in the URL, so a given track is a linkable, printable
 * artifact: / is creative, /engineering is engineering.
 *
 * Two older shapes still resolve and are rewritten in place on arrival, so a
 * link shared before this change still lands somewhere real and the address
 * bar ends up showing the canonical URL either way:
 *   /creative           -> /
 *   /?track=engineering -> /engineering
 *
 * The rewrite uses replaceState so it doesn't add a history entry the reader
 * has to back out of twice. Back/forward stay in sync via popstate.
 */
export function useTrack(): [Track, (track: Track) => void] {
  const [track, setTrackState] = useState<Track>(() =>
    parseTrack(window.location),
  );

  useEffect(() => {
    const onPop = () => setTrackState(parseTrack(window.location));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Normalize a legacy URL to its canonical form, once, on mount. Skipped
  // entirely for cover letters: those are ?letter= URLs that App renders
  // instead of the resume, and rewriting the path would drop the letter.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("letter")) return;
    const url = canonicalUrl(track, window.location);
    if (url.href !== window.location.href) {
      window.history.replaceState({}, "", url);
    }
    // Mount only: after this, setTrack owns the URL.
  }, []);

  const setTrack = (next: Track) => {
    window.history.pushState({}, "", canonicalUrl(next, window.location));
    setTrackState(next);
  };

  return [track, setTrack];
}
