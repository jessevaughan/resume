// ============================================================
//  Resume schema — the PerTrack model
//
//  My resume ships in two tracks that share one layout family but
//  diverge, bullet by bullet, in positioning:
//    - "creative"    → Creative & Brand Leader  (Track A, index.html)
//    - "engineering" → Design Engineer · Web Architect (Track B, index-b.html)
//
//  I author every field once. A field is either shared across both tracks
//  (a plain value) or split per track (wrapped with perTrack()).
//  resolveResume(data, track) collapses the authoring shape into a flat
//  ResolvedResume the components render. Nothing in the component tree
//  knows about tracks; it only ever sees resolved values.
// ============================================================

import type { Track } from "./tracks";
export { TRACKS, DEFAULT_TRACK, type Track } from "./tracks";

/**
 * A value that differs by track. Tagged with `_perTrack` so resolve()
 * can distinguish it from a plain object of the same shape (e.g. a
 * SkillGroup) without guesswork. The per-track keys derive from Track, so
 * renaming a track in tracks.ts updates this type automatically.
 */
export type PerTrack<T> = { readonly [K in Track]: T } & {
  readonly _perTrack: true;
};

/** Author a value that differs by track. */
export function perTrack<T>(creative: T, engineering: T): PerTrack<T> {
  return { creative, engineering, _perTrack: true };
}

/** An authored value: shared across tracks, or split with perTrack(). */
export type Tracked<T> = T | PerTrack<T>;

function isPerTrack<T>(value: Tracked<T>): value is PerTrack<T> {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as PerTrack<T>)._perTrack === true
  );
}

/** Collapse one authored value down to the given track. */
export function resolve<T>(value: Tracked<T>, track: Track): T {
  return isPerTrack(value) ? value[track] : value;
}

// ---- authoring shape (what src/data/resume.ts fills in) ----

export interface Contact {
  /** Display text for the site, e.g. "jessevaughan.com". */
  site: string;
  /**
   * Where the site link actually points. Lets the printed text stay short
   * while the href carries the full canonical URL (www, https). Defaults to
   * https:// + `site` when omitted.
   */
  siteUrl?: string;
  email: string;
  phone: string;
  /** Optional display text, e.g. "in/jessesvaughan". */
  linkedin?: string;
  /**
   * Where the LinkedIn link points. Same display/href split as siteUrl, so the
   * printed text can be short while the href stays a real profile URL.
   * Defaults to https:// + `linkedin` when omitted.
   */
  linkedinUrl?: string;
  location: string;
}

/** Values are stored bare ("jessevaughan.com"), so add a scheme for the href. */
const withScheme = (value: string) =>
  /^https?:\/\//.test(value) ? value : `https://${value}`;

/**
 * Where the site link points. `siteUrl` wins when set; otherwise the bare
 * `site` value gets a scheme. Every consumer goes through this so the
 * fallback documented on Contact.siteUrl lives in exactly one place.
 */
export const siteHref = (contact: Contact) =>
  contact.siteUrl ?? withScheme(contact.site);

/**
 * Same display/href split for LinkedIn. Unlike `site`, the display value is
 * itself optional, so this returns undefined when there's no profile to point
 * at — the case Masthead already guards on before rendering the link.
 */
export const linkedinHref = (contact: Contact) =>
  contact.linkedinUrl ??
  (contact.linkedin ? withScheme(contact.linkedin) : undefined);

/**
 * The "Functional title. Title of record is Senior Manager, Creative."
 * disclaimer. The text is identical across tracks; only where I place it
 * relative to the bullets differs — above them on Track A, below them
 * on Track B. That divergence is placement, not copy, so it lives here.
 */
export interface JobNote {
  text: string;
  placement: Tracked<"top" | "bottom">;
}

export interface Job {
  /** Title of record line. Diverges only on the earliest (IC) role. */
  title: Tracked<string>;
  /** "Company · date-range". Shared: same employers, same dates. */
  company: string;
  dates: string;
  /** One-line role framing. Only the current role carries one. */
  lede?: Tracked<string>;
  note?: JobNote;
  /** On engineering I leave some roles title-only, hence a possibly empty list. */
  bullets: Tracked<string[]>;
}

export interface SkillGroup {
  heading: string;
  /** Rendered joined by a middot; I keep it structured so it stays typed. */
  items: string[];
}

export interface Education {
  degree: string;
  focus: string;
  school: string;
}

export interface ResumeData {
  name: string;
  role: Tracked<string>;
  contact: Contact;
  summary: Tracked<string>;
  highlights: Tracked<string[]>;
  experience: Job[];
  skills: {
    heading: Tracked<string>;
    groups: Tracked<SkillGroup[]>;
  };
  education: Education;
}

// ---- resolved shape (what components consume) ----

export interface ResolvedJob {
  title: string;
  company: string;
  dates: string;
  lede?: string;
  note?: { text: string; placement: "top" | "bottom" };
  bullets: string[];
}

export interface ResolvedResume {
  track: Track;
  name: string;
  role: string;
  /** Browser <title>, e.g. "Jesse Vaughan — Design Engineer · Web Architect". */
  documentTitle: string;
  contact: Contact;
  summary: string;
  highlights: string[];
  experience: ResolvedJob[];
  skills: {
    heading: string;
    groups: SkillGroup[];
  };
  education: Education;
}

/** Collapse the full authoring model down to a single track. */
export function resolveResume(data: ResumeData, track: Track): ResolvedResume {
  const role = resolve(data.role, track);
  return {
    track,
    name: data.name,
    role,
    documentTitle: `${data.name} — ${role}`,
    contact: data.contact,
    summary: resolve(data.summary, track),
    highlights: resolve(data.highlights, track),
    experience: data.experience.map((job) => ({
      title: resolve(job.title, track),
      company: job.company,
      dates: job.dates,
      lede: job.lede === undefined ? undefined : resolve(job.lede, track),
      note:
        job.note === undefined
          ? undefined
          : {
              text: job.note.text,
              placement: resolve(job.note.placement, track),
            },
      bullets: resolve(job.bullets, track),
    })),
    skills: {
      heading: resolve(data.skills.heading, track),
      groups: resolve(data.skills.groups, track),
    },
    education: data.education,
  };
}
